"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "@/components/ui/Link";
import type { Category, Course } from "@/lib/types/database";
import type { CourseFlags, CourseInput, EditionInput } from "@/context/AdminDataContext";
import {
  MODE_OPTIONS,
  formatEditionDates,
  isUpcoming,
  modeLabel,
  modeNeedsLocation,
  normalizeMode,
  upcomingEditions,
} from "@/lib/courses/format";
import { slugify } from "@/lib/utils/slug";
import AdminModal from "@/components/admin/ui/AdminModal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import SectionHeader from "@/components/admin/ui/SectionHeader";
import { btnOutline, btnPrimary, btnSecondary, btnTeal } from "@/components/admin/ui/styles";
import { compressImage, formatBytes } from "@/lib/images/compress";
import {
  BookOpen,
  Plus,
  Search,
  X,
  Tag,
  LayoutGrid,
  List,
  Sparkles,
  Clock,
  Calendar,
  MapPin,
  Users,
  Award,
  ExternalLink,
  Copy,
  Edit2,
  Trash2,
  Check,
  Upload,
  Info,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";

export const COURSE_IMAGE_PRESETS = [
  {
    label: "Cantiere & Costruzioni",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Antincendio & Emergenze",
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Primo Soccorso Medico",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Carrelli & Muletti",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Lavori in Quota & DPI 3ª Cat",
    url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Dirigenza & RSPP",
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Formazione Lavoratori Generale",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Ufficio & VDT",
    url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80",
  },
];

type StatusFilter = "all" | "open" | "featured" | "in_person" | "draft";

/** Filtri per stato: colori da "acceso" (selezionato) e "spento". */
const STATUS_CHIPS: {
  id: StatusFilter;
  label: string;
  stat: "openEnrollment" | "featured" | "drafts" | "inPerson" | null;
  on: string;
  off: string;
  countOff: string;
  dot?: string;
  icon?: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "all", label: "Tutti", stat: null, on: "bg-slate-900 text-white", off: "bg-slate-50 text-slate-600 border-slate-200/60", countOff: "bg-slate-200/70 text-slate-600" },
  { id: "open", label: "Iscrizioni aperte", stat: "openEnrollment", on: "bg-emerald-600 text-white", off: "bg-emerald-50 text-emerald-800 border-emerald-200/60", countOff: "bg-emerald-200/60 text-emerald-800", dot: "bg-emerald-500" },
  { id: "featured", label: "In evidenza", stat: "featured", on: "bg-[#f58220] text-white", off: "bg-amber-50 text-amber-800 border-amber-200/60", countOff: "bg-amber-200/60 text-amber-800", icon: Sparkles },
  { id: "in_person", label: "In presenza", stat: "inPerson", on: "bg-[#008e97] text-white", off: "bg-cyan-50 text-cyan-800 border-cyan-200/60", countOff: "bg-cyan-200/60 text-cyan-800", icon: MapPin },
  { id: "draft", label: "Bozze", stat: "drafts", on: "bg-slate-700 text-white", off: "bg-slate-50 text-slate-600 border-slate-200/60", countOff: "bg-slate-200/70 text-slate-600" },
];

/** Passaggi della procedura guidata (colori propri di ciascun passaggio). */
const WIZARD_STEPS = [
  { n: 1, title: "Base", sub: "Titolo & Categoria", active: "border-[#008e97]/30 bg-[#e6f6f7] text-[#008e97]", badge: "bg-[#008e97]" },
  { n: 2, title: "Sede & Ore", sub: "Modalità & Date", active: "border-[#f58220]/40 bg-[#fff4ea] text-[#f58220]", badge: "bg-[#f58220]" },
  { n: 3, title: "Didattica", sub: "Programma & Test", active: "border-red-200 bg-red-50 text-[#df0000]", badge: "bg-[#df0000]" },
  { n: 4, title: "Media & Pubblica", sub: "Foto & Visibilità", active: "border-[#008e97]/40 bg-[#e6f6f7] text-[#008e97]", badge: "bg-[#008e97]" },
];

interface CoursesManagerProps {
  courses: Course[];
  categories: Category[];
  onSaveCourse: (
    input: CourseInput,
    id?: string,
    imageFile?: File | null,
    editions?: EditionInput[]
  ) => Promise<unknown>;
  onToggleCourse: (id: string, flags: CourseFlags) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onDuplicateCourse: (id: string) => Promise<unknown>;
  onAddCategory: (name: string) => Promise<Category>;
  onNavigateToCategories: () => void;
  showToast: (msg: string, tone?: "success" | "error") => void;
  /** Foto mostrata sul sito per i corsi senza copertina (si cambia in “Contenuti del sito”). */
  fallbackImage: string;
}

type CourseFormState = {
  title: string;
  slug: string;
  category_id: string;
  short_description: string;
  content: string;
  duration_hours: number;
  mode: string;
  validity_years: number;
  normative_ref: string;
  target_audience: string;
  certification_issued: string;
  image_url: string;
  is_featured: boolean;
  is_open_for_enrollment: boolean;
  is_published: boolean;
};

/** Una data del corso nel modulo; senza id = ancora da salvare. */
type EditionRow = {
  key: string;
  id?: string;
  start_date: string;
  end_date: string;
  location: string;
  notes: string;
};

const newRowKey = () => Math.random().toString(36).slice(2);

const DEFAULT_CONTENT = `### Obiettivi del Corso
Fornire ai partecipanti il quadro completo degli obblighi di legge previsti dal D.Lgs. 81/08 e le competenze operative per prevenire gli infortuni e gestire le misure di sicurezza.

### Articolazione dei Moduli Didattici
1. **Modulo 1 - Normativo e Giuridico (2 ore)**: Responsabilità civili e penali, figure della prevenzione aziendale.
2. **Modulo 2 - Valutazione dei Rischi Specifici (2 ore)**: Metodologie pratiche, ambienti di lavoro, movimentazione carichi.
3. **Modulo 3 - Misure Tecniche ed Organizzative (2 ore)**: Dispositivi di protezione individuale (DPI) e procedure operative.
4. **Modulo 4 - Gestione Emergenze e Primo Intervento (2 ore)**: Piani di evacuazione rapida e comunicazione di soccorso.

### Verifica Finale dell'Apprendimento
Test scritto a risposta multipla finale e colloquio di approfondimento con il docente qualificato.`;

