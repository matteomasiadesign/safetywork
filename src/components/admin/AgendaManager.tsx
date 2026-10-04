"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  GraduationCap,
  HardHat,
  Scale,
  CalendarDays,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Download,
  ExternalLink,
  BookOpen,
  Building,
  RotateCcw,
  Layers,
  Sparkles,
  ArrowRight,
  Inbox,
  CalendarPlus,
  Phone,
  Mail,
} from "lucide-react";
import { AgendaEvent, AgendaEventType, AgendaEventStatus, Course, Inquiry } from "@/lib/types/database";
import type { AgendaEventInput } from "@/context/AdminDataContext";
import { buildIcs } from "@/lib/utils/ics";
import AdminModal from "@/components/admin/ui/AdminModal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { btnOutline, btnSecondary, btnTeal } from "@/components/admin/ui/styles";

type ViewMode = "month" | "week" | "day" | "year" | "list";

interface AgendaManagerProps {
  events: AgendaEvent[];
  onSaveEvent: (input: AgendaEventInput, id?: string) => Promise<unknown>;
  onDeleteEvent: (id: string) => Promise<void>;
  courses?: Course[];
  inquiries?: Inquiry[];
  preselectedInquiry?: Inquiry | null;
  onClearPreselectedInquiry?: () => void;
  onNavigateToInquiries?: () => void;
  showToast?: (msg: string, tone?: "success" | "error") => void;
}

const MONTH_NAMES_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

const DAY_NAMES_SHORT_IT = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const EVENT_TYPE_CONFIG: Record<
  AgendaEventType,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  corso: {
    label: "Corso di Formazione",
    bg: "bg-[#e6f6f7]",
    text: "text-[#008e97]",
    border: "border-[#008e97]/30",
    icon: GraduationCap,
  },
  sopralluogo: {
    label: "Sopralluogo Tecnico",
    bg: "bg-amber-50",
    text: "text-[#f58220]",
    border: "border-amber-300",
    icon: HardHat,
  },
  scadenza: {
    label: "Scadenza Normativa",
    bg: "bg-[#fdf2f2]",
    text: "text-[#df0000]",
    border: "border-red-300",
    icon: AlertTriangle,
  },
  consulenza: {
    label: "Consulenza / Riunione",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: Scale,
  },
  appuntamento: {
    label: "Incontro Cliente",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: User,
  },
  altro: {
    label: "Altro / Personalizzato",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: CalendarDays,
  },
};

// Helper per ottenere configurazione badge e icona considerando tipologie libere/personalizzate
const getEventTypeConfig = (type: AgendaEventType, customType?: string) => {
  const base = EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.altro || EVENT_TYPE_CONFIG.corso;
  if (type === "altro" && customType?.trim()) {
    return {
      ...base,
      label: customType.trim(),
    };
  }
  return base;
};

