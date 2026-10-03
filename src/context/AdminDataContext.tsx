"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toServiceItem } from "@/lib/data/serviceMapper";
import { slugify } from "@/lib/utils/slug";
import { IMAGE_BUCKET, storagePathFromUrl } from "@/lib/images/storage";
import { MAX_IMAGE_BYTES } from "@/lib/images/compress";
import type {
  AgendaEvent,
  AgendaEventStatus,
  AgendaEventType,
  Category,
  Course,
  Inquiry,
  InquiryStatus,
  ServiceItem,
} from "@/lib/types/database";
import type { Tables, TablesInsert } from "@/lib/types/supabase";

/**
 * Dati dell'area admin. Tutto viene letto e scritto su Supabase:
 * nessuna copia locale, nessun aggiornamento ottimistico. Ogni operazione che
 * fallisce solleva un errore che l'interfaccia deve mostrare.
 *
 * Pulizia: quando un corso/servizio viene eliminato o la sua immagine sostituita,
 * il file corrispondente viene rimosso anche da Storage (se nessun altro lo usa).
 */

const COURSE_SELECT = "*, category:categories(id, name, slug, sort_order)";
const INQUIRY_LIMIT = 500;
const INQUIRY_POLL_MS = 60_000;
const ORPHAN_MIN_AGE_MS = 10 * 60 * 1000; // non toccare file caricati negli ultimi 10 minuti
const IMAGE_FOLDERS = ["courses", "services"] as const;

export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

export type CourseInput = Omit<TablesInsert<"courses">, "id" | "created_at" | "updated_at">;

export type ServiceInput = {
  code: string;
  title: string;
  law: string;
  description: string;
  deliverables: string[];
  image_url: string | null;
  icon_name: string;
  badge_color: "cyan" | "orange" | "red";
  is_published: boolean;
};

export type AgendaEventInput = Omit<AgendaEvent, "id" | "created_at">;

export type CourseFlags = Partial<Pick<CourseInput, "is_featured" | "is_open_for_enrollment" | "is_published">>;

interface AdminDataContextType {
  categories: Category[];
  courses: Course[];
  services: ServiceItem[];
  inquiries: Inquiry[];
  events: AgendaEvent[];
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;

  addCategory: (name: string) => Promise<Category>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  /** imageFile: foto già compressa da caricare; viene salvata solo se il corso viene salvato. */
  saveCourse: (input: CourseInput, id?: string, imageFile?: File | null) => Promise<Course>;
  setCourseFlags: (id: string, flags: CourseFlags) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  duplicateCourse: (id: string) => Promise<Course>;

  saveService: (input: ServiceInput, id?: string, imageFile?: File | null) => Promise<ServiceItem>;
  deleteService: (id: string) => Promise<void>;

  updateInquiry: (id: string, patch: { status?: InquiryStatus; notes?: string }) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  saveEvent: (input: AgendaEventInput, id?: string) => Promise<AgendaEvent>;
  deleteEvent: (id: string) => Promise<void>;

  /** Rimuove da Storage le immagini non più usate da nessun corso o servizio. Restituisce quante. */
  cleanupOrphanImages: () => Promise<number>;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

/** Traduce gli errori Postgres/PostgREST più comuni in messaggi comprensibili. */
function errorMessage(error: { message: string; code?: string }): string {
  switch (error.code) {
    case "23505":
      return "Esiste già un elemento con lo stesso nome, slug o codice.";
    case "23503":
      return "L'elemento è ancora collegato ad altri dati e non può essere eliminato.";
    case "23514":
      return "Uno dei valori inseriti non è valido (controlla date, orari e lunghezze).";
    case "42501":
      return "Non hai i permessi per questa operazione. Effettua di nuovo l'accesso.";
    default:
      return error.message;
  }
}

function rowToInquiry(row: Tables<"inquiries">): Inquiry {
  return {
    id: row.id,
    type: row.kind === "corso" || row.kind === "preventivo" ? row.kind : "contatto",
    clientType: row.client_type === "azienda" || row.client_type === "privato" ? row.client_type : undefined,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    company: row.company ?? undefined,
    courseId: row.course_id ?? undefined,
    courseTitle: row.course_title ?? undefined,
    courseSlug: row.course_slug ?? undefined,
    participantsCount: row.participants_count,
    preferredMode: row.preferred_mode ?? undefined,
    service_type: row.service_type ?? undefined,
    message: row.message ?? undefined,
    status: row.status as InquiryStatus,
    notes: row.notes ?? undefined,
    created_at: row.created_at,
    privacyAcceptedAt: row.privacy_accepted_at,
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,
    fiscalCode: row.fiscal_code ?? undefined,
    birthDate: row.birth_date ?? undefined,
    birthPlace: row.birth_place ?? undefined,
    vatNumber: row.vat_number ?? undefined,
    atecoCode: row.ateco_code ?? undefined,
    sdiCode: row.sdi_code ?? undefined,
    pec: row.pec ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    postalCode: row.postal_code ?? undefined,
  };
}

const hhmm = (time: string | null) => (time ? time.slice(0, 5) : undefined);

function rowToEvent(row: Tables<"agenda_events">): AgendaEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.event_type as AgendaEventType,
    customType: row.custom_type ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    startTime: hhmm(row.start_time),
    endTime: hhmm(row.end_time),
    location: row.location ?? undefined,
    instructor: row.instructor ?? undefined,
    courseId: row.course_id ?? undefined,
    maxParticipants: row.max_participants ?? undefined,
    status: row.status as AgendaEventStatus,
    notes: row.notes ?? undefined,
    created_at: row.created_at,
    inquiryId: row.inquiry_id ?? undefined,
    clientName: row.client_name ?? undefined,
    clientCompany: row.client_company ?? undefined,
    clientPhone: row.client_phone ?? undefined,
    clientEmail: row.client_email ?? undefined,
  };
}