export default function CoursesManager({
  courses,
  categories,
  onSaveCourse,
  onToggleCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onAddCategory,
  onNavigateToCategories,
  showToast,
  fallbackImage,
}: CoursesManagerProps) {
  // View mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tutti");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Modal & Wizard state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isQuickAddCatOpen, setIsQuickAddCatOpen] = useState(false);
  const [quickNewCat, setQuickNewCat] = useState("");
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuCourse, setMenuCourse] = useState<Course | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Foto scelta dal computer: compressa subito, caricata su Storage solo al salvataggio
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState("");

  const resetImageState = () => {
    setCourseForm((prev) => {
      if (prev.image_url.startsWith("blob:")) URL.revokeObjectURL(prev.image_url);
      return prev;
    });
    setPendingImage(null);
    setImageInfo("");
  };

  // Imposta un'immagine da URL o da libreria, scartando l'eventuale foto in attesa
  const setImageUrl = (url: string) => {
    resetImageState();
    setCourseForm((prev) => ({ ...prev, image_url: url }));
  };

  const emptyCourseForm = (): CourseFormState => ({
    title: "",
    slug: "",
    category_id: categories[0]?.id ?? "",
    short_description: "",
    content: DEFAULT_CONTENT,
    duration_hours: 8,
    mode: "presenza",
    validity_years: 5,
    normative_ref: "Art. 37 D.Lgs. 81/08 - Accordo Stato-Regioni",
    target_audience: "Lavoratori, Preposti e Datori di Lavoro",
    certification_issued: "Attestato ufficiale abilitativo valido su tutto il territorio nazionale con verifica finale",
    image_url: "",
    is_featured: false,
    is_open_for_enrollment: true,
    is_published: true,
  });

  // Form State for Course Add / Edit
  const [courseForm, setCourseForm] = useState<CourseFormState>(emptyCourseForm);

  // Date e sedi del corso in modifica
  const [editionRows, setEditionRows] = useState<EditionRow[]>([]);
  const needsLocation = modeNeedsLocation(courseForm.mode);

  const knownLocations = useMemo(
    () =>
      Array.from(new Set(courses.flatMap((c) => c.editions.map((e) => e.location).filter((l): l is string => Boolean(l))))).sort(
        (a, b) => a.localeCompare(b, "it")
      ),
    [courses]
  );

  const updateEditionRow = (key: string, patch: Partial<EditionRow>) =>
    setEditionRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const addEditionRow = () =>
    setEditionRows((rows) => [...rows, { key: newRowKey(), start_date: "", end_date: "", location: "", notes: "" }]);

  const removeEditionRow = (key: string) => setEditionRows((rows) => rows.filter((row) => row.key !== key));

  /** Messaggio d'errore se le date inserite non sono valide, altrimenti null. */
  const validateEditions = (): string | null => {
    for (const [index, row] of editionRows.entries()) {
      const n = index + 1;
      if (!row.start_date) return `Data ${n}: indica il giorno di inizio.`;
      if (row.end_date && row.end_date < row.start_date) return `Data ${n}: la fine non può precedere l'inizio.`;
      if (needsLocation && !row.location.trim()) return `Data ${n}: indica la sede (oppure scegli la modalità Online).`;
    }
    return null;
  };

  // Esegue un'azione su Supabase e mostra l'esito (anche gli errori)
  const runAction = async (action: () => Promise<unknown>, okMessage?: string) => {
    try {
      await action();
      if (okMessage) showToast(okMessage);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Operazione non riuscita.", "error");
    }
  };

  // KPI Statistics
  const stats = useMemo(() => {
    const openEnrollment = courses.filter((c) => c.is_open_for_enrollment).length;
    const featured = courses.filter((c) => c.is_featured).length;
    const drafts = courses.filter((c) => !c.is_published).length;
    const inPerson = courses.filter((c) => normalizeMode(c.mode) !== "online").length;
    return { openEnrollment, featured, drafts, inPerson };
  }, [courses]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Category match
      if (selectedCategory !== "Tutti" && c.category_id !== selectedCategory) {
        return false;
      }

      // Status pill match
      if (statusFilter === "open" && !c.is_open_for_enrollment) return false;
      if (statusFilter === "draft" && c.is_published) return false;
      if (statusFilter === "featured" && !c.is_featured) return false;
      if (statusFilter === "in_person" && normalizeMode(c.mode) === "online") return false;

      // Text search
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchSlug = c.slug.toLowerCase().includes(q);
        const matchNorm = c.normative_ref.toLowerCase().includes(q);
        const matchLoc = c.editions.some((e) => (e.location ?? "").toLowerCase().includes(q));
        const matchDesc = c.short_description.toLowerCase().includes(q);
        const matchCat = c.category.name.toLowerCase().includes(q);
        return matchTitle || matchSlug || matchNorm || matchLoc || matchDesc || matchCat;
      }

      return true;
    });
  }, [courses, selectedCategory, statusFilter, searchQuery]);

  const hasActiveFilters = Boolean(searchQuery) || selectedCategory !== "Tutti" || statusFilter !== "all";
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Tutti");
    setStatusFilter("all");
  };

  // Open Add Course Modal
  const handleOpenAddModal = () => {
    if (categories.length === 0) {
      showToast("Crea prima almeno una categoria.", "error");
      onNavigateToCategories();
      return;
    }
    setEditingCourse(null);
    setCurrentStep(1);
    setIsQuickAddCatOpen(false);
    setQuickNewCat("");
    setCourseForm(emptyCourseForm());
    setEditionRows([]);
    setIsModalOpen(true);
  };

  // Open Edit Course Modal
  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setCurrentStep(1);
    setIsQuickAddCatOpen(false);
    setQuickNewCat("");
    setCourseForm({
      title: course.title,
      slug: course.slug,
      category_id: course.category_id,
      short_description: course.short_description,
      content: course.content,
      duration_hours: course.duration_hours,
      mode: normalizeMode(course.mode),
      validity_years: course.validity_years ?? 0,
      normative_ref: course.normative_ref,
      target_audience: course.target_audience || "",
      certification_issued: course.certification_issued || "",
      image_url: course.image_url || "",
      is_featured: course.is_featured,
      is_open_for_enrollment: course.is_open_for_enrollment,
      is_published: course.is_published,
    });
    setEditionRows(
      course.editions.map((e) => ({
        key: newRowKey(),
        id: e.id,
        start_date: e.start_date,
        end_date: e.end_date ?? "",
        location: e.location ?? "",
        notes: e.notes ?? "",
      }))
    );
    setIsModalOpen(true);
  };

  // Quick Add Category from Wizard
  const handleQuickAddCategory = async () => {
    const name = quickNewCat.trim();
    if (!name) return;
    try {
      const created = await onAddCategory(name);
      setCourseForm((prev) => ({ ...prev, category_id: created.id }));
      setQuickNewCat("");
      setIsQuickAddCatOpen(false);
      showToast(`Categoria "${name}" creata.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Categoria non creata.", "error");
    }
  };

  // Foto dal computer: viene compressa sotto i 150 kB subito, ma caricata solo al salvataggio
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await attachImage(file);
  };

  // Foto tematica: viene scaricata e trattata come un caricamento, così finisce anch'essa su Storage
  const handlePresetPick = async (url: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      await attachImage(new File([blob], "foto-tematica", { type: blob.type }));
    } catch {
      showToast("Non è stato possibile recuperare la foto tematica: riprova o carica una foto dal computer.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const attachImage = async (file: File) => {
    setIsSaving(true);
    try {
      const result = await compressImage(file);
      resetImageState();
      setPendingImage(result.file);
      setCourseForm((prev) => ({ ...prev, image_url: URL.createObjectURL(result.file) }));
      setImageInfo(
        `Ottimizzata: ${formatBytes(result.originalBytes)} → ${formatBytes(result.file.size)} (${result.width}×${result.height} px)`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Immagine non valida.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Chiusura del modale: libera l'anteprima della foto non salvata
  useEffect(() => {
    if (!isModalOpen) resetImageState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // Check step validity before moving next
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!courseForm.title.trim()) {
        showToast("Inserisci il titolo ufficiale del corso per procedere.", "error");
        return false;
      }
      if (!courseForm.category_id) {
        showToast("Seleziona una categoria didattica.", "error");
        return false;
      }
      if (!courseForm.normative_ref.trim()) {
        showToast("Inserisci il riferimento normativo di legge (es. D.Lgs. 81/08).", "error");
        return false;
      }
    } else if (step === 2) {
      if (!courseForm.duration_hours || courseForm.duration_hours < 1) {
        showToast("La durata in ore deve essere di almeno 1 ora.", "error");
        return false;
      }
      const editionsError = validateEditions();
      if (editionsError) {
        showToast(editionsError, "error");
        return false;
      }
    } else if (step === 3) {
      if (!courseForm.short_description.trim()) {
        showToast("Inserisci una breve descrizione sintetica del corso.", "error");
        return false;
      }
      if (!courseForm.content.trim()) {
        showToast("Inserisci il programma didattico dettagliato del corso.", "error");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const closeWizard = () => setIsModalOpen(false);

  // Si può saltare a un passaggio solo se quelli prima sono compilati correttamente
  const goToStep = (target: number) => {
    for (let step = 1; step < target; step++) {
      if (!validateStep(step)) return;
    }
    setCurrentStep(target);
  };

  // Final Form Submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // Invio da tastiera nei primi passaggi = "Avanti" (non deve salvare il corso a metà compilazione)
    if (currentStep < 4) {
      handleNextStep();
      return;
    }

    if (!courseForm.title.trim()) {
      setCurrentStep(1);
      showToast("Il titolo del corso è obbligatorio.", "error");
      return;
    }
    if (!courseForm.category_id) {
      setCurrentStep(1);
      showToast("Seleziona una categoria didattica.", "error");
      return;
    }

    const slug = slugify(courseForm.slug.trim() || courseForm.title);
    if (!slug) {
      setCurrentStep(1);
      showToast("Lo slug non è valido: usa lettere e numeri.", "error");
      return;
    }

    const input: CourseInput = {
      title: courseForm.title.trim(),
      slug,
      category_id: courseForm.category_id,
      short_description: courseForm.short_description.trim(),
      content: courseForm.content.trim(),
      duration_hours: Number(courseForm.duration_hours) || 8,
      mode: courseForm.mode,
      validity_years: Number(courseForm.validity_years) > 0 ? Number(courseForm.validity_years) : null,
      normative_ref: courseForm.normative_ref.trim(),
      target_audience: courseForm.target_audience.trim() || null,
      certification_issued: courseForm.certification_issued.trim() || null,
      // con una foto in attesa il vero URL lo assegna il salvataggio dopo il caricamento
      image_url: pendingImage ? editingCourse?.image_url ?? null : courseForm.image_url || null,
      is_featured: courseForm.is_featured,
      is_open_for_enrollment: courseForm.is_open_for_enrollment,
      is_published: courseForm.is_published,
    };

    const editionsError = validateEditions();
    if (editionsError) {
      setCurrentStep(2);
      showToast(editionsError, "error");
      return;
    }
    const editions: EditionInput[] = editionRows.map((row) => ({
      id: row.id,
      start_date: row.start_date,
      end_date: row.end_date || null,
      location: needsLocation ? row.location.trim() || null : null,
      notes: row.notes.trim() || null,
    }));

    setIsSaving(true);
    try {
      await onSaveCourse(input, editingCourse?.id, pendingImage, editions);
      showToast(
        editingCourse
          ? `Corso "${input.title}" aggiornato.`
          : input.is_published
          ? `Corso "${input.title}" pubblicato.`
          : `Corso "${input.title}" salvato come bozza.`
      );
      setIsModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Salvataggio non riuscito.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeader
        icon={<BookOpen className="h-5 w-5 stroke-[2.2]" />}
        title="Corsi di Formazione"
        count={`${courses.length} corsi`}
        description="Gestisci l'offerta formativa, requisiti normativi, edizioni in programma e iscrizioni aperte."
        actions={
          <>
            {/* La tabella ha senso solo su schermi larghi: su mobile i corsi sono sempre in elenco compatto */}
            <div className="hidden items-center rounded-xl border border-slate-200/80 bg-slate-100 p-1 md:flex">
              {(
                [
                  { id: "grid", label: "Griglia", icon: LayoutGrid, title: "Visualizzazione a griglia (Schede)" },
                  { id: "table", label: "Tabella", icon: List, title: "Visualizzazione a tabella elenco" },
                ] as const
              ).map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setViewMode(view.id)}
                  title={view.title}
                  aria-pressed={viewMode === view.id}
                  className={`flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-all ${
                    viewMode === view.id ? "border border-slate-200 bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <view.icon className="h-3.5 w-3.5 text-[#008e97]" />
                  <span>{view.label}</span>
                </button>
              ))}
            </div>

            <button type="button" onClick={handleOpenAddModal} className={btnPrimary}>
              <Plus className="h-4 w-4" />
              <span>Nuovo Corso</span>
            </button>
          </>
        }
      />

      {/* BARRA STRUMENTI: su mobile ricerca + filtri, sotto gli stati a scorrimento orizzontale */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 lg:order-2 lg:shrink-0">
          <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca corso, sede..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-xs font-medium text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008e97] [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Cancella la ricerca"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Desktop: categoria e scorciatoia alle categorie sempre visibili */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Categoria"
            className="hidden cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97] lg:block"
          >
            <option value="Tutti">Tutte le Categorie ({courses.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({courses.filter((c) => c.category_id === cat.id).length})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onNavigateToCategories}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:bg-[#e6f6f7] hover:text-[#008e97] lg:flex"
            title="Gestisci o riordina categorie didattiche"
            aria-label="Gestisci le categorie"
          >
            <Tag className="h-4 w-4" />
          </button>

          {/* Mobile: tutto il resto dei filtri in un foglio */}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label="Altri filtri"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {selectedCategory !== "Tutti" && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#df0000] text-[10px] font-bold text-white">
                1
              </span>
            )}
          </button>
        </div>

        <div className="-mx-3 flex items-center gap-1.5 overflow-x-auto px-3 no-scrollbar lg:order-1 lg:mx-0 lg:px-0">
          {STATUS_CHIPS.map((chip) => {
            const selected = statusFilter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                aria-pressed={selected}
                className={`flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-bold transition-colors ${
                  selected ? `${chip.on} border-transparent shadow-xs` : `${chip.off} hover:brightness-95`
                }`}
              >
                {chip.dot && <span className={`h-2 w-2 shrink-0 rounded-full ${selected ? "bg-white" : chip.dot}`} />}
                {chip.icon && <chip.icon className="h-3.5 w-3.5 shrink-0" />}
                <span>{chip.label}</span>
                <span className={`rounded-md px-1.5 text-[11px] font-semibold leading-5 ${selected ? "bg-white/20 text-white" : chip.countOff}`}>
                  {chip.stat ? stats[chip.stat] : courses.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-3 px-1 text-xs text-slate-500">
          <span>
            <strong className="font-bold text-slate-700">{filteredCourses.length}</strong> di {courses.length} corsi
          </span>
          <button type="button" onClick={resetFilters} className="min-h-9 px-2 font-bold text-[#df0000] hover:underline">
            Azzera filtri
          </button>
        </div>
      )}

      {/* ELENCO COMPATTO (mobile): un corso per riga, con i due interruttori di uso quotidiano a portata di pollice */}
      {filteredCourses.length > 0 && (
        <div className="space-y-3 md:hidden">
          {filteredCourses.map((course) => {
            const next = upcomingEditions(course.editions)[0];
            return (
              <article key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(course)}
                  className="flex w-full items-start gap-3 p-3 text-left transition-colors active:bg-slate-50"
                >
                  <img
                    src={course.image_url || fallbackImage}
                    alt=""
                    className="h-[72px] w-[72px] shrink-0 rounded-xl border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-1">
                      <span className="max-w-full truncate rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {course.category.name}
                      </span>
                      {course.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          <Sparkles className="h-3 w-3" />
                          In evidenza
                        </span>
                      )}
                    </div>
                    <h4 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{course.title}</h4>
                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-600">
                      <Calendar className={`h-3.5 w-3.5 shrink-0 ${next ? "text-[#df0000]" : "text-amber-600"}`} />
                      {next ? (
                        <span className="truncate font-semibold">
                          {formatEditionDates(next, { short: true })}
                          {next.location && normalizeMode(course.mode) !== "online" ? ` · ${next.location}` : ""}
                        </span>
                      ) : (
                        <span className="font-semibold text-amber-700">Nessuna data in programma</span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {course.duration_hours}h · {modeLabel(course.mode)}
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                </button>

                <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => runAction(() => onToggleCourse(course.id, { is_published: !course.is_published }))}
                    aria-pressed={course.is_published}
                    className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors ${
                      course.is_published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${course.is_published ? "bg-emerald-600" : "bg-amber-500"}`} />
                    {course.is_published ? "Online" : "Bozza"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      runAction(() => onToggleCourse(course.id, { is_open_for_enrollment: !course.is_open_for_enrollment }))
                    }
                    aria-pressed={course.is_open_for_enrollment}
                    className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-colors ${
                      course.is_open_for_enrollment ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${course.is_open_for_enrollment ? "bg-emerald-600" : "bg-slate-400"}`} />
                    {course.is_open_for_enrollment ? "Iscrizioni aperte" : "Iscrizioni chiuse"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuCourse(course)}
                    aria-label={`Altre azioni per ${course.title}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* 3. COURSES LISTING: GRID VIEW OR TABLE VIEW */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Nessun corso corrisponde ai criteri</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Prova a modificare i filtri di ricerca, cambiare categoria, oppure inserisci subito un nuovo corso nel catalogo.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#df0000] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[#b80000] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crea Nuovo Corso</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* =================================================================== */
        /* GRID / CARDS VIEW */
        /* =================================================================== */
        <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Card Image & Overlay Badges */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden shrink-0">
                <img
                  src={course.image_url || fallbackImage}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Category Badge Top Left */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {course.category.name}
                  </span>
                </div>

                {/* Interactive Toggles Top Right */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {/* Featured toggle */}
                  <button
                    onClick={() => runAction(() => onToggleCourse(course.id, { is_featured: !course.is_featured }))}
                    className={`p-1.5 rounded-lg backdrop-blur-xs transition-all ${
                      course.is_featured
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-black/40 text-white/70 hover:text-white"
                    }`}
                    title={course.is_featured ? "Rimuovi da evidenza" : "Metti in evidenza"}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  {/* Enrollment status pill */}
                  <button
                    onClick={() =>
                      runAction(() => onToggleCourse(course.id, { is_open_for_enrollment: !course.is_open_for_enrollment }))
                    }
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-xs transition-all ${
                      course.is_open_for_enrollment
                        ? "bg-emerald-600/90 text-white"
                        : "bg-slate-800/90 text-slate-300"
                    }`}
                    title="Clicca per aprire o chiudere le iscrizioni"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        course.is_open_for_enrollment ? "bg-white animate-pulse" : "bg-slate-400"
                      }`}
                    />
                    <span>{course.is_open_for_enrollment ? "Aperte" : "Chiuse"}</span>
                  </button>
                </div>

                {/* Duration & Location overlay at bottom of image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-semibold text-[11px] bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Clock className="w-3 h-3 text-[#008e97]" />
                      <span>{course.duration_hours}h</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[11px] bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>{course.validity_years ? `${course.validity_years} anni` : "validità di legge"}</span>
                    </span>
                  </div>

                  {(() => {
                    const next = upcomingEditions(course.editions)[0];
                    return next?.location && normalizeMode(course.mode) !== "online" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#df0000]/90 text-white px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{next.location}</span>
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#008e97] transition-colors">
                    {course.title}
                  </h4>

                  <div className="text-[11px] font-mono text-slate-400">/corsi/{course.slug}</div>

                  {/* Normative Reference */}
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#008e97] shrink-0" />
                    <span className="font-medium line-clamp-1">{course.normative_ref}</span>
                  </div>

                  {/* Short description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed pt-1">
                    {course.short_description}
                  </p>
                </div>

                {/* Card Meta & Badges */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => runAction(() => onToggleCourse(course.id, { is_published: !course.is_published }))}
                      className="bg-slate-50 hover:bg-slate-100 p-2 rounded-xl border border-slate-100 text-left transition-colors"
                      title="Clicca per pubblicare o mettere in bozza"
                    >
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Stato</span>
                      <span className={`font-bold ${course.is_published ? "text-emerald-700" : "text-amber-700"}`}>
                        {course.is_published ? "Pubblicato" : "Bozza"}
                      </span>
                    </button>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Modalità</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{modeLabel(course.mode)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2">
                    <Calendar className="w-3.5 h-3.5 text-[#df0000] shrink-0" />
                    {(() => {
                      const next = upcomingEditions(course.editions)[0];
                      return next ? (
                        <span className="font-semibold line-clamp-1">
                          {formatEditionDates(next)}
                          {course.editions.length > 1 && (
                            <span className="text-slate-400 font-medium"> · {upcomingEditions(course.editions).length} date in programma</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Nessuna data in programma</span>
                      );
                    })()}
                  </div>
                  
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                <Link
                  to={`/corsi/${course.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#008e97] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Vedi Scheda</span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => runAction(() => onDuplicateCourse(course.id), "Corso duplicato come bozza.")}
                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Duplica come bozza"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(course)}
                    className="p-2.5 text-slate-500 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-lg transition-colors"
                    title="Modifica corso"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmCourse(course)}
                    className="p-2.5 text-slate-400 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-lg transition-colors"
                    title="Elimina corso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* =================================================================== */
        /* TABLE VIEW */
        /* =================================================================== */
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Corso</th>
                  <th className="py-3.5 px-3">Categoria</th>
                  <th className="py-3.5 px-3">Modalità & Sede</th>
                  <th className="py-3.5 px-3">Durata & Validità</th>
                  <th className="py-3.5 px-3 text-center">In Evidenza</th>
                  <th className="py-3.5 px-3 text-center">Iscrizioni</th>
                  <th className="py-3.5 px-3 text-center">Pubblicato</th>
                  <th className="py-3.5 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Title & Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.image_url || fallbackImage}
                          alt={course.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="max-w-xs sm:max-w-md">
                          <div className="font-bold text-slate-900 line-clamp-1">{course.title}</div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">/corsi/{course.slug}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {course.normative_ref}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                        {course.category.name}
                      </span>
                    </td>

                    {/* Mode & Location */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="font-semibold text-slate-900 line-clamp-1">{modeLabel(course.mode)}</div>
                      {(() => {
                        const next = upcomingEditions(course.editions)[0];
                        if (!next) return <div className="text-[10px] text-amber-700 mt-0.5 font-semibold">Nessuna data in programma</div>;
                        return (
                          <>
                            <div className="text-[11px] text-slate-700 font-semibold mt-0.5">{formatEditionDates(next, { short: true })}</div>
                            {next.location && normalizeMode(course.mode) !== "online" && (
                              <div className="inline-flex items-center gap-1 text-[11px] text-[#df0000] font-bold mt-0.5 bg-red-50 px-2 py-0.5 rounded-md">
                                <MapPin className="w-3 h-3" />
                                <span>{next.location}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </td>

                    {/* Duration & Validity */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="font-semibold text-slate-900">{course.duration_hours} Ore</div>
                      <div className="text-[10px] text-slate-500">{course.validity_years ? `Valido ${course.validity_years} anni` : "Validità di legge"}</div>
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => runAction(() => onToggleCourse(course.id, { is_featured: !course.is_featured }))}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          course.is_featured
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "text-slate-300 border-transparent hover:border-slate-200"
                        }`}
                        title={course.is_featured ? "Rimuovi da evidenza" : "Metti in evidenza"}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Open for enrollment toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() =>
                          runAction(() => onToggleCourse(course.id, { is_open_for_enrollment: !course.is_open_for_enrollment }))
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          course.is_open_for_enrollment
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            course.is_open_for_enrollment ? "bg-emerald-600" : "bg-slate-400"
                          }`}
                        />
                        <span>{course.is_open_for_enrollment ? "Aperte" : "Chiuse"}</span>
                      </button>
                    </td>

                    {/* Published */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => runAction(() => onToggleCourse(course.id, { is_published: !course.is_published }))}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          course.is_published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <span>{course.is_published ? "Online" : "Bozza"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/corsi/${course.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-[#008e97] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Visualizza scheda pubblica"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => runAction(() => onDuplicateCourse(course.id), "Corso duplicato come bozza.")}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Duplica come bozza"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-2.5 text-slate-500 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-lg transition-colors"
                          title="Modifica corso"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmCourse(course)}
                          className="p-2.5 text-slate-400 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-lg transition-colors"
                          title="Elimina corso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PROCEDURA GUIDATA: CREAZIONE E MODIFICA DEL CORSO */}
      {/* ===================================================================== */}
      <AdminModal
        open={isModalOpen}
        onClose={closeWizard}
        title={editingCourse ? "Modifica Corso" : "Nuovo Corso"}
        subtitle={`Passo ${currentStep} di 4 · ${WIZARD_STEPS[currentStep - 1].title}`}
        icon={<BookOpen className="h-5 w-5" />}
        size="xl"
        stripe
        fixedHeight
        dismissOnBackdrop={false}
        header={
          <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-3 sm:px-6">
            <div className="grid grid-cols-4 gap-2">
              {WIZARD_STEPS.map((step) => {
                const isCurrent = currentStep === step.n;
                const isDone = currentStep > step.n;
                return (
                  <button
                    key={step.n}
                    type="button"
                    onClick={() => goToStep(step.n)}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border p-2 text-left transition-all sm:justify-start ${
                      isCurrent
                        ? step.active
                        : isDone
                          ? "border-transparent bg-slate-50 text-slate-700 hover:bg-slate-100"
                          : "border-transparent text-slate-400 opacity-60"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isCurrent ? `${step.badge} text-white` : isDone ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" /> : step.n}
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <span className="block truncate text-[11px] font-bold uppercase tracking-wider">{step.title}</span>
                      <span className="block truncate text-[10px] text-slate-500">{step.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        }
        footer={
          <div className="flex items-center gap-2 sm:justify-between">
            <button type="button" onClick={closeWizard} className={`${btnSecondary} ${currentStep > 1 ? "hidden sm:inline-flex" : ""}`}>
              Annulla
            </button>

            <div className="flex flex-1 items-center gap-2 sm:flex-none">
              {currentStep > 1 && (
                <button type="button" onClick={handlePrevStep} className={btnOutline}>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Indietro</span>
                </button>
              )}

              {currentStep < 4 ? (
                // `key` distinte: senza, React riusa lo stesso <button> cambiandone il tipo da "button" a "submit"
                // proprio durante il clic su "Avanti", e il browser invia il modulo salvando il corso al passo 4.
                <button key="next" type="button" onClick={handleNextStep} className={`${btnTeal} flex-1 sm:flex-none`}>
                  <span>Avanti</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button key="save" type="submit" form="course-form" disabled={isSaving} className={`${btnPrimary} flex-1 sm:flex-none`}>
                  <Check className="h-4 w-4" />
                  <span>{isSaving ? "Salvataggio..." : editingCourse ? "Salva Modifiche" : "Salva Corso"}</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        <form id="course-form" onSubmit={handleSubmitForm} className="space-y-5">
              {/* STEP 1: DATI BASE & NORMATIVA */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                  <div className="hidden sm:flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Info className="w-4 h-4 text-[#008e97]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 1: Informazioni Principali e Riconoscimento Normativo
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Titolo Ufficiale del Corso *
                      </label>
                      <input
                        type="text"
                        required
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        placeholder="es. RSPP Datore di Lavoro - Rischio Alto"
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] transition-colors"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-800">Slug URL Identificativo</label>
                        <button
                          type="button"
                          onClick={() => {
                            setCourseForm({ ...courseForm, slug: slugify(courseForm.title) });
                          }}
                          className="min-h-10 px-1 text-[11px] text-[#008e97] hover:underline font-semibold"
                        >
                          Genera automatico da Titolo
                        </button>
                      </div>
                      <input
                        type="text"
                        value={courseForm.slug}
                        onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })}
                        placeholder="es. rspp-datore-di-lavoro-alto"
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-800">Categoria Formativa *</label>
                        <button
                          type="button"
                          onClick={() => setIsQuickAddCatOpen(!isQuickAddCatOpen)}
                          className="min-h-10 px-1 text-[11px] text-[#008e97] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isQuickAddCatOpen ? "Chiudi" : "Nuova categoria"}</span>
                        </button>
                      </div>

                      <select
                        value={courseForm.category_id}
                        onChange={(e) => setCourseForm({ ...courseForm, category_id: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      {/* Quick category add */}
                      {isQuickAddCatOpen && (
                        <div className="mt-2 p-2.5 bg-white border border-[#008e97]/40 rounded-xl flex items-center gap-2 shadow-xs">
                          <input
                            type="text"
                            value={quickNewCat}
                            onChange={(e) => setQuickNewCat(e.target.value)}
                            placeholder="Nuova categoria..."
                            className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#008e97]"
                          />
                          <button
                            type="button"
                            onClick={handleQuickAddCategory}
                            className="min-h-10 px-3.5 bg-[#008e97] text-white text-xs font-bold rounded-lg shrink-0"
                          >
                            Salva
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Riferimento Normativo di Legge *
                      </label>
                      <input
                        type="text"
                        required
                        value={courseForm.normative_ref}
                        onChange={(e) => setCourseForm({ ...courseForm, normative_ref: e.target.value })}
                        placeholder="es. Art. 34 D.Lgs. 81/08 - Accordo Stato-Regioni"
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      Destinatari del Corso (Target Audience)
                    </label>
                    <input
                      type="text"
                      value={courseForm.target_audience}
                      onChange={(e) => setCourseForm({ ...courseForm, target_audience: e.target.value })}
                      placeholder="es. Datori di Lavoro che intendono svolgere direttamente i compiti di RSPP, RLS, Dirigenti"
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: MODALITÀ, DATE & SEDI */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                  <div className="hidden sm:flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Clock className="w-4 h-4 text-[#f58220]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 2: Modalità, Durata, Date e Sedi
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">Durata (Ore) *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={160}
                        value={courseForm.duration_hours}
                        onChange={(e) => setCourseForm({ ...courseForm, duration_hours: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">Validità (Anni)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={courseForm.validity_years}
                        onChange={(e) => setCourseForm({ ...courseForm, validity_years: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-800 mb-1">Modalità Didattica *</label>
                      <select
                        value={courseForm.mode}
                        onChange={(e) => setCourseForm({ ...courseForm, mode: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      >
                        {MODE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date e sedi in cui si svolge il corso */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#df0000]" />
                          <span>Date e sedi del corso</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-xl">
                          {needsLocation
                            ? "Per ogni data indica dove si svolge (città o sede dell'ente). "
                            : "Corso online: indica solo le date, la sede non serve. "}
                          Sul sito compaiono solo le date non ancora concluse.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addEditionRow}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold shrink-0 sm:min-h-10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Aggiungi data</span>
                      </button>
                    </div>

                    {editionRows.length === 0 && (
                      <div className="text-[11px] text-slate-500 italic bg-white border border-dashed border-slate-300 rounded-xl px-3 py-3">
                        Nessuna data inserita: sul sito comparirà "Date da definire".
                      </div>
                    )}

                    <datalist id="known-edition-locations">
                      {knownLocations.map((place) => (
                        <option key={place} value={place} />
                      ))}
                    </datalist>

                    {editionRows.map((row, index) => {
                      const isPast = Boolean(row.start_date) && !isUpcoming({ start_date: row.start_date, end_date: row.end_date || null });
                      return (
                        <div key={row.key} className="grid grid-cols-12 gap-2 p-3 bg-white border border-slate-200 rounded-xl">
                          <div className="col-span-6 sm:col-span-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Dal *</label>
                            <input
                              type="date"
                              value={row.start_date}
                              onChange={(e) => updateEditionRow(row.key, { start_date: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                            />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Al (se più giorni)</label>
                            <input
                              type="date"
                              min={row.start_date || undefined}
                              value={row.end_date}
                              onChange={(e) => updateEditionRow(row.key, { end_date: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                            />
                          </div>
                          {needsLocation ? (
                            <div className="col-span-10 sm:col-span-5">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sede *</label>
                              <input
                                type="text"
                                list="known-edition-locations"
                                value={row.location}
                                onChange={(e) => updateEditionRow(row.key, { location: e.target.value })}
                                placeholder="es. Sassari, Porto Torres (SS)"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                              />
                            </div>
                          ) : (
                            <div className="col-span-10 sm:col-span-5 flex items-end pb-2 text-[11px] text-slate-500 italic">Online: nessuna sede</div>
                          )}
                          <div className="col-span-2 sm:col-span-1 flex items-end justify-end">
                            <button
                              type="button"
                              onClick={() => removeEditionRow(row.key)}
                              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:text-[#df0000] hover:bg-[#fdf2f2] transition-colors sm:h-10 sm:w-10"
                              title={`Elimina la data ${index + 1}`}
                              aria-label={`Elimina la data ${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="col-span-12">
                            <input
                              type="text"
                              value={row.notes}
                              onChange={(e) => updateEditionRow(row.key, { notes: e.target.value })}
                              placeholder="Nota facoltativa (es. orario 9:00–18:00, ente organizzatore)"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                            />
                          </div>
                          {isPast && (
                            <div className="col-span-12 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Data già conclusa: non è più visibile sul sito. Puoi eliminarla.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Attestato & Validità Rilasciata
                      </label>
                      <input
                        type="text"
                        value={courseForm.certification_issued}
                        onChange={(e) => setCourseForm({ ...courseForm, certification_issued: e.target.value })}
                        placeholder="es. Attestato nominativo con tracciamento orario e codice anticontraffazione univoco"
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PROGRAMMA DIDATTICO */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                  <div className="hidden sm:flex items-center gap-2 pb-2 border-b border-slate-100">
                    <FileText className="w-4 h-4 text-[#df0000]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 3: Sintesi e Programma Didattico Dettagliato
                    </h4>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-800">
                        Descrizione Breve (Sintesi per Schede e SEO) *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {courseForm.short_description.length} caratteri (consigliato: 100-250)
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={courseForm.short_description}
                      onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })}
                      placeholder="Sintesi accattivante del corso visibile nelle anteprime di catalogo e nei motori di ricerca..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-800">
                        Programma Didattico Dettagliato & Obiettivi *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCourseForm((prev) => ({
                            ...prev,
                            content: `### Obiettivi del Corso
Fornire ai discenti il quadro normativo completo ai sensi del D.Lgs. 81/08 e le competenze operative per la prevenzione e protezione nei luoghi di lavoro.

### Articolazione dei Moduli Didattici
1. **Modulo 1 - Normativo e Giuridico (2 ore)**: Sistema legislativo, diritti e doveri dei lavoratori e dirigenti.
2. **Modulo 2 - Valutazione dei Rischi Specifici (2 ore)**: Ambienti di lavoro, attrezzature, movimentazione manuale dei carichi.
3. **Modulo 3 - Tecnico e Organizzativo (2 ore)**: Dispositivi di protezione individuale (DPI) e segnaletica di sicurezza.
4. **Modulo 4 - Gestione delle Emergenze (2 ore)**: Evacuazione rapida, chiamata di soccorso al 112/118.

### Verifica Finale dell'Apprendimento
Questionario a risposta multipla e colloquio di approfondimento con il docente qualificato.`,
                          }));
                          showToast("Template D.Lgs. 81/08 inserito con successo!");
                        }}
                        className="min-h-10 px-1 text-[11px] text-[#008e97] hover:underline font-semibold"
                      >
                        Applica Template Didattico Standard D.Lgs. 81/08
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      required
                      value={courseForm.content}
                      onChange={(e) => setCourseForm({ ...courseForm, content: e.target.value })}
                      placeholder="Inserisci il programma per moduli, obiettivi formativi e modalità di verifica dell'apprendimento..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: IMMAGINE & PUBBLICAZIONE */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-200">
                  <div className="hidden sm:flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Sparkles className="w-4 h-4 text-[#008e97]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 4: Immagine di Copertina & Opzioni di Visibilità
                    </h4>
                  </div>

                  {/* Image picker & Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          Foto di copertina
                        </label>

                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-xs disabled:opacity-50 sm:min-h-10 sm:w-auto"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#008e97]" />
                            <span>Carica foto dal computer</span>
                          </button>
                          {courseForm.image_url && (
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => setImageUrl("")}
                              className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-colors shadow-xs disabled:opacity-50 sm:min-h-10 sm:w-auto"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Usa immagine predefinita</span>
                            </button>
                          )}
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          {imageInfo ||
                            (courseForm.image_url
                              ? "Per sostituirla scegli un'altra foto: viene ottimizzata sotto i 150 kB e salvata sul sito."
                              : "Nessuna foto: il corso usa l'immagine predefinita. JPG, PNG, WebP o AVIF vengono ottimizzati sotto i 150 kB.")}
                        </p>
                      </div>

                      {/* Preset themes */}
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Oppure scegli una foto tematica:
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {COURSE_IMAGE_PRESETS.map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              disabled={isSaving}
                              onClick={() => handlePresetPick(p.url)}
                              className="text-[11px] min-h-11 px-2.5 py-2 rounded-xl text-left border transition-all truncate bg-white border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Preview box */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-800">Anteprima Scheda Corso:</div>
                      <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
                        <div className="h-36 w-full bg-slate-100 relative">
                          <img
                            src={courseForm.image_url || fallbackImage}
                            alt="Anteprima"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold uppercase">
                              {categories.find((c) => c.id === courseForm.category_id)?.name ?? ""}
                            </span>
                          </div>
                        </div>
                        <div className="p-3.5 space-y-1.5">
                          <div className="font-bold text-slate-900 text-xs line-clamp-1">
                            {courseForm.title || "Titolo del Corso"}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-2">
                            {courseForm.short_description || "Descrizione breve del corso..."}
                          </div>
                          <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-600 font-semibold">
                            <span>{courseForm.duration_hours} Ore</span>
                            <span>•</span>
                            <span>{modeLabel(courseForm.mode)}</span>
                            {upcomingEditions(
                              editionRows
                                .filter((r) => r.start_date)
                                .map((r) => ({ start_date: r.start_date, end_date: r.end_date || null, location: r.location || null }))
                            )[0] && (
                              <>
                                <span>•</span>
                                <span className="text-[#df0000]">
                                  {formatEditionDates(
                                    upcomingEditions(
                                      editionRows
                                        .filter((r) => r.start_date)
                                        .map((r) => ({ start_date: r.start_date, end_date: r.end_date || null }))
                                    )[0],
                                    { short: true }
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Publication Settings */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Impostazioni di Pubblicazione
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={courseForm.is_published}
                          onChange={(e) => setCourseForm({ ...courseForm, is_published: e.target.checked })}
                          className="mt-0.5 w-5 h-5 shrink-0 text-emerald-600 rounded focus:ring-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Pubblicato sul sito</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Se disattivato il corso resta in bozza e il pubblico non lo vede
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={courseForm.is_featured}
                          onChange={(e) => setCourseForm({ ...courseForm, is_featured: e.target.checked })}
                          className="mt-0.5 w-5 h-5 shrink-0 text-amber-500 rounded focus:ring-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>In Evidenza (Featured)</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Mostra il badge in evidenza e posiziona in vetrina sulla Home
                          </div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={courseForm.is_open_for_enrollment}
                          onChange={(e) => setCourseForm({ ...courseForm, is_open_for_enrollment: e.target.checked })}
                          className="mt-0.5 w-5 h-5 shrink-0 text-emerald-600 rounded focus:ring-0"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Iscrizioni Aperte</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Abilita il form di prenotazione e mostra nella sezione "Corsi del Momento"
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
        </form>
      </AdminModal>

      {/* Filtri aggiuntivi (mobile) */}
      <AdminModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtri"
        subtitle={`${filteredCourses.length} ${filteredCourses.length === 1 ? "corso" : "corsi"} corrispondenti`}
        size="sm"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("Tutti")}
              disabled={selectedCategory === "Tutti"}
              className={`${btnSecondary} flex-1`}
            >
              Azzera
            </button>
            <button type="button" onClick={() => setFiltersOpen(false)} className={`${btnTeal} flex-[2]`}>
              Mostra {filteredCourses.length} {filteredCourses.length === 1 ? "corso" : "corsi"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="course-category-filter" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Categoria
            </label>
            <select
              id="course-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
            >
              <option value="Tutti">Tutte le categorie ({courses.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({courses.filter((c) => c.category_id === cat.id).length})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setFiltersOpen(false);
              onNavigateToCategories();
            }}
            className={`${btnOutline} w-full normal-case tracking-normal`}
          >
            <Tag className="h-4 w-4 text-[#008e97]" />
            <span>Gestisci le categorie</span>
          </button>
        </div>
      </AdminModal>

      {/* Altre azioni su un corso (mobile) */}
      <AdminModal
        open={Boolean(menuCourse)}
        onClose={() => setMenuCourse(null)}
        title={menuCourse?.title ?? ""}
        subtitle={menuCourse?.category.name}
        size="sm"
        bodyClassName="p-3"
      >
        {menuCourse && (
          <ul className="space-y-1">
            {[
              {
                label: "Modifica corso",
                icon: Edit2,
                tone: "bg-[#e6f6f7] text-[#008e97]",
                onClick: () => handleOpenEditModal(menuCourse),
              },
              {
                label: menuCourse.is_featured ? "Rimuovi da In evidenza" : "Metti in evidenza",
                icon: Sparkles,
                tone: "bg-amber-50 text-amber-600",
                onClick: () => runAction(() => onToggleCourse(menuCourse.id, { is_featured: !menuCourse.is_featured })),
              },
              {
                label: "Duplica come bozza",
                icon: Copy,
                tone: "bg-indigo-50 text-indigo-600",
                onClick: () => runAction(() => onDuplicateCourse(menuCourse.id), "Corso duplicato come bozza."),
              },
            ].map((action) => (
              <li key={action.label}>
                <button
                  type="button"
                  onClick={() => {
                    setMenuCourse(null);
                    action.onClick();
                  }}
                  className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${action.tone}`}>
                    <action.icon className="h-5 w-5" />
                  </span>
                  {action.label}
                </button>
              </li>
            ))}
            <li>
              <Link
                to={`/corsi/${menuCourse.slug}`}
                target="_blank"
                onClick={() => setMenuCourse(null)}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <ExternalLink className="h-5 w-5" />
                </span>
                Vedi scheda pubblica
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  const target = menuCourse;
                  setMenuCourse(null);
                  setDeleteConfirmCourse(target);
                }}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#df0000] transition-colors hover:bg-rose-50 active:bg-rose-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf2f2]">
                  <Trash2 className="h-5 w-5" />
                </span>
                Elimina corso
              </button>
            </li>
          </ul>
        )}
      </AdminModal>

      <ConfirmDialog
        open={Boolean(deleteConfirmCourse)}
        title="Eliminare questo corso?"
        confirmLabel="Sì, elimina"
        onConfirm={() => {
          const target = deleteConfirmCourse;
          if (!target) return;
          runAction(() => onDeleteCourse(target.id), `Corso "${target.title}" eliminato.`);
          setDeleteConfirmCourse(null);
        }}
        onCancel={() => setDeleteConfirmCourse(null)}
      >
        Stai per eliminare definitivamente <strong>&ldquo;{deleteConfirmCourse?.title}&rdquo;</strong>. Verranno rimosse la scheda
        pubblica e le informazioni associate.
      </ConfirmDialog>
    </div>
  );
}
