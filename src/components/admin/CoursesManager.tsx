import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "@/components/ui/Link";
import { Course } from "@/lib/types/database";
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
  AlertTriangle,
  Flame,
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

interface CoursesManagerProps {
  courses: Course[];
  categories: string[];
  onAddCourse: (course: Omit<Course, "id" | "created_at" | "updated_at">) => void;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onDuplicateCourse: (id: string) => void;
  onAddCategory: (category: string) => void;
  onNavigateToCategories: () => void;
  showToast: (msg: string) => void;
  externalOpenAddModalTrigger?: number;
}

export default function CoursesManager({
  courses,
  categories,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onDuplicateCourse,
  onAddCategory,
  onNavigateToCategories,
  showToast,
  externalOpenAddModalTrigger,
}: CoursesManagerProps) {
  // View mode: 'grid' or 'table'
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tutti");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "featured" | "in_person">("all");

  // Modal & Wizard state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isQuickAddCatOpen, setIsQuickAddCatOpen] = useState(false);
  const [quickNewCat, setQuickNewCat] = useState("");
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState<Course | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Course Add / Edit
  const [courseForm, setCourseForm] = useState<{
    title: string;
    slug: string;
    category: string;
    short_description: string;
    content: string;
    duration_hours: number;
    mode: string;
    validity_years: number;
    normative_ref: string;
    target_audience: string;
    certification_issued: string;
    is_featured: boolean;
    is_open_for_enrollment: boolean;
    seats_available: number;
    image_url: string;
    period: string;
    location: string;
  }>({
    title: "",
    slug: "",
    category: categories[0] || "Datori di Lavoro & Dirigenti",
    short_description: "",
    content: "",
    duration_hours: 8,
    mode: "Aula in presenza",
    validity_years: 5,
    normative_ref: "Art. 37 D.Lgs. 81/08 - Accordo Stato-Regioni",
    target_audience: "Lavoratori, Preposti e Datori di Lavoro",
    certification_issued: "Attestato ufficiale valido su tutto il territorio nazionale con verifica dell'apprendimento",
    is_featured: false,
    is_open_for_enrollment: true,
    seats_available: 6,
    image_url: COURSE_IMAGE_PRESETS[0].url,
    period: "Prossima sessione: In partenza a breve",
    location: "Porto Torres (SS)",
  });

  // KPI Statistics
  const stats = useMemo(() => {
    const total = courses.length;
    const openEnrollment = courses.filter((c) => c.is_open_for_enrollment).length;
    const featured = courses.filter((c) => c.is_featured).length;
    const totalSeats = courses.reduce((acc, curr) => acc + (curr.seats_available || 0), 0);
    const inPerson = courses.filter((c) => {
      const m = (c.mode || "").toLowerCase();
      return m.includes("aula") || m.includes("presenza") || m.includes("pratiche") || m.includes("misto");
    }).length;
    return { total, openEnrollment, featured, totalSeats, inPerson };
  }, [courses]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Category match
      if (selectedCategory !== "Tutti" && c.category !== selectedCategory) {
        return false;
      }

      // Status pill match
      if (statusFilter === "open" && !c.is_open_for_enrollment) return false;
      if (statusFilter === "featured" && !c.is_featured) return false;
      if (statusFilter === "in_person") {
        const m = (c.mode || "").toLowerCase();
        const isInPerson = m.includes("aula") || m.includes("presenza") || m.includes("pratiche") || m.includes("misto");
        if (!isInPerson) return false;
      }

      // Text search
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchSlug = c.slug.toLowerCase().includes(q);
        const matchNorm = c.normative_ref.toLowerCase().includes(q);
        const matchLoc = c.location ? c.location.toLowerCase().includes(q) : false;
        const matchDesc = c.short_description.toLowerCase().includes(q);
        const matchCat = c.category.toLowerCase().includes(q);
        return matchTitle || matchSlug || matchNorm || matchLoc || matchDesc || matchCat;
      }

      return true;
    });
  }, [courses, selectedCategory, statusFilter, searchQuery]);

  // Open Add Course Modal
  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setCurrentStep(1);
    setIsQuickAddCatOpen(false);
    setQuickNewCat("");
    setCourseForm({
      title: "",
      slug: "",
      category: categories[0] || "Datori di Lavoro & Dirigenti",
      short_description: "",
      content: `### Obiettivi del Corso
Fornire ai partecipanti il quadro completo degli obblighi di legge previsti dal D.Lgs. 81/08 e le competenze operative per prevenire gli infortuni e gestire le misure di sicurezza.

### Articolazione dei Moduli Didattici
1. **Modulo 1 - Normativo e Giuridico (2 ore)**: Responsabilità civili e penali, figure della prevenzione aziendale.
2. **Modulo 2 - Valutazione dei Rischi Specifici (2 ore)**: Metodologie pratiche, ambienti di lavoro, movimentazione carichi.
3. **Modulo 3 - Misure Tecniche ed Organizzative (2 ore)**: Dispositivi di protezione individuale (DPI) e procedure operative.
4. **Modulo 4 - Gestione Emergenze e Primo Intervento (2 ore)**: Piani di evacuazione rapida e comunicazione di soccorso.

### Verifica Finale dell'Apprendimento
Test scritto a risposta multipla finale e colloquio di approfondimento con il docente qualificato.`,
      duration_hours: 8,
      mode: "Aula in presenza",
      validity_years: 5,
      normative_ref: "Art. 37 D.Lgs. 81/08 - Accordo Stato-Regioni",
      target_audience: "Lavoratori, Preposti e Datori di Lavoro",
      certification_issued: "Attestato ufficiale abilitativo valido su tutto il territorio nazionale con verifica finale",
      is_featured: false,
      is_open_for_enrollment: true,
      seats_available: 6,
      image_url: COURSE_IMAGE_PRESETS[0].url,
      period: "Prossima sessione: In partenza a breve",
      location: "Porto Torres (SS)",
    });
    setIsModalOpen(true);
  };

  // React to external open add modal trigger
  useEffect(() => {
    if (externalOpenAddModalTrigger && externalOpenAddModalTrigger > 0) {
      handleOpenAddModal();
    }
  }, [externalOpenAddModalTrigger]);

  // Open Edit Course Modal
  const handleOpenEditModal = (course: Course) => {
    setEditingCourse(course);
    setCurrentStep(1);
    setIsQuickAddCatOpen(false);
    setQuickNewCat("");
    setCourseForm({
      title: course.title,
      slug: course.slug,
      category: course.category,
      short_description: course.short_description,
      content: course.content,
      duration_hours: course.duration_hours,
      mode: course.mode,
      validity_years: course.validity_years,
      normative_ref: course.normative_ref,
      target_audience: course.target_audience || "",
      certification_issued: course.certification_issued || "",
      is_featured: course.is_featured,
      is_open_for_enrollment: course.is_open_for_enrollment ?? true,
      seats_available: course.seats_available ?? 6,
      image_url: course.image_url || COURSE_IMAGE_PRESETS[0].url,
      period: course.period || "",
      location: course.location || "",
    });
    setIsModalOpen(true);
  };

  // Quick Add Category from Wizard
  const handleQuickAddCategory = () => {
    if (!quickNewCat.trim()) return;
    onAddCategory(quickNewCat.trim());
    setCourseForm((prev) => ({ ...prev, category: quickNewCat.trim() }));
    setQuickNewCat("");
    setIsQuickAddCatOpen(false);
    showToast(`Categoria "${quickNewCat.trim()}" creata!`);
  };

  // Image Upload handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'immagine selezionata supera 2MB. Scegli un file più leggero o usa un URL.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseForm((prev) => ({ ...prev, image_url: reader.result as string }));
        showToast("Immagine caricata con successo!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Check step validity before moving next
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!courseForm.title.trim()) {
        alert("Inserisci il titolo ufficiale del corso per procedere.");
        return false;
      }
      if (!courseForm.category.trim()) {
        alert("Seleziona una categoria didattica.");
        return false;
      }
      if (!courseForm.normative_ref.trim()) {
        alert("Inserisci il riferimento normativo di legge (es. D.Lgs. 81/08).");
        return false;
      }
    } else if (step === 2) {
      if (!courseForm.duration_hours || courseForm.duration_hours < 1) {
        alert("La durata in ore deve essere di almeno 1 ora.");
        return false;
      }
    } else if (step === 3) {
      if (!courseForm.short_description.trim()) {
        alert("Inserisci una breve descrizione sintetica del corso.");
        return false;
      }
      if (!courseForm.content.trim()) {
        alert("Inserisci il programma didattico dettagliato del corso.");
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

  // Final Form Submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseForm.title.trim()) {
      setCurrentStep(1);
      alert("Il titolo del corso è obbligatorio.");
      return;
    }

    const autoSlug =
      courseForm.slug.trim() ||
      courseForm.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    const payload = {
      title: courseForm.title.trim(),
      slug: autoSlug,
      category: courseForm.category,
      short_description: courseForm.short_description.trim(),
      content: courseForm.content.trim(),
      duration_hours: Number(courseForm.duration_hours) || 8,
      mode: courseForm.mode,
      validity_years: Number(courseForm.validity_years) || 5,
      normative_ref: courseForm.normative_ref.trim(),
      target_audience: courseForm.target_audience.trim() || undefined,
      certification_issued: courseForm.certification_issued.trim() || undefined,
      is_featured: courseForm.is_featured,
      is_open_for_enrollment: courseForm.is_open_for_enrollment,
      seats_available: Number(courseForm.seats_available) || 0,
      image_url: courseForm.image_url || COURSE_IMAGE_PRESETS[0].url,
      period: courseForm.period.trim() || undefined,
      location: courseForm.location.trim() || undefined,
    };

    if (editingCourse) {
      onUpdateCourse(editingCourse.id, payload);
      showToast(`Corso "${payload.title}" aggiornato con successo!`);
    } else {
      onAddCourse(payload);
      showToast(`Nuovo corso "${payload.title}" pubblicato nel catalogo!`);
    }

    setIsModalOpen(false);
  };

  // Helper to check if current mode is in presence
  const isPresenceCourse = useMemo(() => {
    const m = (courseForm.mode || "").toLowerCase();
    return m.includes("aula") || m.includes("presenza") || m.includes("pratiche") || m.includes("misto");
  }, [courseForm.mode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. UNIFIED SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#e6f6f7] border border-[#008e97]/20 flex items-center justify-center text-[#008e97] shrink-0 shadow-2xs">
            <BookOpen className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Corsi di Formazione
              </h2>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                {courses.length} corsi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestisci l'offerta formativa, requisiti normativi, edizioni in programma e iscrizioni aperte.
            </p>
          </div>
        </div>

        {/* Top Actions: View mode switcher + Nuovo Corso CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Visualizzazione a griglia (Schede)"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#008e97]" />
              <span className="hidden sm:inline">Griglia</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Visualizzazione a tabella elenco"
            >
              <List className="w-3.5 h-3.5 text-[#008e97]" />
              <span className="hidden sm:inline">Tabella</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Corso</span>
          </button>
        </div>
      </div>

      {/* 2. INTEGRATED CONTROLS & FILTER BAR */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Filter Pills with Live Metric Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
            }`}
          >
            <span>Tutti</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
              }`}
            >
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("open")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "open"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Iscrizioni Aperte</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "open" ? "bg-white/20 text-white" : "bg-emerald-200/60 text-emerald-800"
              }`}
            >
              {stats.openEnrollment}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("featured")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "featured"
                ? "bg-[#f58220] text-white shadow-xs"
                : "bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>In Evidenza</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "featured" ? "bg-white/20 text-white" : "bg-amber-200/60 text-amber-800"
              }`}
            >
              {stats.featured}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("in_person")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "in_person"
                ? "bg-[#008e97] text-white shadow-xs"
                : "bg-cyan-50 hover:bg-cyan-100/80 text-cyan-800 border border-cyan-200/60"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>In Presenza</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "in_person" ? "bg-white/20 text-white" : "bg-cyan-200/60 text-cyan-800"
              }`}
            >
              {stats.inPerson}
            </span>
          </button>

          {(searchQuery || selectedCategory !== "Tutti" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Tutti");
                setStatusFilter("all");
              }}
              className="text-[11px] text-[#df0000] hover:underline font-bold px-2 py-1 shrink-0"
            >
              Azzera filtri
            </button>
          )}
        </div>

        {/* Right: Search Input + Category Select + Categorie Shortcut */}
        <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca corso, normativa, sede..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97] cursor-pointer"
          >
            <option value="Tutti">Tutte le Categorie ({courses.length})</option>
            {categories.map((cat) => {
              const count = courses.filter((c) => c.category === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>

          <button
            type="button"
            onClick={onNavigateToCategories}
            className="p-2 bg-slate-50 hover:bg-[#e6f6f7] hover:text-[#008e97] border border-slate-200 rounded-xl text-slate-600 transition-colors shrink-0"
            title="Gestisci o riordina categorie didattiche"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Card Image & Overlay Badges */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden shrink-0">
                <img
                  src={course.image_url || COURSE_IMAGE_PRESETS[0].url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Category Badge Top Left */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                    {course.category}
                  </span>
                </div>

                {/* Interactive Toggles Top Right */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {/* Featured toggle */}
                  <button
                    onClick={() => onUpdateCourse(course.id, { is_featured: !course.is_featured })}
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
                      onUpdateCourse(course.id, {
                        is_open_for_enrollment: !course.is_open_for_enrollment,
                      })
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
                      <span>{course.validity_years} anni</span>
                    </span>
                  </div>

                  {course.location && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#df0000]/90 text-white px-2 py-0.5 rounded-md">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{course.location}</span>
                    </span>
                  )}
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
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Posti</span>
                      <span className="font-bold text-slate-900">{course.seats_available ?? 0} disponibili</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Modalità</span>
                      <span className="font-semibold text-slate-800 line-clamp-1">{course.mode}</span>
                    </div>
                  </div>

                  {course.period && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.period}</span>
                    </div>
                  )}
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
                    onClick={() => onDuplicateCourse(course.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Duplica come bozza"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(course)}
                    className="p-1.5 text-slate-500 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-lg transition-colors"
                    title="Modifica corso"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmCourse(course)}
                    className="p-1.5 text-slate-400 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-lg transition-colors"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
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
                  <th className="py-3.5 px-3 text-center">Posti</th>
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
                          src={course.image_url || COURSE_IMAGE_PRESETS[0].url}
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
                        {course.category}
                      </span>
                    </td>

                    {/* Mode & Location */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="font-semibold text-slate-900 line-clamp-1">{course.mode}</div>
                      {course.location ? (
                        <div className="inline-flex items-center gap-1 text-[11px] text-[#df0000] font-bold mt-0.5 bg-red-50 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3" />
                          <span>{course.location}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-0.5">Online / FAD</div>
                      )}
                    </td>

                    {/* Duration & Validity */}
                    <td className="py-3.5 px-3 text-slate-600">
                      <div className="font-semibold text-slate-900">{course.duration_hours} Ore</div>
                      <div className="text-[10px] text-slate-500">Valido {course.validity_years} anni</div>
                    </td>

                    {/* Featured toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => onUpdateCourse(course.id, { is_featured: !course.is_featured })}
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
                          onUpdateCourse(course.id, {
                            is_open_for_enrollment: !course.is_open_for_enrollment,
                          })
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

                    {/* Seats */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold text-slate-800 font-mono text-xs">
                        {course.seats_available ?? 0}
                      </span>
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
                          onClick={() => onDuplicateCourse(course.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Duplica come bozza"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-1.5 text-slate-500 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-lg transition-colors"
                          title="Modifica corso"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmCourse(course)}
                          className="p-1.5 text-slate-400 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-lg transition-colors"
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
      {/* 4. MULTI-STEP COURSE CREATION & EDITING WIZARD MODAL */}
      {/* ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#008e97] text-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCourse ? "Modifica Corso di Formazione" : "Aggiungi Nuovo Corso"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Passo {currentStep} di 4 • Compila i dati richiesti per pubblicare l'offerta formativa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Stepper */}
            <div className="px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-4 gap-2">
                {/* Step 1 */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                    currentStep === 1
                      ? "bg-[#e6f6f7] border border-[#008e97]/30 text-[#008e97]"
                      : currentStep > 1
                      ? "bg-slate-50 hover:bg-slate-100 text-slate-700"
                      : "opacity-60 text-slate-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      currentStep === 1
                        ? "bg-[#008e97] text-white"
                        : currentStep > 1
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
                  </div>
                  <div className="hidden sm:block truncate">
                    <div className="text-[11px] font-bold uppercase tracking-wider">Base</div>
                    <div className="text-[10px] text-slate-500 truncate">Titolo & Categoria</div>
                  </div>
                </button>

                {/* Step 2 */}
                <button
                  type="button"
                  onClick={() => validateStep(1) && setCurrentStep(2)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                    currentStep === 2
                      ? "bg-[#fff4ea] border border-[#f58220]/40 text-[#f58220]"
                      : currentStep > 2
                      ? "bg-slate-50 hover:bg-slate-100 text-slate-700"
                      : "opacity-60 text-slate-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      currentStep === 2
                        ? "bg-[#f58220] text-white"
                        : currentStep > 2
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
                  </div>
                  <div className="hidden sm:block truncate">
                    <div className="text-[11px] font-bold uppercase tracking-wider">Sede & Ore</div>
                    <div className="text-[10px] text-slate-500 truncate">Modalità & Posti</div>
                  </div>
                </button>

                {/* Step 3 */}
                <button
                  type="button"
                  onClick={() => validateStep(1) && validateStep(2) && setCurrentStep(3)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                    currentStep === 3
                      ? "bg-red-50 border border-red-200 text-[#df0000]"
                      : currentStep > 3
                      ? "bg-slate-50 hover:bg-slate-100 text-slate-700"
                      : "opacity-60 text-slate-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      currentStep === 3
                        ? "bg-[#df0000] text-white"
                        : currentStep > 3
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : "3"}
                  </div>
                  <div className="hidden sm:block truncate">
                    <div className="text-[11px] font-bold uppercase tracking-wider">Didattica</div>
                    <div className="text-[10px] text-slate-500 truncate">Programma & Test</div>
                  </div>
                </button>

                {/* Step 4 */}
                <button
                  type="button"
                  onClick={() => validateStep(1) && validateStep(2) && validateStep(3) && setCurrentStep(4)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                    currentStep === 4
                      ? "bg-[#e6f6f7] border border-[#008e97]/40 text-[#008e97]"
                      : "opacity-60 text-slate-400"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      currentStep === 4 ? "bg-[#008e97] text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    4
                  </div>
                  <div className="hidden sm:block truncate">
                    <div className="text-[11px] font-bold uppercase tracking-wider">Media & Pubblica</div>
                    <div className="text-[10px] text-slate-500 truncate">Foto & Visibilità</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Modal Body: Content per Step */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto flex-grow space-y-5">
              {/* STEP 1: DATI BASE & NORMATIVA */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
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
                            const auto = courseForm.title
                              .toLowerCase()
                              .replace(/[^\w\s-]/g, "")
                              .trim()
                              .replace(/\s+/g, "-");
                            setCourseForm({ ...courseForm, slug: auto });
                          }}
                          className="text-[10px] text-[#008e97] hover:underline font-semibold"
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
                          className="text-[10px] text-[#008e97] hover:underline font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isQuickAddCatOpen ? "Chiudi" : "+ Nuova Categoria"}</span>
                        </button>
                      </div>

                      <select
                        value={courseForm.category}
                        onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
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
                            className="px-3 py-1 bg-[#008e97] text-white text-xs font-bold rounded-lg shrink-0"
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

              {/* STEP 2: MODALITÀ, SEDE & SESSIONI */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Clock className="w-4 h-4 text-[#f58220]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 2: Modalità di Erogazione, Durata, Sede e Posti
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">Posti Disponibili</label>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        value={courseForm.seats_available}
                        onChange={(e) => setCourseForm({ ...courseForm, seats_available: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">Modalità Didattica *</label>
                      <select
                        value={courseForm.mode}
                        onChange={(e) => setCourseForm({ ...courseForm, mode: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      >
                        <option value="Aula in presenza">Aula in presenza</option>
                        <option value="Aula / Videoconferenza sincrona">Aula / Videoconferenza sincrona</option>
                        <option value="Teoria + Prove Pratiche">Teoria + Prove Pratiche</option>
                        <option value="Misto (Blended)">Misto (Blended)</option>
                        <option value="Videoconferenza sincrona">Videoconferenza sincrona (Solo Online)</option>
                        <option value="E-learning (FAD)">E-learning (FAD Online)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sede / Città di svolgimento */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#df0000]" />
                        <span>Città o Sede del Corso</span>
                        {isPresenceCourse ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-[#df0000] px-2 py-0.5 rounded-md">
                            Corso in Presenza
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">(Opzionale per corsi Online)</span>
                        )}
                      </label>
                      <span className="text-[11px] text-slate-500">Visibile sui filtri territoriali e nelle schede</span>
                    </div>

                    <input
                      type="text"
                      value={courseForm.location}
                      onChange={(e) => setCourseForm({ ...courseForm, location: e.target.value })}
                      placeholder="es. Porto Torres (SS), Sassari, Milano o Presso Sede Cliente"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    />

                    {/* Quick City chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Sedi Rapide:</span>
                      {["Porto Torres (SS)", "Sassari", "Cagliari", "Olbia", "Presso Sede Cliente"].map((sugg) => (
                        <button
                          key={sugg}
                          type="button"
                          onClick={() => setCourseForm({ ...courseForm, location: sugg })}
                          className="text-[10px] px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#008e97] hover:text-[#008e97] text-slate-700 font-medium transition-colors"
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Periodo / Indicazione Prossima Sessione
                      </label>
                      <input
                        type="text"
                        value={courseForm.period}
                        onChange={(e) => setCourseForm({ ...courseForm, period: e.target.value })}
                        placeholder="es. Prossima sessione: 24 Ottobre 2026 oppure In partenza a breve"
                        className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                      />
                    </div>

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
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
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
                        className="text-[10px] text-[#008e97] hover:underline font-semibold"
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
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
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
                          URL Immagine o Carica File
                        </label>
                        <input
                          type="text"
                          value={courseForm.image_url}
                          onChange={(e) => setCourseForm({ ...courseForm, image_url: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 mb-2"
                        />

                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#008e97]" />
                          <span>Carica Foto dal Computer</span>
                        </button>
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
                              onClick={() => setCourseForm({ ...courseForm, image_url: p.url })}
                              className={`text-[10px] p-2 rounded-xl text-left border transition-all truncate ${
                                courseForm.image_url === p.url
                                  ? "bg-[#e6f6f7] border-[#008e97] text-[#008e97] font-bold"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
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
                            src={courseForm.image_url || COURSE_IMAGE_PRESETS[0].url}
                            alt="Anteprima"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold uppercase">
                              {courseForm.category}
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
                            <span>{courseForm.mode}</span>
                            {courseForm.location && (
                              <>
                                <span>•</span>
                                <span className="text-[#df0000]">{courseForm.location}</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-amber-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={courseForm.is_featured}
                          onChange={(e) => setCourseForm({ ...courseForm, is_featured: e.target.checked })}
                          className="mt-0.5 w-4 h-4 text-amber-500 rounded focus:ring-0"
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
                          className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-0"
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

              {/* Wizard Footer Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Annulla
                </button>

                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Indietro</span>
                    </button>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-5 py-2.5 bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Avanti</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{editingCourse ? "Salva Modifiche" : "Pubblica Corso"}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. DELETE CONFIRMATION DIALOG */}
      {/* ===================================================================== */}
      {deleteConfirmCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 text-[#df0000] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Eliminare questo corso?</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Stai per eliminare definitivamente il corso:
              </p>
              <div className="p-3 mt-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                {deleteConfirmCourse.title}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Questa operazione rimuoverà la scheda pubblica e le informazioni associate.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCourse(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteCourse(deleteConfirmCourse.id);
                  setDeleteConfirmCourse(null);
                  showToast(`Corso "${deleteConfirmCourse.title}" eliminato.`);
                }}
                className="px-5 py-2.5 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-colors"
              >
                Sì, Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