const STATUS_CONFIG: Record<AgendaEventStatus, { label: string; badge: string }> = {
  programmato: { label: "Programmato", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  confermato: { label: "Confermato", badge: "bg-emerald-50 text-emerald-700 border-emerald-300" },
  completato: { label: "Completato", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  annullato: { label: "Annullato", badge: "bg-rose-50 text-rose-700 border-rose-200 line-through" },
};

export default function AgendaManager({
  events,
  onSaveEvent,
  onDeleteEvent,
  courses = [],
  inquiries = [],
  preselectedInquiry,
  onClearPreselectedInquiry,
  onNavigateToInquiries,
  showToast,
}: AgendaManagerProps) {
  // 1. STATO: gli eventi arrivano da Supabase (props), nessuna copia locale
  const [isSaving, setIsSaving] = useState(false);

  // Se viene fornita una richiesta dal sito da pianificare, apre automaticamente il modale precompilato
  useEffect(() => {
    if (preselectedInquiry) {
      openAddModalWithInquiry(preselectedInquiry);
      onClearPreselectedInquiry?.();
    }
  }, [preselectedInquiry]);

  // 2. NAVIGAZIONE E VISTA
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });

  // 3. FILTRI E RICERCA
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  // Su mobile la ricerca sta chiusa finché non serve
  const [showSearch, setShowSearch] = useState(false);
  const filtersActive = Boolean(searchTerm.trim()) || filterType !== "all" || filterStatus !== "all";

  // 4. MODALI E DETTAGLI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<AgendaEvent | null>(null);
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: AgendaEventType;
    customType: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    location: string;
    instructor: string;
    courseId: string;
    maxParticipants: number | string;
    status: AgendaEventStatus;
    notes: string;
    inquiryId: string;
    clientName: string;
    clientCompany: string;
    clientPhone: string;
    clientEmail: string;
  }>({
    title: "",
    description: "",
    type: "corso",
    customType: "",
    startDate: selectedDate,
    endDate: "",
    startTime: "09:00",
    endTime: "13:00",
    location: "Aula Didattica Porto Torres",
    instructor: "",
    courseId: "",
    maxParticipants: "",
    status: "confermato",
    notes: "",
    inquiryId: "",
    clientName: "",
    clientCompany: "",
    clientPhone: "",
    clientEmail: "",
  });

  // Helper date
  const pad = (n: number) => String(n).padStart(2, "0");
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const shiftSelectedDay = (delta: number) => {
    const [y, m, day] = selectedDate.split("-").map(Number);
    const d = new Date(y, m - 1, day + delta);
    setSelectedDate(toDateStr(d));
    setCurrentDate(d);
  };

  // Reset a oggi
  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
  };

  // Navigazione Prev / Next in base alla vista
  const handlePrev = () => {
    if (viewMode === "day") return shiftSelectedDay(-1);
    const d = new Date(currentDate);
    if (viewMode === "year") {
      d.setFullYear(d.getFullYear() - 1);
    } else if (viewMode === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    if (viewMode === "day") return shiftSelectedDay(1);
    const d = new Date(currentDate);
    if (viewMode === "year") {
      d.setFullYear(d.getFullYear() + 1);
    } else if (viewMode === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  // Filtraggio Eventi
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchSearch =
        !searchTerm.trim() ||
        evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evt.description && evt.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evt.instructor && evt.instructor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evt.location && evt.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = filterType === "all" || evt.type === filterType;
      const matchStatus = filterStatus === "all" || evt.status === filterStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [events, searchTerm, filterType, filterStatus]);

  // Mappa Eventi per Data (YYYY-MM-DD -> AgendaEvent[])
  const eventsByDate = useMemo(() => {
    const map: Record<string, AgendaEvent[]> = {};
    filteredEvents.forEach((evt) => {
      if (!map[evt.startDate]) map[evt.startDate] = [];
      map[evt.startDate].push(evt);
    });
    // Ordina eventi per orario all'interno di ogni giorno
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.startTime || "00:00").localeCompare(b.startTime || "00:00"));
    });
    return map;
  }, [filteredEvents]);

  // Eventi per la data selezionata
  const selectedDateEvents = useMemo(() => {
    return eventsByDate[selectedDate] || [];
  }, [eventsByDate, selectedDate]);

  // Eventi per il modale panoramica del giorno selezionato
  const dayModalEvents = useMemo(() => {
    if (!dayModalDate) return [];
    return eventsByDate[dayModalDate] || [];
  }, [eventsByDate, dayModalDate]);

  // Helper formattazione data completa in italiano (es. "Venerdì 18 Settembre 2026")
  const formatItalianDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNames = [
      "Domenica",
      "Lunedì",
      "Martedì",
      "Mercoledì",
      "Giovedì",
      "Venerdì",
      "Sabato",
    ];
    return `${dayNames[dateObj.getDay()]} ${d} ${MONTH_NAMES_IT[m - 1]} ${y}`;
  };

  // Open Add Modal
  const openAddModal = (dateStr?: string) => {
    const targetDate = dateStr || selectedDate;
    setEditingEventId(null);
    setFormData({
      title: "",
      description: "",
      type: "corso",
      customType: "",
      startDate: targetDate,
      endDate: "",
      startTime: "09:00",
      endTime: "13:00",
      location: "Aula Didattica Porto Torres",
      instructor: "",
      courseId: "",
      maxParticipants: "",
      status: "confermato",
      notes: "",
      inquiryId: "",
      clientName: "",
      clientCompany: "",
      clientPhone: "",
      clientEmail: "",
    });
    setIsModalOpen(true);
  };

  // Open Add Modal precompilato da una richiesta dal sito
  const openAddModalWithInquiry = (inq: Inquiry) => {
    setEditingEventId(null);
    const courseOrService = inq.courseTitle || inq.service_type || "Consulenza e Formazione";
    const clientInfo = inq.company ? `${inq.name} (${inq.company})` : inq.name;
    setFormData({
      title: `${courseOrService} - ${clientInfo}`,
      description: inq.message ? `Messaggio cliente: "${inq.message}"` : "",
      type: inq.type === "corso" ? "corso" : "consulenza",
      customType: "",
      startDate: selectedDate,
      endDate: "",
      startTime: "09:00",
      endTime: "13:00",
      location: inq.address ? `${inq.address} ${inq.city || ""}`.trim() : "Aula Didattica Porto Torres",
      instructor: "",
      courseId: inq.courseId || "",
      maxParticipants: "",
      status: "confermato",
      notes: `Richiesta dal sito | Email: ${inq.email}${inq.phone ? ` | Tel: ${inq.phone}` : ""}${inq.notes ? ` | Note: ${inq.notes}` : ""}`,
      inquiryId: inq.id,
      clientName: inq.name,
      clientCompany: inq.company || "",
      clientPhone: inq.phone || "",
      clientEmail: inq.email || "",
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (evt: AgendaEvent) => {
    setEditingEventId(evt.id);
    setFormData({
      title: evt.title,
      description: evt.description || "",
      type: evt.type,
      customType: evt.customType || "",
      startDate: evt.startDate,
      endDate: evt.endDate || "",
      startTime: evt.startTime || "09:00",
      endTime: evt.endTime || "13:00",
      location: evt.location || "",
      instructor: evt.instructor || "",
      courseId: evt.courseId || "",
      maxParticipants: evt.maxParticipants ?? "",
      status: evt.status,
      notes: evt.notes || "",
      inquiryId: evt.inquiryId || "",
      clientName: evt.clientName || "",
      clientCompany: evt.clientCompany || "",
      clientPhone: evt.clientPhone || "",
      clientEmail: evt.clientEmail || "",
    });
    setSelectedEventForDetail(null);
    setIsModalOpen(true);
  };

  // Save Event (Supabase)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) {
      showToast?.("Inserisci almeno il titolo e la data di inizio dell'impegno.", "error");
      return;
    }

    const hasInquiry = Boolean(formData.inquiryId?.trim());
    const input: AgendaEventInput = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      customType: formData.customType,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      instructor: formData.instructor,
      courseId: formData.courseId,
      maxParticipants: Number(formData.maxParticipants) || undefined,
      notes: formData.notes,
      inquiryId: formData.inquiryId,
      clientName: hasInquiry ? formData.clientName : "",
      clientCompany: hasInquiry ? formData.clientCompany : "",
      clientPhone: hasInquiry ? formData.clientPhone : "",
      clientEmail: hasInquiry ? formData.clientEmail : "",
    };

    setIsSaving(true);
    try {
      await onSaveEvent(input, editingEventId ?? undefined);
      showToast?.(editingEventId ? "Impegno aggiornato." : "Nuovo impegno inserito in agenda.");
      setIsModalOpen(false);
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : "Salvataggio non riuscito.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Event (Supabase)
  const handleDeleteEvent = async (id: string) => {
    try {
      await onDeleteEvent(id);
      setDeleteConfirmId(null);
      setSelectedEventForDetail(null);
      showToast?.("Impegno rimosso dall'agenda.");
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : "Eliminazione non riuscita.", "error");
    }
  };

  // Export iCal (.ics)
  const handleExportIcs = () => {
    if (events.length === 0) {
      showToast?.("Nessun evento da esportare.", "error");
      return;
    }

    const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `agenda-safety-works-${currentYear}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast?.("File calendario .ICS esportato.");
  };

  // Calcolo celle del Mese (compresi giorni mese precedente e successivo)
  const monthCalendarCells = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    // getDay(): 0 = Dom, 1 = Lun ... converti in Lun = 0, Dom = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = (() => {
      const t = new Date();
      return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
    })();

    // Giorni mese precedente
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${pad(prevM + 1)}-${pad(dayNum)}`;
      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Giorni mese corrente
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(i)}`;
      cells.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Giorni mese successivo per completare la griglia a 35 o 42 celle
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${pad(nextM + 1)}-${pad(i)}`;
      cells.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Calcolo giorni della settimana corrente (per la vista Settimana)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    let dayOfWeek = d.getDay() - 1;
    if (dayOfWeek === -1) dayOfWeek = 6;
    d.setDate(d.getDate() - dayOfWeek); // Vai al lunedì

    const days = [];
    const todayStr = (() => {
      const t = new Date();
      return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
    })();

    for (let i = 0; i < 7; i++) {
      const curr = new Date(d);
      curr.setDate(d.getDate() + i);
      const dateStr = `${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`;
      days.push({
        date: curr,
        dateStr,
        dayName: DAY_NAMES_SHORT_IT[i],
        dayNumber: curr.getDate(),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [currentDate]);

  const SHORT_MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const periodLabel = (() => {
    if (viewMode === "year") return String(currentYear);
    if (viewMode === "list") return "Tutti gli impegni";
    if (viewMode === "day") {
      const [y, m, day] = selectedDate.split("-").map(Number);
      return `${day} ${MONTH_NAMES_IT[m - 1]} ${y}`;
    }
    if (viewMode === "week") {
      const first = weekDays[0].date;
      const last = weekDays[6].date;
      return `${first.getDate()} ${SHORT_MONTHS[first.getMonth()]} – ${last.getDate()} ${SHORT_MONTHS[last.getMonth()]} ${last.getFullYear()}`;
    }
    return `${MONTH_NAMES_IT[currentMonth]} ${currentYear}`;
  })();

  return (
    <div className="space-y-4">
      {/* =========================================================================
          BARRA STRUMENTI: navigazione nel tempo, viste e ricerca (su mobile la ricerca si apre a richiesta)
          ========================================================================= */}
      <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs sm:p-3.5">
        {/* Riga 1: periodo + nuovo impegno */}
        <div className="flex items-center gap-2">
          {viewMode !== "list" && (
            <div className="flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={handlePrev}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-all hover:bg-white active:bg-slate-200"
                title="Periodo precedente"
                aria-label="Periodo precedente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToday}
                className="h-10 rounded-lg px-2.5 text-xs font-bold text-slate-800 transition-all hover:bg-white active:bg-slate-200"
              >
                Oggi
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-all hover:bg-white active:bg-slate-200"
                title="Periodo successivo"
                aria-label="Periodo successivo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile: il periodo mostrato, a colpo d'occhio */}
          <div className="min-w-0 flex-1 truncate text-sm font-extrabold tracking-tight text-slate-900 sm:hidden">{periodLabel}</div>

          {/* Da tablet: scelta rapida di mese e anno (o titolo del periodo) */}
          {(viewMode === "month" || viewMode === "week") && (
            <div className="hidden items-center gap-1 sm:flex">
              <select
                value={currentMonth}
                onChange={(e) => {
                  const d = new Date(currentDate);
                  d.setMonth(Number(e.target.value));
                  setCurrentDate(d);
                }}
                aria-label="Mese"
                className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
              >
                {MONTH_NAMES_IT.map((m, idx) => (
                  <option key={idx} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => {
                  const d = new Date(currentDate);
                  d.setFullYear(Number(e.target.value));
                  setCurrentDate(d);
                }}
                aria-label="Anno"
                className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
          {(viewMode === "day" || viewMode === "year") && (
            <div className="hidden text-sm font-extrabold tracking-tight text-slate-900 sm:block">{periodLabel}</div>
          )}

          <span className="hidden rounded-full border border-[#008e97]/20 bg-[#e6f6f7] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#008e97] md:inline">
            {filteredEvents.length} impegni
          </span>

          <button
            type="button"
            onClick={() => openAddModal()}
            aria-label="Nuovo impegno"
            className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#008e97] text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-[#00777f] active:bg-[#006e75] sm:h-10 sm:w-auto sm:px-3.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo</span>
          </button>
        </div>

        {/* Riga 2: viste (5 voci a larghezza uguale: nessuno scorrimento) + interruttore ricerca su mobile */}
        <div className="flex items-center gap-2">
          <div className="grid min-w-0 flex-1 grid-cols-5 gap-0.5 rounded-xl border border-slate-200 bg-slate-100 p-0.5 sm:flex-none sm:grid-cols-[repeat(5,auto)]">
            {(
              [
                { id: "month", label: "Mese", short: "Mese" },
                { id: "week", label: "Settimana", short: "Sett." },
                { id: "day", label: "Giorno", short: "Giorno" },
                { id: "year", label: "Anno", short: "Anno" },
                { id: "list", label: "Elenco", short: "Elenco" },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewMode(v.id)}
                aria-pressed={viewMode === v.id}
                className={`min-h-10 whitespace-nowrap rounded-lg px-1 text-xs font-bold transition-all sm:px-4 ${
                  viewMode === v.id ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span className="sm:hidden">{v.short}</span>
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowSearch((v) => !v)}
            aria-expanded={showSearch || filtersActive}
            aria-label="Cerca, filtra ed esporta"
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors sm:hidden ${
              showSearch || filtersActive
                ? "border-[#008e97]/40 bg-[#e6f6f7] text-[#008e97]"
                : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
          >
            <Search className="h-4 w-4" />
            {filtersActive && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#df0000]" />}
          </button>
        </div>

        {/* Riga 3: ricerca, tipologia ed esportazione (sempre visibili da tablet, a richiesta su mobile) */}
        <div className={`${showSearch || filtersActive ? "flex" : "hidden"} items-center gap-2 border-t border-slate-100 pt-2.5 sm:flex`}>
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca impegno..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008e97] [&::-webkit-search-cancel-button]:hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Cancella la ricerca"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Tipologia"
            className="w-28 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97] sm:w-auto"
          >
            <option value="all">Tutti i tipi</option>
            <option value="corso">Corsi</option>
            <option value="sopralluogo">Sopralluoghi</option>
            <option value="scadenza">Scadenze</option>
            <option value="consulenza">Consulenze</option>
            <option value="appuntamento">Incontri</option>
            <option value="altro">Altro</option>
          </select>

          <button
            type="button"
            onClick={handleExportIcs}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 shadow-2xs transition-colors hover:bg-slate-100 sm:h-10 sm:w-10"
            title="Esporta calendario .ICS"
            aria-label="Esporta calendario .ICS"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          4. VISTE DEL CALENDARIO OTTIMIZZATE
          ========================================================================= */}

      {/* -------------------- VISTA MESE (IBRIDA DESKTOP / MOBILE) -------------------- */}
      {viewMode === "month" && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Intestazione Colonne Giorni */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-[10px] sm:text-xs font-bold text-slate-600 py-2 sm:py-3">
              {DAY_NAMES_SHORT_IT.map((d, i) => (
                <div key={i} className="tracking-wider uppercase">
                  {d}
                </div>
              ))}
            </div>

            {/* Griglia Giorni Mese */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 select-none">
              {monthCalendarCells.map((cell, idx) => {
                const dayEvents = eventsByDate[cell.dateStr] || [];
                const isSelected = selectedDate === cell.dateStr;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDate(cell.dateStr);
                      // Su desktop apre anche il modale panoramica del giorno
                      if (typeof window !== "undefined" && window.innerWidth >= 640) {
                        setDayModalDate(cell.dateStr);
                      }
                    }}
                    className={`min-h-[54px] sm:min-h-[130px] p-1 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer group ${
                      cell.isCurrentMonth
                        ? "bg-white hover:bg-slate-50/80"
                        : "bg-slate-50/50 text-slate-400 hover:bg-slate-100/60"
                    } ${
                      isSelected
                        ? "ring-2 ring-[#008e97] ring-inset bg-[#e6f6f7]/25"
                        : "hover:border-slate-300"
                    }`}
                    title={`Impegni del ${cell.dateStr}`}
                  >
                    {/* Top: Numero Giorno */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-transform group-hover:scale-105 ${
                          cell.isToday
                            ? "bg-[#008e97] text-white shadow-xs"
                            : isSelected
                            ? "bg-[#008e97]/15 text-[#008e97] font-black"
                            : cell.isCurrentMonth
                            ? "text-slate-800 group-hover:text-[#008e97]"
                            : "text-slate-400"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddModal(cell.dateStr);
                        }}
                        className="hidden sm:block opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#008e97] hover:bg-slate-100 rounded-md transition-all"
                        title={`Aggiungi rapidamente un impegno per il ${cell.dateStr}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* VISTA MOBILE: DOT INDICATORS (Zero sovraffollamento) */}
                    <div className="flex sm:hidden items-center justify-center gap-1 my-1 min-h-[12px]">
                      {dayEvents.slice(0, 3).map((evt) => {
                        const dotColor =
                          evt.type === "corso"
                            ? "bg-[#008e97]"
                            : evt.type === "sopralluogo"
                            ? "bg-[#f58220]"
                            : evt.type === "scadenza"
                            ? "bg-[#df0000]"
                            : evt.type === "consulenza"
                            ? "bg-purple-600"
                            : evt.type === "appuntamento"
                            ? "bg-emerald-600"
                            : "bg-slate-500";
                        return (
                          <span
                            key={evt.id}
                            className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 shadow-2xs`}
                            title={`${evt.startTime || ""} ${evt.title}`}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] font-bold text-slate-400 leading-none">
                          +
                        </span>
                      )}
                    </div>

                    {/* VISTA DESKTOP: PILLS COMPLETE INFORMATIVE */}
                    <div className="hidden sm:block space-y-1 my-1 overflow-hidden pointer-events-none">
                      {dayEvents.slice(0, 3).map((evt) => {
                        const cfg = getEventTypeConfig(evt.type, evt.customType);
                        return (
                          <div
                            key={evt.id}
                            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold truncate border ${cfg.bg} ${cfg.text} ${cfg.border} flex items-center gap-1 shadow-2xs`}
                            title={`${evt.startTime || ""} ${evt.title}`}
                          >
                            <span className="font-mono text-[9px] opacity-85 shrink-0">
                              {evt.startTime?.slice(0, 5)}
                            </span>
                            <span className="truncate">{evt.title}</span>
                          </div>
                        );
                      })}

                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-slate-500 font-bold pl-1">
                          +{dayEvents.length - 3} altri
                        </div>
                      )}
                    </div>

                    {/* Bottom Desktop: Conteggio impegni */}
                    <div className="hidden sm:flex items-center justify-between text-[10px] pt-1">
                      {dayEvents.length > 0 ? (
                        <span className="font-bold text-[#008e97] group-hover:underline flex items-center gap-1">
                          <span>{dayEvents.length} {dayEvents.length === 1 ? "impegno" : "impegni"}</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          + pianifica
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SCHEDA GIORNALIERA MOBILE (FEED SOTTO IL MESE AL TOCCO) */}
          <div className="sm:hidden bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#008e97]">
                  Impegni del Giorno Selezionato
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  {formatItalianDate(selectedDate)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => openAddModal(selectedDate)}
                className="inline-flex min-h-11 items-center gap-1 px-3.5 bg-[#008e97] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#00777f] active:bg-[#006e75]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi</span>
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-1.5 opacity-70" />
                <p>Nessun impegno in programma per questa data.</p>
                <button
                  type="button"
                  onClick={() => openAddModal(selectedDate)}
                  className="mt-2 min-h-11 px-3 text-[#008e97] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Crea un nuovo impegno</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((evt) => {
                  const cfg = getEventTypeConfig(evt.type, evt.customType);
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedEventForDetail(evt)}
                      className={`p-3 rounded-xl border ${cfg.border} bg-white shadow-2xs space-y-1.5 cursor-pointer active:scale-98 transition-all`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          <span className="font-mono text-[11px] font-bold text-slate-700">
                            {evt.startTime} - {evt.endTime}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${STATUS_CONFIG[evt.status].badge}`}>
                          {STATUS_CONFIG[evt.status].label}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {evt.title}
                      </h5>
                      {evt.location && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- VISTA SETTIMANA (CON SCROLL ORIZZONTALE MOBILE) -------------------- */}
      {viewMode === "week" && (
        <>
          {/* Mobile: un blocco per giorno, in colonna (niente scorrimento orizzontale) */}
          <div className="space-y-2.5 sm:hidden">
            {weekDays.map((wd) => {
              const dayEvents = eventsByDate[wd.dateStr] || [];
              return (
                <section
                  key={wd.dateStr}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-xs ${
                    wd.isToday ? "border-[#008e97]/50 ring-1 ring-[#008e97]/20" : "border-slate-200"
                  }`}
                >
                  <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl ${
                          wd.isToday ? "bg-[#008e97] text-white" : "bg-white text-slate-900 ring-1 ring-slate-200"
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase leading-none opacity-80">{wd.dayName}</span>
                        <span className="mt-0.5 text-base font-black leading-none">{wd.dayNumber}</span>
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {dayEvents.length === 0
                          ? "Nessun impegno"
                          : `${dayEvents.length} ${dayEvents.length === 1 ? "impegno" : "impegni"}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAddModal(wd.dateStr)}
                      aria-label={`Aggiungi un impegno per il ${wd.dayName} ${wd.dayNumber}`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-[#008e97] transition-colors hover:bg-[#e6f6f7] active:bg-[#d3eff1]"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </header>

                  {dayEvents.length > 0 && (
                    <div className="space-y-2 p-2.5">
                      {dayEvents.map((evt) => {
                        const cfg = getEventTypeConfig(evt.type, evt.customType);
                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => setSelectedEventForDetail(evt)}
                            className={`block w-full space-y-1 rounded-xl border p-3 text-left transition-colors active:brightness-95 ${cfg.border} ${cfg.bg}`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                              <span className="font-mono text-slate-700">
                                {evt.startTime} - {evt.endTime}
                              </span>
                              <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase ${STATUS_CONFIG[evt.status].badge}`}>
                                {STATUS_CONFIG[evt.status].label}
                              </span>
                            </div>
                            <h5 className={`text-sm font-bold leading-snug ${cfg.text}`}>{evt.title}</h5>
                            {evt.location && (
                              <div className="flex min-w-0 items-center gap-1 text-[11px] text-slate-500">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>


        <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 divide-x divide-slate-200 text-center">
                {weekDays.map((wd, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedDate(wd.dateStr);
                      setDayModalDate(wd.dateStr);
                    }}
                    className={`py-3 px-2 cursor-pointer transition-colors ${
                      wd.isToday ? "bg-[#e6f6f7]/60" : "hover:bg-slate-100"
                    }`}
                    title={`Clicca per vedere tutti gli impegni del ${wd.dateStr}`}
                  >
                    <div className="text-[11px] uppercase font-bold text-slate-500">
                      {wd.dayName}
                    </div>
                    <div
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-black mt-1 ${
                        wd.isToday ? "bg-[#008e97] text-white" : "text-slate-900"
                      }`}
                    >
                      {wd.dayNumber}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[450px]">
                {weekDays.map((wd, i) => {
                  const dayEvents = eventsByDate[wd.dateStr] || [];
                  return (
                    <div
                      key={i}
                      className="p-2 space-y-2 bg-white flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        {dayEvents.map((evt) => {
                          const cfg = getEventTypeConfig(evt.type, evt.customType);
                          return (
                            <div
                              key={evt.id}
                              onClick={() => setSelectedEventForDetail(evt)}
                              className={`p-2 rounded-xl border ${cfg.bg} ${cfg.border} cursor-pointer hover:shadow-xs transition-all`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                                <span className="font-mono text-slate-700">
                                  {evt.startTime} - {evt.endTime}
                                </span>
                                <span className={`px-1 rounded text-[9px] uppercase ${STATUS_CONFIG[evt.status].badge}`}>
                                  {evt.status}
                                </span>
                              </div>
                              <h5 className={`text-xs font-bold leading-snug line-clamp-2 ${cfg.text}`}>
                                {evt.title}
                              </h5>
                              {evt.location && (
                                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 truncate min-w-0">
                                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{evt.location}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {dayEvents.length === 0 && (
                          <div className="py-8 text-center text-slate-300 text-xs italic">
                            Nessun impegno
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* -------------------- VISTA GIORNO -------------------- */}
      {viewMode === "day" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3 pb-4 mb-4 sm:mb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#008e97]">
                Dettaglio Giornaliero
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {formatItalianDate(selectedDate)}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => openAddModal(selectedDate)}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 px-4 bg-[#008e97] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#00777f]"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi</span>
            </button>
          </div>

          <div className="space-y-4">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-base font-bold text-slate-700">Nessun impegno pianificato per questa data</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Usa il pulsante in alto o clicca qui sotto per programmare una sessione o un sopralluogo.
                </p>
                <button
                  type="button"
                  onClick={() => openAddModal(selectedDate)}
                  className="mt-4 px-4 py-2 bg-white text-[#008e97] border border-[#008e97]/30 text-xs font-bold rounded-xl hover:bg-[#e6f6f7]"
                >
                  + Crea impegno per il {selectedDate}
                </button>
              </div>
            ) : (
              selectedDateEvents.map((evt) => {
                const cfg = getEventTypeConfig(evt.type, evt.customType);
                const IconComponent = cfg.icon;

                return (
                  <div
                    key={evt.id}
                    className={`p-4 sm:p-5 rounded-2xl border ${cfg.border} bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_CONFIG[evt.status].badge}`}>
                            {STATUS_CONFIG[evt.status].label}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 leading-snug">
                          {evt.title}
                        </h4>
                        {evt.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2.5">
                          <span className="flex items-center gap-1 font-mono text-slate-700 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {evt.startTime} - {evt.endTime}
                          </span>
                          {evt.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {evt.location}
                            </span>
                          )}
                          {evt.instructor && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              Docente/Perito: <strong>{evt.instructor}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(evt)}
                        className="p-3 sm:p-2 text-slate-600 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-xl border border-slate-200 transition-colors"
                        title="Modifica"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(evt.id)}
                        className="p-3 sm:p-2 text-slate-600 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-xl border border-slate-200 transition-colors"
                        title="Elimina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* -------------------- VISTA ANNO -------------------- */}
      {viewMode === "year" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#008e97]">
                Panoramica Annuale
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Anno {currentYear}
              </h3>
            </div>
            <span className="hidden sm:inline text-xs text-slate-500 font-semibold">
              Clicca su un mese per accedere direttamente alla vista mensile
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {MONTH_NAMES_IT.map((mName, mIdx) => {
              const daysInThisMonth = new Date(currentYear, mIdx + 1, 0).getDate();
              let monthEventsCount = 0;
              for (let d = 1; d <= daysInThisMonth; d++) {
                const dStr = `${currentYear}-${pad(mIdx + 1)}-${pad(d)}`;
                if (eventsByDate[dStr]) monthEventsCount += eventsByDate[dStr].length;
              }

              return (
                <div
                  key={mIdx}
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setMonth(mIdx);
                    setCurrentDate(d);
                    setViewMode("month");
                  }}
                  className="p-3 sm:p-4 rounded-2xl border border-slate-200 hover:border-[#008e97] bg-slate-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-[#008e97] transition-colors">
                      {mName}
                    </h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        monthEventsCount > 0
                          ? "bg-[#008e97] text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {monthEventsCount}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-2">
                    {monthEventsCount === 0
                      ? "Nessun evento registrato"
                      : `${monthEventsCount} ${monthEventsCount === 1 ? "impegno programmato" : "impegni programmati"}`}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-[#008e97] font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Apri mese</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------- VISTA LISTA / ELENCO -------------------- */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-slate-800">
              Tutti gli impegni in ordine cronologico ({filteredEvents.length})
            </h4>
            <span className="hidden sm:inline text-xs text-slate-500">
              Aggiornato in tempo reale
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEvents.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                Nessun impegno corrisponde ai criteri di ricerca.
              </div>
            ) : (
              filteredEvents
                .slice()
                .sort((a, b) => a.startDate.localeCompare(b.startDate))
                .map((evt) => {
                  const cfg = getEventTypeConfig(evt.type, evt.customType);
                  const IconComponent = cfg.icon;

                  return (
                    <div
                      key={evt.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0 mt-0.5`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              {evt.startDate}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                              {cfg.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_CONFIG[evt.status].badge}`}>
                              {STATUS_CONFIG[evt.status].label}
                            </span>
                          </div>

                          <h5 className="text-base font-bold text-slate-900 leading-snug">
                            {evt.title}
                          </h5>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                            <span className="flex items-center gap-1 font-mono text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {evt.startTime} - {evt.endTime}
                            </span>
                            {evt.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {evt.location}
                              </span>
                            )}
                            {evt.instructor && (
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                {evt.instructor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditModal(evt)}
                          className="p-3 sm:p-2 text-slate-600 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-xl border border-slate-200 transition-colors"
                          title="Modifica"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(evt.id)}
                          className="p-3 sm:p-2 text-slate-600 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-xl border border-slate-200 transition-colors"
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE: PANORAMICA DEGLI IMPEGNI DEL GIORNO
          ========================================================================= */}
      <AdminModal
        open={Boolean(dayModalDate)}
        onClose={() => setDayModalDate(null)}
        title={dayModalDate ? formatItalianDate(dayModalDate) : ""}
        subtitle={`${dayModalEvents.length} ${dayModalEvents.length === 1 ? "impegno programmato" : "impegni programmati"}`}
        icon={<CalendarDays className="h-5 w-5" />}
        size="lg"
        stripe
        bodyClassName="p-4 sm:p-6 space-y-3.5"
        footer={
          dayModalDate ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  const d = dayModalDate;
                  setDayModalDate(null);
                  openAddModal(d);
                }}
                className={btnTeal}
              >
                <Plus className="h-4 w-4" />
                <span>Nuovo impegno</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const [y, m, d] = dayModalDate.split("-").map(Number);
                    setCurrentDate(new Date(y, m - 1, d));
                    setSelectedDate(dayModalDate);
                    setViewMode("day");
                    setDayModalDate(null);
                  }}
                  className={`${btnOutline} flex-1 normal-case tracking-normal sm:flex-none`}
                >
                  Vista giorno intera
                </button>
                <button type="button" onClick={() => setDayModalDate(null)} className={`${btnSecondary} flex-1 sm:flex-none`}>
                  Chiudi
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {dayModalDate && (
          <>
              {dayModalEvents.length === 0 ? (
                <div className="text-center py-10 sm:py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm sm:text-base font-bold text-slate-800">
                    Nessun impegno in programma per questa data
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Non ci sono corsi, sopralluoghi o scadenze pianificate per questo giorno.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const d = dayModalDate;
                      setDayModalDate(null);
                      openAddModal(d);
                    }}
                    className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Pianifica un impegno per questa data</span>
                  </button>
                </div>
              ) : (
                dayModalEvents.map((evt) => {
                  const cfg = getEventTypeConfig(evt.type, evt.customType);
                  const IconComponent = cfg.icon;

                  return (
                    <div
                      key={evt.id}
                      className={`p-3.5 sm:p-5 rounded-2xl border ${cfg.border} bg-white hover:border-[#008e97] transition-all shadow-xs flex flex-col gap-3 group`}
                    >
                      {/* Riga Tipologia, Stato e Orario */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bg} ${cfg.text}`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            <span>{cfg.label}</span>
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wide ${STATUS_CONFIG[evt.status].badge}`}
                          >
                            {STATUS_CONFIG[evt.status].label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg font-mono text-xs font-bold text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-[#008e97]" />
                          <span>
                            {evt.startTime || "09:00"} - {evt.endTime || "13:00"}
                          </span>
                        </div>
                      </div>

                      {/* Titolo e Descrizione */}
                      <div>
                        <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                          {evt.title}
                        </h4>
                        {evt.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>

                      {/* Info Richiesta Collegata se presente */}
                      {evt.inquiryId && (
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-purple-50/70 border border-purple-200/80 rounded-xl text-xs">
                          <div className="flex items-center gap-2 text-purple-900 font-bold truncate min-w-0">
                            <Inbox className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span className="truncate">
                              Cliente dal sito: {evt.clientName} {evt.clientCompany && `(${evt.clientCompany})`}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs min-w-0">
                            {evt.clientPhone && (
                              <a href={`tel:${evt.clientPhone}`} className="text-[#008e97] font-mono hover:underline">
                                📞 {evt.clientPhone}
                              </a>
                            )}
                            {evt.clientEmail && (
                              <a href={`mailto:${evt.clientEmail}`} className="text-slate-600 font-mono hover:underline break-all">
                                ✉️ {evt.clientEmail}
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Info logistiche: Sede, Docente, Note */}
                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                        {evt.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#f58220] shrink-0" />
                            <span className="font-semibold text-slate-700">{evt.location}</span>
                          </div>
                        )}
                        {evt.instructor && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#008e97] shrink-0" />
                            <span>
                              Docente/Perito: <strong className="text-slate-700">{evt.instructor}</strong>
                            </span>
                          </div>
                        )}
                        {evt.notes && (
                          <div className="w-full text-slate-500 italic text-[11px] bg-slate-50 p-2 rounded-lg mt-1">
                            Note: {evt.notes}
                          </div>
                        )}
                      </div>

                      {/* Azioni Modifica / Elimina */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(evt.id)}
                          className="px-3.5 min-h-11 sm:min-h-10 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Elimina</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDayModalDate(null);
                            openEditModal(evt);
                          }}
                          className="px-4 min-h-11 sm:min-h-10 text-xs font-bold bg-slate-100 hover:bg-[#e6f6f7] text-slate-700 hover:text-[#008e97] rounded-xl transition-colors inline-flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Modifica</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
          </>
        )}
      </AdminModal>

      {/* =========================================================================
          MODALE: DETTAGLIO DI UN IMPEGNO
          ========================================================================= */}
      <AdminModal
        open={Boolean(selectedEventForDetail)}
        onClose={() => setSelectedEventForDetail(null)}
        title="Dettaglio impegno"
        subtitle={selectedEventForDetail ? formatItalianDate(selectedEventForDetail.startDate) : undefined}
        icon={<CalendarIcon className="h-5 w-5" />}
        size="md"
        stripe
        bodyClassName="p-4 sm:p-6 space-y-4"
        footer={
          selectedEventForDetail ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedEventForDetail.id)}
                className={`${btnOutline} border-rose-200 text-rose-600 hover:bg-rose-50`}
              >
                <Trash2 className="h-4 w-4" />
                <span>Elimina</span>
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setSelectedEventForDetail(null)} className={`${btnSecondary} flex-1 sm:flex-none`}>
                  Chiudi
                </button>
                <button type="button" onClick={() => openEditModal(selectedEventForDetail)} className={`${btnTeal} flex-1 sm:flex-none`}>
                  <Edit2 className="h-4 w-4" />
                  <span>Modifica</span>
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {selectedEventForDetail && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const cfg = getEventTypeConfig(selectedEventForDetail.type, selectedEventForDetail.customType);
                return (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                );
              })()}
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${STATUS_CONFIG[selectedEventForDetail.status].badge}`}
              >
                {STATUS_CONFIG[selectedEventForDetail.status].label}
              </span>
            </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {selectedEventForDetail.title}
              </h3>

              {selectedEventForDetail.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedEventForDetail.description}
                </p>
              )}

              <div className="space-y-2.5 bg-slate-50 p-3.5 sm:p-4 rounded-xl text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#008e97] shrink-0" />
                  <span>
                    Data: <strong>{selectedEventForDetail.startDate}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#008e97] shrink-0" />
                  <span>
                    Orario: <strong>{selectedEventForDetail.startTime} - {selectedEventForDetail.endTime}</strong>
                  </span>
                </div>
                {selectedEventForDetail.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#f58220] shrink-0" />
                    <span>Sede / Aula: {selectedEventForDetail.location}</span>
                  </div>
                )}
                {selectedEventForDetail.instructor && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#df0000] shrink-0" />
                    <span>Responsabile / Docente: <strong>{selectedEventForDetail.instructor}</strong></span>
                  </div>
                )}
                {selectedEventForDetail.notes && (
                  <div className="pt-2 border-t border-slate-200 mt-2 text-slate-600 italic">
                    Note: {selectedEventForDetail.notes}
                  </div>
                )}
              </div>

              {/* Box Richiesta dal Sito Collegata */}
              {selectedEventForDetail.inquiryId && (
                <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                      <Inbox className="w-3.5 h-3.5 text-purple-600" />
                      <span>Richiesta dal Sito Collegata</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-purple-200/60 text-purple-900">
                      ID: {selectedEventForDetail.inquiryId}
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">
                    {selectedEventForDetail.clientName}{" "}
                    {selectedEventForDetail.clientCompany && (
                      <span className="font-normal text-slate-600">({selectedEventForDetail.clientCompany})</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs pt-1">
                    {selectedEventForDetail.clientPhone && (
                      <a
                        href={`tel:${selectedEventForDetail.clientPhone}`}
                        className="inline-flex items-center gap-1 text-[#008e97] hover:underline font-mono font-medium"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{selectedEventForDetail.clientPhone}</span>
                      </a>
                    )}
                    {selectedEventForDetail.clientEmail && (
                      <a
                        href={`mailto:${selectedEventForDetail.clientEmail}`}
                        className="inline-flex min-w-0 items-center gap-1 text-slate-600 hover:text-slate-900 hover:underline font-mono"
                      >
                        <Mail className="w-3 h-3" />
                        <span className="break-all">{selectedEventForDetail.clientEmail}</span>
                      </a>
                    )}
                    {onNavigateToInquiries && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEventForDetail(null);
                          onNavigateToInquiries();
                        }}
                        className="text-[11px] font-bold text-purple-700 hover:underline ml-auto inline-flex items-center gap-1"
                      >
                        <span>Apri nelle Richieste →</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
          </>
        )}
      </AdminModal>

      {/* =========================================================================
          MODALE: CREA / MODIFICA IMPEGNO
          ========================================================================= */}
      <AdminModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEventId ? "Modifica impegno" : "Nuovo impegno"}
        subtitle="Sessioni, visite o scadenze da pianificare"
        icon={<CalendarPlus className="h-5 w-5" />}
        size="md"
        stripe
        dismissOnBackdrop={false}
        footer={
          <div className="flex gap-2 sm:justify-end">
            <button type="button" onClick={() => setIsModalOpen(false)} className={`${btnSecondary} flex-1 sm:flex-none`}>
              Annulla
            </button>
            <button type="submit" form="agenda-form" disabled={isSaving} className={`${btnTeal} flex-[2] sm:flex-none`}>
              {editingEventId ? "Salva modifiche" : "Inserisci in agenda"}
            </button>
          </div>
        }
      >
        <form id="agenda-form" onSubmit={handleSaveEvent} className="space-y-3.5 sm:space-y-4">
                {/* 1. TITOLO DELL'IMPEGNO (CAMPO LIBERO PRINCIPALE) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Titolo dell'Impegno * <span className="font-medium text-slate-400">(Campo libero)</span>
                    </label>
                    <span className="hidden sm:inline text-[11px] text-slate-400">
                      Testo personalizzabile al 100%
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="es. Sopralluogo Cantiere Olbia, Riunione RSPP, Ferie, Corso Antincendio..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all shadow-2xs"
                  />
                  <p className="hidden sm:block text-[11px] text-slate-400 mt-1">
                    Puoi scrivere qualsiasi impegno o attività aziendale senza restrizioni.
                  </p>
                </div>

                {/* COLLEGAMENTO A RICHIESTA DAL SITO (FACOLTATIVO) */}
                {inquiries && inquiries.length > 0 && (
                  <div className="p-3 bg-purple-50/50 border border-purple-200/70 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Inbox className="w-3.5 h-3.5 text-purple-600" />
                        <span>Collega a Richiesta dal Sito (Opzionale)</span>
                      </label>
                      {formData.inquiryId && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              inquiryId: "",
                              clientName: "",
                              clientCompany: "",
                              clientPhone: "",
                              clientEmail: "",
                            });
                          }}
                          className="min-h-9 px-1 text-[11px] text-rose-600 hover:text-rose-800 hover:underline font-bold"
                        >
                          Scollega richiesta
                        </button>
                      )}
                    </div>

                    {formData.inquiryId ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-purple-200 text-xs shadow-2xs">
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 truncate">
                            {formData.clientName}{" "}
                            {formData.clientCompany && (
                              <span className="font-medium text-slate-500">({formData.clientCompany})</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                            {formData.clientPhone && <span>📞 {formData.clientPhone}</span>}
                            {formData.clientEmail && <span>✉️ {formData.clientEmail}</span>}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 shrink-0 ml-2 border border-purple-200">
                          Collegata
                        </span>
                      </div>
                    ) : (
                      <select
                        value={formData.inquiryId}
                        onChange={(e) => {
                          const selectedInq = inquiries.find((i) => i.id === e.target.value);
                          if (selectedInq) {
                            const courseOrService =
                              selectedInq.courseTitle || selectedInq.service_type || "Consulenza e Formazione";
                            const clientInfo = selectedInq.company
                              ? `${selectedInq.name} (${selectedInq.company})`
                              : selectedInq.name;
                            setFormData({
                              ...formData,
                              inquiryId: selectedInq.id,
                              clientName: selectedInq.name,
                              clientCompany: selectedInq.company || "",
                              clientPhone: selectedInq.phone || "",
                              clientEmail: selectedInq.email || "",
                              title: !formData.title.trim()
                                ? `${courseOrService} - ${clientInfo}`
                                : formData.title,
                              description: !formData.description.trim() && selectedInq.message
                                ? `Messaggio cliente: "${selectedInq.message}"`
                                : formData.description,
                              type: selectedInq.type === "corso" ? "corso" : formData.type,
                              courseId: selectedInq.courseId || formData.courseId,
                              maxParticipants: formData.maxParticipants,
                              location: selectedInq.address
                                ? `${selectedInq.address} ${selectedInq.city || ""}`.trim()
                                : formData.location,
                            });
                          } else {
                            setFormData({
                              ...formData,
                              inquiryId: "",
                              clientName: "",
                              clientCompany: "",
                              clientPhone: "",
                              clientEmail: "",
                            });
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-purple-200/90 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                      >
                        <option value="">-- Nessuna richiesta collegata (inserimento autonomo) --</option>
                        {inquiries.map((inq) => {
                          const statusTag =
                            inq.status === "nuovo"
                              ? "🔴 NUOVA"
                              : inq.status === "preventivo_inviato"
                              ? "🟡 PREVENTIVO"
                              : inq.status === "confermato"
                              ? "🟢 CONFERMATA"
                              : "📁 ARCHIVIO";
                          return (
                            <option key={inq.id} value={inq.id}>
                              {statusTag} | {inq.name} {inq.company ? `(${inq.company})` : ""} -{" "}
                              {inq.courseTitle || inq.service_type || "Richiesta generale"}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>
                )}

                {/* 2. TIPOLOGIA & STATO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipologia Impegno *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as AgendaEventType })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    >
                      <option value="corso">🎓 Corso di Formazione (D.Lgs. 81/08)</option>
                      <option value="sopralluogo">🔍 Sopralluogo Cantiere / Perizia</option>
                      <option value="scadenza">🚨 Scadenza Normativa / Prescrizione</option>
                      <option value="consulenza">💼 Riunione Periodica / RSPP</option>
                      <option value="appuntamento">📞 Incontro / Check-Up Cliente</option>
                      <option value="altro">✍️ Altro / Personalizzato (Campo libero)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Stato *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AgendaEventStatus })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    >
                      <option value="confermato">Confermato</option>
                      <option value="programmato">Programmato (in attesa)</option>
                      <option value="completato">Completato</option>
                      <option value="annullato">Annullato</option>
                    </select>
                  </div>
                </div>

                {/* Se tipologia === altro: campo libero per la tipologia personalizzata */}
                {formData.type === "altro" && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-slate-700">
                      Specifica Tipologia Personalizzata (Campo libero)
                    </label>
                    <input
                      type="text"
                      value={formData.customType}
                      onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                      placeholder="es. Ferie Estive, Manutenzione Mezzi, Audit ISO 45001, Chiusura Studio..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    />
                  </div>
                )}

                {/* Se tipo === corso: collegamento facoltativo rapido al catalogo corsi */}
                {formData.type === "corso" && courses.length > 0 && (
                  <div className="p-3 bg-[#e6f6f7]/40 border border-[#008e97]/20 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#008e97]">
                        Compila da Catalogo Corsi (Opzionale)
                      </label>
                      {formData.courseId && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, courseId: "" })}
                          className="min-h-9 px-1 text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          Scollega corso
                        </button>
                      )}
                    </div>
                    <select
                      value={formData.courseId}
                      onChange={(e) => {
                        const selectedCourse = courses.find((c) => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          courseId: e.target.value,
                          title: selectedCourse && !formData.title.trim() ? selectedCourse.title : formData.title,
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    >
                      <option value="">-- Nessun corso collegato (titolo libero) --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.duration_hours}h)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date e Orari */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ora Inizio
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ora Fine
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    />
                  </div>
                </div>

                {/* Sede e Docente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Sede / Aula
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="es. Aula Didattica Porto Torres, In Cantiere..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Docente / Perito Incaricato
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="es. Ing. Marco Sanna, Geom. Piras..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                    />
                  </div>
                </div>

                {/* Note Operative */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Note & Dettagli Logistici
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Materiale occorrente, contatti cantiere, DPI richiesti..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                  />
                </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        title="Eliminare questo impegno?"
        confirmLabel="Elimina definitivamente"
        onConfirm={() => deleteConfirmId && handleDeleteEvent(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      >
        L&apos;impegno verrà rimosso dall&apos;agenda. Questa operazione non può essere annullata.
      </ConfirmDialog>
    </div>
  );
}
