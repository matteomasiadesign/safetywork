"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toServiceItem } from "@/lib/data/serviceMapper";
import { slugify } from "@/lib/utils/slug";
import { sortEditions } from "@/lib/courses/format";
import { IMAGE_BUCKET, storagePathFromUrl } from "@/lib/images/storage";
import { CONTENT_DEFAULTS, isContentKey, type ContentKey } from "@/lib/content/schema";
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

const COURSE_SELECT =
  "*, category:categories(id, name, slug, sort_order), editions:course_editions(id, course_id, start_date, end_date, location, notes)";

const toCourse = (row: unknown): Course => {
  const course = row as Course;
  return { ...course, editions: sortEditions(course.editions) };
};
const INQUIRY_LIMIT = 500;
const INQUIRY_POLL_MS = 60_000;
const ORPHAN_MIN_AGE_MS = 10 * 60 * 1000; // non toccare file caricati negli ultimi 10 minuti
const IMAGE_FOLDERS = ["courses", "services", "content"] as const;

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

/** Una data del corso nel modulo admin; senza id = nuova. */
export type EditionInput = {
  id?: string;
  start_date: string;
  end_date: string | null;
  location: string | null;
  notes: string | null;
};

export type AgendaEventInput = Omit<AgendaEvent, "id" | "created_at">;

/** Valori dei contenuti del sito da salvare: stringa = nuovo valore, null = torna al testo originale. */
export type SiteContentChanges = Partial<Record<ContentKey, string | null>>;

/** Valori personalizzati salvati nel database (le chiavi assenti usano il testo originale). */
export type SiteContentOverrides = Partial<Record<ContentKey, string>>;

export type CourseFlags = Partial<Pick<CourseInput, "is_featured" | "is_open_for_enrollment" | "is_published">>;

interface AdminDataContextType {
  categories: Category[];
  courses: Course[];
  services: ServiceItem[];
  inquiries: Inquiry[];
  events: AgendaEvent[];
  siteContent: SiteContentOverrides;
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;

  addCategory: (name: string) => Promise<Category>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  /**
   * imageFile: foto già compressa da caricare; viene salvata solo se il corso viene salvato.
   * editions: elenco completo delle date del corso (quelle assenti dall'elenco vengono eliminate);
   * se omesso le date non vengono toccate.
   */
  saveCourse: (
    input: CourseInput,
    id?: string,
    imageFile?: File | null,
    editions?: EditionInput[]
  ) => Promise<Course>;
  setCourseFlags: (id: string, flags: CourseFlags) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  duplicateCourse: (id: string) => Promise<Course>;
  /** Salva il nuovo ordine dei corsi (elenco completo degli id, nell'ordine voluto). */
  reorderCourses: (orderedIds: string[]) => Promise<void>;

  saveService: (input: ServiceInput, id?: string, imageFile?: File | null) => Promise<ServiceItem>;
  deleteService: (id: string) => Promise<void>;

  updateInquiry: (id: string, patch: { status?: InquiryStatus; notes?: string }) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;

  saveEvent: (input: AgendaEventInput, id?: string) => Promise<AgendaEvent>;
  deleteEvent: (id: string) => Promise<void>;

