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
import { getInitialAgendaEvents } from "@/lib/data/initialAgenda";
import BrandStripe from "@/components/ui/BrandStripe";

const AGENDA_STORAGE_KEY = "safety_works_agenda_events_v1";

type ViewMode = "month" | "week" | "day" | "year" | "list";

interface AgendaManagerProps {
  courses?: Course[];
  inquiries?: Inquiry[];
  preselectedInquiry?: Inquiry | null;
  onClearPreselectedInquiry?: () => void;
  onNavigateToInquiries?: () => void;
  showToast?: (msg: string) => void;
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
  courses = [],
  inquiries = [],
  preselectedInquiry,
  onClearPreselectedInquiry,
  onNavigateToInquiries,
  showToast,
}: AgendaManagerProps) {
  // 1. STATO EVENTI & PERSISTENZA
  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(AGENDA_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Errore lettura eventi agenda da localStorage:", e);
      }
    }
    return getInitialAgendaEvents();
  });

  useEffect(() => {
    try {
      localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.error("Errore salvataggio eventi agenda:", e);
    }
  }, [events]);

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
    maxParticipants: 15,
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

  // Reset a oggi
  const handleGoToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
  };

  // Navigazione Prev / Next in base alla vista
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === "year") {
      d.setFullYear(d.getFullYear() - 1);
    } else if (viewMode === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() - 7);
    } else if (viewMode === "day") {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === "year") {
      d.setFullYear(d.getFullYear() + 1);
    } else if (viewMode === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() + 7);
    } else if (viewMode === "day") {
      d.setDate(d.getDate() + 1);
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
      maxParticipants: 15,
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
      courseId: inq.courseSlug || "",
      maxParticipants: Number(inq.participantsCount) || 15,
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
      maxParticipants: evt.maxParticipants || 15,
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

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) {
      alert("Inserisci almeno il titolo e la data di inizio dell'impegno.");
      return;
    }

    const payloadCustomType =
      formData.type === "altro" && formData.customType.trim() ? formData.customType.trim() : undefined;
    const payloadInquiryId = formData.inquiryId?.trim() || undefined;
    const payloadClientName = payloadInquiryId ? formData.clientName.trim() || undefined : undefined;
    const payloadClientCompany = payloadInquiryId ? formData.clientCompany.trim() || undefined : undefined;
    const payloadClientPhone = payloadInquiryId ? formData.clientPhone.trim() || undefined : undefined;
    const payloadClientEmail = payloadInquiryId ? formData.clientEmail.trim() || undefined : undefined;

    if (editingEventId) {
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === editingEventId
            ? {
                ...evt,
                ...formData,
                customType: payloadCustomType,
                inquiryId: payloadInquiryId,
                clientName: payloadClientName,
                clientCompany: payloadClientCompany,
                clientPhone: payloadClientPhone,
                clientEmail: payloadClientEmail,
                maxParticipants: Number(formData.maxParticipants) || 15,
              }
            : evt
        )
      );
      showToast?.("Impegno aggiornato con successo!");
    } else {
      const newEvt: AgendaEvent = {
        id: `evt-${Date.now()}`,
        ...formData,
        customType: payloadCustomType,
        inquiryId: payloadInquiryId,
        clientName: payloadClientName,
        clientCompany: payloadClientCompany,
        clientPhone: payloadClientPhone,
        clientEmail: payloadClientEmail,
        maxParticipants: Number(formData.maxParticipants) || 15,
        created_at: new Date().toISOString(),
      };
      setEvents((prev) => [newEvt, ...prev]);
      showToast?.("Nuovo impegno inserito in agenda!");
    }

    setIsModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    setDeleteConfirmId(null);
    setSelectedEventForDetail(null);
    showToast?.("Impegno rimosso dall'agenda.");
  };

  // Export iCal (.ics)
  const handleExportIcs = () => {
    if (events.length === 0) {
      alert("Nessun evento da esportare.");
      return;
    }

    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Safety Work S.r.l.s.//Agenda Operativa//IT\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n";

    events.forEach((evt) => {
      const dateNoDash = evt.startDate.replace(/-/g, "");
      const timeStartNoColon = (evt.startTime || "09:00").replace(/:/g, "") + "00";
      const timeEndNoColon = (evt.endTime || "13:00").replace(/:/g, "") + "00";

      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `UID:${evt.id}@safetyworks.it\r\n`;
      icsContent += `DTSTAMP:${dateNoDash}T000000Z\r\n`;
      icsContent += `DTSTART:${dateNoDash}T${timeStartNoColon}\r\n`;
      icsContent += `DTEND:${dateNoDash}T${timeEndNoColon}\r\n`;
      icsContent += `SUMMARY:${evt.title.replace(/\n/g, " ")}\r\n`;
      if (evt.location) icsContent += `LOCATION:${evt.location.replace(/\n/g, " ")}\r\n`;
      if (evt.description || evt.notes) {
        const desc = `${evt.description || ""} ${evt.notes ? "Note: " + evt.notes : ""}`.trim();
        icsContent += `DESCRIPTION:${desc.replace(/\n/g, " ")}\r\n`;
      }
      icsContent += `STATUS:${evt.status === "confermato" ? "CONFIRMED" : "TENTATIVE"}\r\n`;
      icsContent += "END:VEVENT\r\n";
    });

    icsContent += "END:VCALENDAR\r\n";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `agenda-safety-works-${currentYear}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.("File calendario .ICS esportato con successo!");
  };

  // Reset a dati iniziali
  const handleResetToInitial = () => {
    if (confirm("Vuoi davvero ripristinare gli eventi dell'agenda con il set predefinito? I tuoi eventi attuali verranno sostituiti.")) {
      const init = getInitialAgendaEvents();
      setEvents(init);
      localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(init));
      showToast?.("Agenda ripristinata con gli eventi dimostrativi.");
    }
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

  return (
    <div className="space-y-4 select-none animate-in fade-in duration-300">
      {/* =========================================================================
          TOOLBAR UNIFICATA RESPONSIVA (Mobile-First & Anti-Sovraffollamento)
          ========================================================================= */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
        {/* RIGA 1: Navigatore Temporale Rapido + Azioni Nuovo & Export */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Sinistra: Controlli Temporali Prev/Oggi/Next + Mese/Anno */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 sm:p-2 hover:bg-white active:bg-slate-200 text-slate-700 rounded-lg transition-all"
                title="Periodo precedente"
                aria-label="Periodo precedente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleGoToday}
                className="px-2 sm:px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-white active:bg-slate-200 rounded-lg transition-all"
              >
                Oggi
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 sm:p-2 hover:bg-white active:bg-slate-200 text-slate-700 rounded-lg transition-all"
                title="Periodo successivo"
                aria-label="Periodo successivo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <select
                value={currentMonth}
                onChange={(e) => {
                  const d = new Date(currentDate);
                  d.setMonth(Number(e.target.value));
                  setCurrentDate(d);
                }}
                className="px-2 sm:px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] cursor-pointer"
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
                className="px-2 sm:px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] cursor-pointer"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#e6f6f7] text-[#008e97] px-2 py-0.5 rounded-full border border-[#008e97]/20 hidden md:inline">
              {filteredEvents.length} impegni
            </span>
          </div>

          {/* Destra: Esporta .ICS + Nuovo Impegno */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleExportIcs}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-2xs"
              title="Esporta calendario .ICS"
              aria-label="Esporta calendario .ICS"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-[#008e97] hover:bg-[#00777f] active:bg-[#006e75] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo</span>
            </button>
          </div>
        </div>

        {/* RIGA 2: Selettore Viste a Scorrimento + Ricerca & Filtro */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          {/* Selettore Viste compatto orizzontale */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar shrink-0">
            {(
              [
                { id: "month", label: "Mese" },
                { id: "week", label: "Settimana" },
                { id: "day", label: "Giorno" },
                { id: "year", label: "Anno" },
                { id: "list", label: "Elenco" },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewMode(v.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  viewMode === v.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Ricerca e Filtro Tipologia con larghezza flessibile */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca impegno, cliente, sede..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97] shrink-0"
            >
              <option value="all">Tutti i tipi</option>
              <option value="corso">🎓 Corsi</option>
              <option value="sopralluogo">🔍 Sopralluoghi</option>
              <option value="scadenza">🚨 Scadenze</option>
              <option value="consulenza">💼 Consulenze</option>
              <option value="appuntamento">📞 Incontri</option>
              <option value="altro">✍️ Altro</option>
            </select>
          </div>
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
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
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
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#008e97] text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-[#00777f] active:bg-[#006e75]"
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
                  className="mt-2 text-[#008e97] font-bold hover:underline inline-flex items-center gap-1"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
      )}

      {/* -------------------- VISTA GIORNO -------------------- */}
      {viewMode === "day" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#008e97]">
                Dettaglio Giornaliero
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {currentDate.getDate()} {MONTH_NAMES_IT[currentMonth]} {currentYear}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => openAddModal(selectedDate)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#008e97] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#00777f]"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi per Oggi</span>
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
                    className={`p-5 rounded-2xl border ${cfg.border} bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
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
                        className="p-2 text-slate-600 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-xl border border-slate-200 transition-colors"
                        title="Modifica"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(evt.id)}
                        className="p-2 text-slate-600 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-xl border border-slate-200 transition-colors"
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#008e97]">
                Panoramica Annuale
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Anno {currentYear}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Clicca su un mese per accedere direttamente alla vista mensile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  className="p-4 rounded-2xl border border-slate-200 hover:border-[#008e97] bg-slate-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
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
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              Tutti gli impegni in ordine cronologico ({filteredEvents.length})
            </h4>
            <span className="text-xs text-slate-500">
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
                          <div className="flex items-center gap-2 mb-1">
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
                          className="p-2 text-slate-600 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-xl border border-slate-200 transition-colors"
                          title="Modifica"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(evt.id)}
                          className="p-2 text-slate-600 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-xl border border-slate-200 transition-colors"
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
          5. MODALE: PANORAMICA COMPLETA DEGLI IMPEGNI DEL GIORNO SELEZIONATO
          ========================================================================= */}
      {dayModalDate && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDayModalDate(null);
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[calc(100vh-1.5rem)] sm:max-h-[90vh]">
            <BrandStripe height="h-2 shrink-0" />

            {/* Header Modale Giorno */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#e6f6f7] text-[#008e97] flex items-center justify-center shrink-0 border border-[#008e97]/20 shadow-2xs">
                  <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900 capitalize">
                    {formatItalianDate(dayModalDate)}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-[#008e97]/10 text-[#008e97]">
                      {dayModalEvents.length}{" "}
                      {dayModalEvents.length === 1 ? "impegno programmato" : "impegni programmati"}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-mono">
                      {dayModalDate}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDayModalDate(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Elenco Impegni della giornata */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 min-h-0 overscroll-contain">
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
                          <div className="flex items-center gap-3 text-xs shrink-0">
                            {evt.clientPhone && (
                              <a href={`tel:${evt.clientPhone}`} className="text-[#008e97] font-mono hover:underline">
                                📞 {evt.clientPhone}
                              </a>
                            )}
                            {evt.clientEmail && (
                              <a href={`mailto:${evt.clientEmail}`} className="text-slate-600 font-mono hover:underline">
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
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center gap-1"
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
                          className="px-3.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-[#e6f6f7] text-slate-700 hover:text-[#008e97] rounded-xl transition-colors inline-flex items-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Modifica</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modale Giorno */}
            <div className="p-3.5 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const d = dayModalDate;
                  setDayModalDate(null);
                  openAddModal(d);
                }}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo impegno per questa data</span>
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
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#008e97] hover:bg-white rounded-xl transition-colors border border-transparent hover:border-slate-200"
                >
                  Vista Giorno Intera →
                </button>
                <button
                  type="button"
                  onClick={() => setDayModalDate(null)}
                  className="px-3.5 sm:px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODALE: DETTAGLIO SINGOLO EVENTO (SE APERTO DIRETTAMENTE)
          ========================================================================= */}
      {selectedEventForDetail && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEventForDetail(null);
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            <BrandStripe height="h-1.5 shrink-0" />
            
            {/* Header fisso */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                {(() => {
                  const cfg = getEventTypeConfig(selectedEventForDetail.type, selectedEventForDetail.customType);
                  return (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  );
                })()}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    STATUS_CONFIG[selectedEventForDetail.status].badge
                  }`}
                >
                  {STATUS_CONFIG[selectedEventForDetail.status].label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventForDetail(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg shrink-0 transition-colors"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenuto scrollabile */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4 overscroll-contain">
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
                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
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
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 hover:underline font-mono"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{selectedEventForDetail.clientEmail}</span>
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
            </div>

            {/* Footer fisso */}
            <div className="p-3.5 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedEventForDetail.id)}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Elimina Impegno
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEventForDetail(null)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
                >
                  Chiudi
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedEventForDetail)}
                  className="px-4 py-1.5 text-xs font-bold bg-[#008e97] text-white rounded-xl hover:bg-[#00777f] transition-all shadow-xs"
                >
                  Modifica
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODALE: CREA / MODIFICA EVENTO
          ========================================================================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[calc(100vh-1.5rem)] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
            <BrandStripe height="h-1.5 shrink-0" />

            {/* Header fisso (sempre visibile in alto) */}
            <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="pr-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {editingEventId ? "Modifica Impegno in Agenda" : "Nuovo Impegno in Agenda"}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Compila i dettagli operativi per pianificare sessioni, visite o scadenze.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form suddiviso con Corpo Scorrevole e Footer Fisso */}
            <form onSubmit={handleSaveEvent} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 flex-1 overscroll-contain">
                {/* 1. TITOLO DELL'IMPEGNO (CAMPO LIBERO PRINCIPALE) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Titolo dell'Impegno * <span className="font-medium text-slate-400">(Campo libero)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
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
                  <p className="text-[11px] text-slate-400 mt-1">
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
                          className="text-[11px] text-rose-600 hover:text-rose-800 hover:underline font-bold"
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
                              courseId: selectedInq.courseSlug || formData.courseId,
                              maxParticipants: selectedInq.participantsCount || formData.maxParticipants,
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
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          Scollega corso
                        </button>
                      )}
                    </div>
                    <select
                      value={formData.courseId}
                      onChange={(e) => {
                        const selectedCourse = courses.find((c) => c.slug === e.target.value || c.id === e.target.value);
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
                        <option key={c.id} value={c.slug}>
                          {c.title} ({c.duration_hours}h)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date e Orari */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
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
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Materiale occorrente, contatti cantiere, DPI richiesti..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                  />
                </div>
              </div>

              {/* Footer fisso (sempre visibile in fondo, mai tagliato) */}
              <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 sm:px-6 py-2 bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all"
                >
                  {editingEventId ? "Salva Modifiche" : "Inserisci in Agenda"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale Conferma Eliminazione */}
      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirmId(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-200 my-auto">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Eliminare questo impegno?</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              L'impegno verrà rimosso dall'agenda. Questa operazione non può essere annullata.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvent(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold bg-[#df0000] text-white rounded-xl hover:bg-[#b80000]"
              >
                Elimina Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