const orNull = (value: string | undefined | null) => (value && value.trim() ? value.trim() : null);

function eventToRow(input: AgendaEventInput): TablesInsert<"agenda_events"> {
  return {
    title: input.title.trim(),
    description: orNull(input.description),
    event_type: input.type,
    custom_type: input.type === "altro" ? orNull(input.customType) : null,
    status: input.status,
    start_date: input.startDate,
    end_date: orNull(input.endDate),
    start_time: orNull(input.startTime),
    end_time: orNull(input.endTime),
    location: orNull(input.location),
    instructor: orNull(input.instructor),
    max_participants: input.maxParticipants ? Number(input.maxParticipants) : null,
    notes: orNull(input.notes),
    course_id: orNull(input.courseId),
    inquiry_id: orNull(input.inquiryId),
    client_name: orNull(input.clientName),
    client_company: orNull(input.clientCompany),
    client_phone: orNull(input.clientPhone),
    client_email: orNull(input.clientEmail),
  };
}

/** Avvisa il sito pubblico che i contenuti sono cambiati (best effort: la cache scade comunque in 60s). */
async function notifyPublicSite() {
  try {
    await fetch("/api/admin/revalidate", { method: "POST" });
  } catch {
    // Non bloccante.
  }
}

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  // Il client browser viene creato una volta sola.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const getSupabase = useCallback(() => {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadInquiries = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(INQUIRY_LIMIT);
    if (error) throw new Error(errorMessage(error));
    setInquiries((data ?? []).map(rowToInquiry));
  }, [getSupabase]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const supabase = getSupabase();
      const [cats, crs, srv, evt] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order").order("name"),
        supabase.from("courses").select(COURSE_SELECT).order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("sort_order").order("code"),
        supabase.from("agenda_events").select("*").order("start_date").order("start_time"),
      ]);
      const failed = cats.error || crs.error || srv.error || evt.error;
      if (failed) throw new Error(errorMessage(failed));

      setCategories(cats.data ?? []);
      setCourses((crs.data ?? []) as unknown as Course[]);
      setServices((srv.data ?? []).map(toServiceItem));
      setEvents((evt.data ?? []).map(rowToEvent));
      await loadInquiries();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Errore di connessione a Supabase.");
    } finally {
      setIsLoading(false);
    }
  }, [getSupabase, loadInquiries]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Le nuove richieste compaiono senza ricaricare la pagina.
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadInquiries().catch(() => undefined);
    }, INQUIRY_POLL_MS);
    return () => clearInterval(timer);
  }, [loadInquiries]);

  // ------------------------------------------------------------------ immagini
  /** Carica una foto già compressa e restituisce l'URL pubblico. */
  const uploadImage = useCallback(
    async (file: File, folder: ImageFolder): Promise<{ url: string; path: string }> => {
      if (file.size > MAX_IMAGE_BYTES) {
        throw new Error("L'immagine supera i 150 kB: comprimila prima del caricamento.");
      }
      if (!["image/webp", "image/jpeg"].includes(file.type)) {
        throw new Error("Formato immagine non valido.");
      }

      const extension = file.type === "image/webp" ? "webp" : "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${extension}`;
      const supabase = getSupabase();

      const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (error) throw new Error(errorMessage(error));

      return { url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl, path };
    },
    [getSupabase]
  );

  const removeFromStorage = useCallback(
    async (paths: string[]) => {
      if (paths.length === 0) return;
      const { error } = await getSupabase().storage.from(IMAGE_BUCKET).remove(paths);
      if (error) console.warn("Pulizia Storage non riuscita:", error.message);
    },
    [getSupabase]
  );

  /**
   * Elimina da Storage l'immagine di un corso/servizio, ma solo se non è un link esterno
   * e se nessun'altra riga la usa ancora (un corso duplicato condivide l'immagine).
   * Da chiamare DOPO aver eliminato/aggiornato la riga nel database.
   */
  const removeImageIfUnused = useCallback(
    async (url: string | null | undefined) => {
      const path = storagePathFromUrl(url);
      if (!path || !url) return;

      const supabase = getSupabase();
      const [usedByCourse, usedByService] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("image_url", url),
        supabase.from("services").select("id", { count: "exact", head: true }).eq("image_url", url),
      ]);
      // Nel dubbio (errore di lettura) il file si tiene: meglio un orfano che un'immagine rotta.
      if (usedByCourse.error || usedByService.error) return;
      if ((usedByCourse.count ?? 0) > 0 || (usedByService.count ?? 0) > 0) return;

      await removeFromStorage([path]);
    },
    [getSupabase, removeFromStorage]
  );

  const cleanupOrphanImages = useCallback(async (): Promise<number> => {
    const supabase = getSupabase();

    const [crs, srv] = await Promise.all([
      supabase.from("courses").select("image_url"),
      supabase.from("services").select("image_url"),
    ]);
    if (crs.error || srv.error) throw new Error(errorMessage((crs.error || srv.error)!));

    const used = new Set<string>();
    [...(crs.data ?? []), ...(srv.data ?? [])].forEach((row) => {
      const path = storagePathFromUrl(row.image_url);
      if (path) used.add(path);
    });

    const orphans: string[] = [];
    for (const folder of IMAGE_FOLDERS) {
      let offset = 0;
      for (;;) {
        const { data, error } = await supabase.storage.from(IMAGE_BUCKET).list(folder, { limit: 100, offset });
        if (error) throw new Error(errorMessage(error));
        if (!data || data.length === 0) break;

        data.forEach((item) => {
          if (!item.id) return; // cartella
          const path = `${folder}/${item.name}`;
          const age = Date.now() - new Date(item.created_at ?? 0).getTime();
          if (!used.has(path) && age > ORPHAN_MIN_AGE_MS) orphans.push(path);
        });

        if (data.length < 100) break;
        offset += 100;
      }
    }

    for (let i = 0; i < orphans.length; i += 100) {
      const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(orphans.slice(i, i + 100));
      if (error) throw new Error(errorMessage(error));
    }
    return orphans.length;
  }, [getSupabase]);

  // ---------------------------------------------------------------- categorie
  const addCategory = useCallback(
    async (name: string): Promise<Category> => {
      const trimmed = name.trim();
      const slug = slugify(trimmed);
      if (!trimmed || !slug) throw new Error("Inserisci un nome di categoria valido.");

      const nextOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1;
      const { data, error } = await getSupabase()
        .from("categories")
        .insert({ name: trimmed, slug, sort_order: nextOrder })
        .select()
        .single();
      if (error) throw new Error(errorMessage(error));

      setCategories((prev) => [...prev, data]);
      await notifyPublicSite();
      return data;
    },
    [categories, getSupabase]
  );

  const renameCategory = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim();
      const slug = slugify(trimmed);
      if (!trimmed || !slug) throw new Error("Inserisci un nome di categoria valido.");

      const { data, error } = await getSupabase()
        .from("categories")
        .update({ name: trimmed, slug })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(errorMessage(error));

      setCategories((prev) => prev.map((c) => (c.id === id ? data : c)));
      setCourses((prev) =>
        prev.map((c) =>
          c.category_id === id
            ? { ...c, category: { id: data.id, name: data.name, slug: data.slug, sort_order: data.sort_order } }
            : c
        )
      );
      await notifyPublicSite();
    },
    [getSupabase]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const fallback = categories.find((c) => c.id !== id);
      if (!fallback) throw new Error("Non puoi eliminare l'unica categoria rimasta.");
      const supabase = getSupabase();

      // I corsi della categoria vengono spostati nella prima categoria rimasta.
      const { error: moveError } = await supabase
        .from("courses")
        .update({ category_id: fallback.id })
        .eq("category_id", id);
      if (moveError) throw new Error(errorMessage(moveError));

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(errorMessage(error));

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setCourses((prev) =>
        prev.map((c) =>
          c.category_id === id
            ? {
                ...c,
                category_id: fallback.id,
                category: {
                  id: fallback.id,
                  name: fallback.name,
                  slug: fallback.slug,
                  sort_order: fallback.sort_order,
                },
              }
            : c
        )
      );
      await notifyPublicSite();
    },
    [categories, getSupabase]
  );

  // -------------------------------------------------------------------- corsi
  const saveCourse = useCallback(
    async (input: CourseInput, id?: string, imageFile?: File | null): Promise<Course> => {
      const supabase = getSupabase();
      const previousImage = id ? courses.find((c) => c.id === id)?.image_url : null;

      let uploadedPath: string | null = null;
      const payload = { ...input };
      if (imageFile) {
        const uploaded = await uploadImage(imageFile, "courses");
        uploadedPath = uploaded.path;
        payload.image_url = uploaded.url;
      }

      const query = id
        ? supabase.from("courses").update(payload).eq("id", id)
        : supabase.from("courses").insert(payload);
      const { data, error } = await query.select(COURSE_SELECT).single();

      if (error) {
        // Il corso non è stato salvato: la foto appena caricata non deve restare in Storage.
        if (uploadedPath) await removeFromStorage([uploadedPath]);
        throw new Error(errorMessage(error));
      }

      const saved = data as unknown as Course;
      setCourses((prev) => (id ? prev.map((c) => (c.id === id ? saved : c)) : [saved, ...prev]));

      // Immagine sostituita: la vecchia (se nostra e non più usata) va rimossa.
      if (previousImage && previousImage !== saved.image_url) await removeImageIfUnused(previousImage);

      await notifyPublicSite();
      return saved;
    },
    [courses, getSupabase, removeFromStorage, removeImageIfUnused, uploadImage]
  );

  const setCourseFlags = useCallback(
    async (id: string, flags: CourseFlags) => {
      const { data, error } = await getSupabase()
        .from("courses")
        .update(flags)
        .eq("id", id)
        .select(COURSE_SELECT)
        .single();
      if (error) throw new Error(errorMessage(error));

      setCourses((prev) => prev.map((c) => (c.id === id ? (data as unknown as Course) : c)));
      await notifyPublicSite();
    },
    [getSupabase]
  );

  const deleteCourse = useCallback(
    async (id: string) => {
      const image = courses.find((c) => c.id === id)?.image_url;

      const { error } = await getSupabase().from("courses").delete().eq("id", id);
      if (error) throw new Error(errorMessage(error));

      setCourses((prev) => prev.filter((c) => c.id !== id));
      // Il database azzera i collegamenti: lo stato locale si allinea.
      setEvents((prev) => prev.map((e) => (e.courseId === id ? { ...e, courseId: undefined } : e)));
      setInquiries((prev) => prev.map((i) => (i.courseId === id ? { ...i, courseId: undefined } : i)));

      await removeImageIfUnused(image);
      await notifyPublicSite();
    },
    [courses, getSupabase, removeImageIfUnused]
  );

  const duplicateCourse = useCallback(
    async (id: string): Promise<Course> => {
      const original = courses.find((c) => c.id === id);
      if (!original) throw new Error("Corso non trovato.");

      const { category: _category, id: _id, created_at: _c, updated_at: _u, ...fields } = original;
      return saveCourse({
        ...fields,
        title: `${original.title} (Copia)`,
        slug: `${original.slug}-copia-${Date.now().toString(36).slice(-4)}`,
        is_published: false,
        is_featured: false,
      });
    },
    [courses, saveCourse]
  );

  // ------------------------------------------------------------------ servizi
  const saveService = useCallback(
    async (input: ServiceInput, id?: string, imageFile?: File | null): Promise<ServiceItem> => {
      const supabase = getSupabase();
      const previousImage = id ? services.find((s) => s.id === id)?.image_url : null;

      let uploadedPath: string | null = null;
      const payload = { ...input };
      if (imageFile) {
        const uploaded = await uploadImage(imageFile, "services");
        uploadedPath = uploaded.path;
        payload.image_url = uploaded.url;
      }

      const nextOrder = services.reduce((max, s) => Math.max(max, s.sort_order), 0) + 1;
      const query = id
        ? supabase.from("services").update(payload).eq("id", id)
        : supabase.from("services").insert({ ...payload, sort_order: nextOrder });
      const { data, error } = await query.select().single();

      if (error) {
        if (uploadedPath) await removeFromStorage([uploadedPath]);
        throw new Error(errorMessage(error));
      }

      const saved = toServiceItem(data);
      setServices((prev) => (id ? prev.map((s) => (s.id === id ? saved : s)) : [...prev, saved]));

      if (previousImage && previousImage !== saved.image_url) await removeImageIfUnused(previousImage);

      await notifyPublicSite();
      return saved;
    },
    [getSupabase, removeFromStorage, removeImageIfUnused, services, uploadImage]
  );

  const deleteService = useCallback(
    async (id: string) => {
      const image = services.find((s) => s.id === id)?.image_url;

      const { error } = await getSupabase().from("services").delete().eq("id", id);
      if (error) throw new Error(errorMessage(error));

      setServices((prev) => prev.filter((s) => s.id !== id));
      await removeImageIfUnused(image);
      await notifyPublicSite();
    },
    [getSupabase, removeImageIfUnused, services]
  );

  // ----------------------------------------------------------------- richieste
  const updateInquiry = useCallback(
    async (id: string, patch: { status?: InquiryStatus; notes?: string }) => {
      const { data, error } = await getSupabase()
        .from("inquiries")
        .update({ status: patch.status, notes: patch.notes })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(errorMessage(error));

      setInquiries((prev) => prev.map((i) => (i.id === id ? rowToInquiry(data) : i)));
    },
    [getSupabase]
  );

  const deleteInquiry = useCallback(
    async (id: string) => {
      const { error } = await getSupabase().from("inquiries").delete().eq("id", id);
      if (error) throw new Error(errorMessage(error));

      setInquiries((prev) => prev.filter((i) => i.id !== id));
      // Gli impegni in agenda restano (con i dati del cliente) ma perdono il collegamento.
      setEvents((prev) => prev.map((e) => (e.inquiryId === id ? { ...e, inquiryId: undefined } : e)));
    },
    [getSupabase]
  );

  // ------------------------------------------------------------------- agenda
  const saveEvent = useCallback(
    async (input: AgendaEventInput, id?: string): Promise<AgendaEvent> => {
      const supabase = getSupabase();
      const row = eventToRow(input);
      const query = id
        ? supabase.from("agenda_events").update(row).eq("id", id)
        : supabase.from("agenda_events").insert(row);
      const { data, error } = await query.select().single();
      if (error) throw new Error(errorMessage(error));

      const saved = rowToEvent(data);
      setEvents((prev) => {
        const next = id ? prev.map((e) => (e.id === id ? saved : e)) : [...prev, saved];
        return next.sort((a, b) =>
          `${a.startDate} ${a.startTime ?? ""}`.localeCompare(`${b.startDate} ${b.startTime ?? ""}`)
        );
      });
      return saved;
    },
    [getSupabase]
  );

  const deleteEvent = useCallback(
    async (id: string) => {
      const { error } = await getSupabase().from("agenda_events").delete().eq("id", id);
      if (error) throw new Error(errorMessage(error));

      setEvents((prev) => prev.filter((e) => e.id !== id));
    },
    [getSupabase]
  );

  const value = useMemo<AdminDataContextType>(
    () => ({
      categories,
      courses,
      services,
      inquiries,
      events,
      isLoading,
      loadError,
      reload,
      addCategory,
      renameCategory,
      deleteCategory,
      saveCourse,
      setCourseFlags,
      deleteCourse,
      duplicateCourse,
      saveService,
      deleteService,
      updateInquiry,
      deleteInquiry,
      saveEvent,
      deleteEvent,
      cleanupOrphanImages,
    }),
    [
      categories,
      courses,
      services,
      inquiries,
      events,
      isLoading,
      loadError,
      reload,
      addCategory,
      renameCategory,
      deleteCategory,
      saveCourse,
      setCourseFlags,
      deleteCourse,
      duplicateCourse,
      saveService,
      deleteService,
      updateInquiry,
      deleteInquiry,
      saveEvent,
      deleteEvent,
      cleanupOrphanImages,
    ]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData deve essere usato dentro AdminDataProvider");
  }
  return context;
}