  /** images: foto già compresse, indicate per chiave; vengono caricate solo se il salvataggio va a buon fine. */
  saveSiteContent: (changes: SiteContentChanges, images?: Partial<Record<ContentKey, File>>) => Promise<void>;

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
    editionLabel: row.edition_label ?? undefined,
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

function rowsToOverrides(rows: { key: string; value: string }[]): SiteContentOverrides {
  const overrides: SiteContentOverrides = {};
  for (const row of rows) if (isContentKey(row.key)) overrides[row.key] = row.value;
  return overrides;
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
  const [siteContent, setSiteContent] = useState<SiteContentOverrides>({});
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
      const [cats, crs, srv, evt, cnt] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order").order("name"),
        supabase.from("courses").select(COURSE_SELECT).order("sort_order").order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("sort_order").order("code"),
        supabase.from("agenda_events").select("*").order("start_date").order("start_time"),
        supabase.from("site_content").select("key, value"),
      ]);
      const failed = cats.error || crs.error || srv.error || evt.error || cnt.error;
      if (failed) throw new Error(errorMessage(failed));

      setCategories(cats.data ?? []);
      setCourses((crs.data ?? []).map(toCourse));
      setServices((srv.data ?? []).map(toServiceItem));
      setEvents((evt.data ?? []).map(rowToEvent));
      setSiteContent(rowsToOverrides(cnt.data ?? []));
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
      const [usedByCourse, usedByService, usedByContent] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("image_url", url),
        supabase.from("services").select("id", { count: "exact", head: true }).eq("image_url", url),
        supabase.from("site_content").select("key", { count: "exact", head: true }).eq("value", url),
      ]);
      // Nel dubbio (errore di lettura) il file si tiene: meglio un orfano che un'immagine rotta.
      if (usedByCourse.error || usedByService.error || usedByContent.error) return;
      if ((usedByCourse.count ?? 0) > 0 || (usedByService.count ?? 0) > 0 || (usedByContent.count ?? 0) > 0) return;

      await removeFromStorage([path]);
    },
    [getSupabase, removeFromStorage]
  );

  const cleanupOrphanImages = useCallback(async (): Promise<number> => {
    const supabase = getSupabase();

    const [crs, srv, cnt] = await Promise.all([
      supabase.from("courses").select("image_url"),
      supabase.from("services").select("image_url"),
      supabase.from("site_content").select("value"),
    ]);
    if (crs.error || srv.error || cnt.error) throw new Error(errorMessage((crs.error || srv.error || cnt.error)!));

    const used = new Set<string>();
    [
      ...(crs.data ?? []).map((row) => row.image_url),
      ...(srv.data ?? []).map((row) => row.image_url),
      ...(cnt.data ?? []).map((row) => row.value),
    ].forEach((url) => {
      const path = storagePathFromUrl(url);
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
    async (input: CourseInput, id?: string, imageFile?: File | null, editions?: EditionInput[]): Promise<Course> => {
      const supabase = getSupabase();
      const previousCourse = id ? courses.find((c) => c.id === id) : undefined;
      const previousImage = previousCourse?.image_url ?? null;

      let uploadedPath: string | null = null;
      const payload = { ...input };
      // Un corso nuovo (o duplicato) va in fondo all'elenco; poi si sposta con il drag & drop.
      if (!id) payload.sort_order = courses.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1;
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

      let saved = toCourse(data);
      setCourses((prev) => (id ? prev.map((c) => (c.id === id ? saved : c)) : [...prev, saved]));

      // Immagine sostituita: la vecchia (se nostra e non più usata) va rimossa.
      if (previousImage && previousImage !== saved.image_url) await removeImageIfUnused(previousImage);

      // Date del corso: si allinea il database all'elenco inviato dal modulo.
      let editionsError: string | null = null;
      if (editions) {
        try {
          const keepIds = new Set(editions.filter((e) => e.id).map((e) => e.id as string));
          const removeIds = (previousCourse?.editions ?? []).map((e) => e.id).filter((eid) => !keepIds.has(eid));

          if (removeIds.length > 0) {
            const { error: delError } = await supabase.from("course_editions").delete().in("id", removeIds);
            if (delError) throw new Error(errorMessage(delError));
          }

          const rowOf = (e: EditionInput) => ({
            course_id: saved.id,
            start_date: e.start_date,
            end_date: e.end_date,
            location: e.location,
            notes: e.notes,
          });

          const existing = editions.filter((e) => e.id).map((e) => ({ id: e.id as string, ...rowOf(e) }));
          if (existing.length > 0) {
            const { error: upError } = await supabase.from("course_editions").upsert(existing, { onConflict: "id" });
            if (upError) throw new Error(errorMessage(upError));
          }

          const fresh = editions.filter((e) => !e.id).map(rowOf);
          if (fresh.length > 0) {
            const { error: insError } = await supabase.from("course_editions").insert(fresh);
            if (insError) throw new Error(errorMessage(insError));
          }
        } catch (err) {
          editionsError = err instanceof Error ? err.message : "errore sconosciuto";
        }

        // Stato locale = quello che c'è davvero nel database (anche se qualche data non è stata salvata).
        const { data: refreshed } = await supabase.from("courses").select(COURSE_SELECT).eq("id", saved.id).single();
        if (refreshed) {
          saved = toCourse(refreshed);
          setCourses((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
        }
      }

      await notifyPublicSite();
      if (editionsError) {
        throw new Error(`Il corso è stato salvato ma le date no: ${editionsError}. Riapri il corso e riprova.`);
      }
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

      setCourses((prev) => prev.map((c) => (c.id === id ? toCourse(data) : c)));
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

      const { category: _category, editions: _editions, id: _id, created_at: _c, updated_at: _u, ...fields } = original;
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

  const reorderCourses = useCallback(
    async (orderedIds: string[]) => {
      const supabase = getSupabase();
      const position = new Map(orderedIds.map((id, index) => [id, index + 1]));
      // Si scrivono solo i corsi che hanno cambiato posizione.
      const changed = courses.filter((c) => position.has(c.id) && position.get(c.id) !== c.sort_order);

      const results = await Promise.all(
        changed.map((c) => supabase.from("courses").update({ sort_order: position.get(c.id) as number }).eq("id", c.id))
      );
      const failed = results.find((result) => result.error);

      // Lo stato locale segue il database: i salvataggi riusciti restano anche se uno è fallito.
      const saved = new Map(changed.filter((_, index) => !results[index].error).map((c) => [c.id, position.get(c.id) as number]));
      setCourses((prev) =>
        prev
          .map((c) => (saved.has(c.id) ? { ...c, sort_order: saved.get(c.id) as number } : c))
          .sort((a, b) => a.sort_order - b.sort_order)
      );

      await notifyPublicSite();
      if (failed?.error) throw new Error(`Ordine salvato solo in parte: ${errorMessage(failed.error)}`);
    },
    [courses, getSupabase]
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

  // ------------------------------------------------------------ contenuti del sito
  const saveSiteContent = useCallback(
    async (changes: SiteContentChanges, images: Partial<Record<ContentKey, File>> = {}) => {
      const supabase = getSupabase();
      const keys = (Object.keys(changes) as ContentKey[]).filter((key) => isContentKey(key));
      if (keys.length === 0) return;

      // 1. Foto nuove su Storage (se poi il database rifiuta le modifiche vengono rimosse).
      const uploadedPaths: string[] = [];
      const values: Record<string, string | null> = {};
      try {
        for (const key of keys) {
          const file = images[key];
          if (file) {
            const uploaded = await uploadImage(file, "content");
            uploadedPaths.push(uploaded.path);
            values[key] = uploaded.url;
          } else {
            values[key] = changes[key] ?? null;
          }
        }

        const toSave = keys.filter((key) => values[key] !== null).map((key) => ({ key, value: values[key] as string }));
        const toReset = keys.filter((key) => values[key] === null);

        if (toSave.length > 0) {
          const { error } = await supabase.from("site_content").upsert(toSave, { onConflict: "key" });
          if (error) throw new Error(errorMessage(error));
        }
        if (toReset.length > 0) {
          const { error } = await supabase.from("site_content").delete().in("key", toReset);
          if (error) throw new Error(errorMessage(error));
        }
      } catch (err) {
        await removeFromStorage(uploadedPaths);
        throw err;
      }

      // 2. Stato locale allineato al database.
      const previous = siteContent;
      setSiteContent((prev) => {
        const next = { ...prev };
        for (const key of keys) {
          const value = values[key];
          if (value === null) delete next[key];
          else next[key] = value;
        }
        return next;
      });

      // 3. Le vecchie immagini (se nostre e non più usate) vanno rimosse da Storage.
      for (const key of keys) {
        const old = previous[key];
        if (old && old !== values[key] && old !== CONTENT_DEFAULTS[key]) await removeImageIfUnused(old);
      }

      await notifyPublicSite();
    },
    [getSupabase, removeFromStorage, removeImageIfUnused, siteContent, uploadImage]
  );

  const value = useMemo<AdminDataContextType>(
    () => ({
      categories,
      courses,
      services,
      inquiries,
      events,
      siteContent,
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
      reorderCourses,
      saveService,
      deleteService,
      updateInquiry,
      deleteInquiry,
      saveEvent,
      deleteEvent,
      saveSiteContent,
      cleanupOrphanImages,
    }),
    [
      categories,
      courses,
      services,
      inquiries,
      events,
      siteContent,
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
      reorderCourses,
      saveService,
      deleteService,
      updateInquiry,
      deleteInquiry,
      saveEvent,
      deleteEvent,
      saveSiteContent,
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
