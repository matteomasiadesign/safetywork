import React, { useState, useMemo } from "react";
import Link from "@/components/ui/Link";
import { Inquiry } from "@/lib/types/database";
import {
  Inbox,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Clock,
  Calendar,
  CalendarPlus,
  Building,
  User,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  Archive,
  Trash2,
  ExternalLink,
  Edit3,
  Check,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface InquiriesManagerProps {
  inquiries: Inquiry[];
  onUpdateStatus: (id: string, status: Inquiry["status"], notes?: string) => void;
  onDeleteInquiry: (id: string) => void;
  onScheduleInquiry?: (inquiry: Inquiry) => void;
}

export default function InquiriesManager({
  inquiries,
  onUpdateStatus,
  onDeleteInquiry,
  onScheduleInquiry,
}: InquiriesManagerProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Inquiry["status"]>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "corso" | "contatto">("all");

  // Expanded items state for progressive disclosure
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Inline note editor state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Statistics
  const stats = useMemo(() => {
    const total = inquiries.length;
    const nuove = inquiries.filter((i) => i.status === "nuovo").length;
    const preventivi = inquiries.filter(
      (i) => i.status === "preventivo_inviato" || i.status === "contattato"
    ).length;
    const confermate = inquiries.filter((i) => i.status === "confermato").length;
    const nonInteressate = inquiries.filter((i) => i.status === "non_interessato").length;
    const archiviate = inquiries.filter((i) => i.status === "archiviato").length;
    const corsi = inquiries.filter((i) => i.type === "corso").length;
    return { total, nuove, preventivi, confermate, nonInteressate, archiviate, corsi };
  }, [inquiries]);

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Status filter with backward compatibility
      if (statusFilter !== "all") {
        if (statusFilter === "preventivo_inviato") {
          if (inq.status !== "preventivo_inviato" && inq.status !== "contattato") return false;
        } else if (inq.status !== statusFilter) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== "all" && inq.type !== typeFilter) return false;

      // Text search
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = inq.name.toLowerCase().includes(query);
        const matchEmail = inq.email.toLowerCase().includes(query);
        const matchPhone = inq.phone ? inq.phone.toLowerCase().includes(query) : false;
        const matchCompany = inq.company ? inq.company.toLowerCase().includes(query) : false;
        const matchCourse = inq.courseTitle ? inq.courseTitle.toLowerCase().includes(query) : false;
        const matchMsg = inq.message ? inq.message.toLowerCase().includes(query) : false;
        const matchCf = inq.fiscalCode ? inq.fiscalCode.toLowerCase().includes(query) : false;
        const matchVat = inq.vatNumber ? inq.vatNumber.toLowerCase().includes(query) : false;
        const matchCity = inq.city ? inq.city.toLowerCase().includes(query) : false;
        const matchPec = inq.pec ? inq.pec.toLowerCase().includes(query) : false;
        return matchName || matchEmail || matchPhone || matchCompany || matchCourse || matchMsg || matchCf || matchVat || matchCity || matchPec;
      }

      return true;
    });
  }, [inquiries, statusFilter, typeFilter, searchQuery]);

  const handleStartEditingNote = (inq: Inquiry) => {
    setEditingNoteId(inq.id);
    setNoteDraft(inq.notes || "");
  };

  const handleSaveNote = (id: string, currentStatus: Inquiry["status"]) => {
    onUpdateStatus(id, currentStatus, noteDraft);
    setEditingNoteId(null);
  };

  const handleCancelNote = () => {
    setEditingNoteId(null);
    setNoteDraft("");
  };

  // Helper to format clean international phone for WhatsApp and tel:
  const formatCleanPhone = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/[^0-9+]/g, "");
  };

  // Helper to build prefilled WhatsApp message
  const getWhatsAppLink = (inquiry: Inquiry) => {
    const rawPhone = formatCleanPhone(inquiry.phone);
    if (!rawPhone) return null;
    // Add default Italian country code if missing
    const fullPhone = rawPhone.startsWith("+")
      ? rawPhone.replace("+", "")
      : rawPhone.startsWith("00")
      ? rawPhone.substring(2)
      : rawPhone.startsWith("3")
      ? `39${rawPhone}`
      : rawPhone;

    const courseOrService = inquiry.courseTitle || inquiry.service_type || "la sicurezza sul lavoro";
    const text = `Gentile ${inquiry.name}, la contatto dal centro di formazione Safety Work S.r.l.s. in merito alla Sua richiesta per "${courseOrService}". Siamo a Sua disposizione per concordare le date e la partecipazione.`;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  };

  // Helper to build prefilled Mailto link
  const getMailtoLink = (inquiry: Inquiry) => {
    const subject = inquiry.courseTitle
      ? `Safety Work - Riscontro prenotazione per "${inquiry.courseTitle}"`
      : `Safety Work - Riscontro richiesta di contatto`;
    
    const body = `Gentile ${inquiry.name},\n\n` +
      `La ringraziamo per averci contattato tramite il portale Safety Work S.r.l.s.\n\n` +
      (inquiry.courseTitle ? `In merito alla Sua richiesta per il corso "${inquiry.courseTitle}" (${inquiry.participantsCount || 1} partecipanti):\n` : "") +
      `Restiamo a completa disposizione per definire le date del corso, i dettagli logistici e le modalità di iscrizione.\n\n` +
      `Cordiali saluti,\n` +
      `Ufficio Formazione & Consulenza HSE\n` +
      `Safety Work S.r.l.s.\n` +
      `Tel: 079 501234 | info@safetyworks.it`;

    return `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300 select-none">
      {/* 1. BARRA STRUMENTI & FILTRI COMPATTA */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Sinistra: Filtri per stato con conteggi live */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
            }`}
          >
            <span>Tutte</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-600"
              }`}
            >
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("nuovo")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "nuovo"
                ? "bg-[#df0000] text-white shadow-xs"
                : "bg-rose-50 hover:bg-rose-100/80 text-[#df0000] border border-rose-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#df0000] shrink-0" />
            <span>Nuove</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "nuovo" ? "bg-white/20 text-white" : "bg-rose-200/60 text-[#df0000]"
              }`}
            >
              {stats.nuove}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("preventivo_inviato")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "preventivo_inviato"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Preventivo Inviato</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "preventivo_inviato" ? "bg-white/20 text-white" : "bg-amber-200/60 text-amber-800"
              }`}
            >
              {stats.preventivi}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("confermato")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "confermato"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Confermate</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "confermato" ? "bg-white/20 text-white" : "bg-emerald-200/60 text-emerald-800"
              }`}
            >
              {stats.confermate}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("non_interessato")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "non_interessato"
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60"
            }`}
          >
            <span>Non Interessate</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "non_interessato" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-500"
              }`}
            >
              {stats.nonInteressate}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("archiviato")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              statusFilter === "archiviato"
                ? "bg-slate-700 text-white shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60"
            }`}
          >
            <span>Archiviate</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                statusFilter === "archiviato" ? "bg-white/20 text-white" : "bg-slate-200/70 text-slate-500"
              }`}
            >
              {stats.archiviate}
            </span>
          </button>

          {(searchQuery || typeFilter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
              className="text-[11px] text-[#df0000] hover:underline font-bold px-1.5 py-1 shrink-0"
            >
              Azzera
            </button>
          )}
        </div>

        {/* Destra: Campo Ricerca + Filtro Tipologia */}
        <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca cliente, corso, CF..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97] cursor-pointer"
          >
            <option value="all">Tutti i tipi</option>
            <option value="corso">🎓 Corsi</option>
            <option value="contatto">💬 Contatti</option>
          </select>
        </div>
      </div>

      {/* 2. LISTA RICHIESTE AD ALTA DENSITÀ (STILE INBOX LINEAR / STRIPE) */}
      <div className="space-y-2.5">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Nessuna richiesta trovata</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Non ci sono richieste o prenotazioni corrispondenti ai filtri attivi.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {filteredInquiries.map((inq) => {
              const isCourse = inq.type === "corso";
              const whatsappLink = getWhatsAppLink(inq);
              const mailtoLink = getMailtoLink(inq);
              const isExpanded = Boolean(expandedIds[inq.id]);
              const hasFiscalData = Boolean(
                inq.fiscalCode || inq.vatNumber || inq.address || inq.birthDate || inq.atecoCode || inq.sdiCode
              );

              return (
                <div
                  key={inq.id}
                  className={`transition-colors ${
                    inq.status === "nuovo"
                      ? "bg-rose-50/25 hover:bg-rose-50/40"
                      : inq.status === "preventivo_inviato" || inq.status === "contattato"
                      ? "bg-amber-50/20 hover:bg-amber-50/35"
                      : inq.status === "confermato"
                      ? "bg-emerald-50/15 hover:bg-emerald-50/30"
                      : inq.status === "non_interessato"
                      ? "opacity-65 bg-slate-50/40 hover:opacity-90"
                      : "hover:bg-slate-50/70"
                  }`}
                >
                  {/* Riga Compatta Principale */}
                  <div className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Info Cliente & Tipologia */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Dropdown Stato Compatto */}
                      <select
                        value={inq.status === "contattato" ? "preventivo_inviato" : inq.status}
                        onChange={(e) => onUpdateStatus(inq.id, e.target.value as Inquiry["status"])}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer shrink-0 ${
                          inq.status === "nuovo"
                            ? "bg-[#fdf2f2] text-[#df0000] border-[#df0000]/40"
                            : inq.status === "preventivo_inviato" || inq.status === "contattato"
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : inq.status === "confermato"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : inq.status === "non_interessato"
                            ? "bg-slate-100 text-slate-500 border-slate-300 line-through"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        <option value="nuovo">🔴 Nuovo</option>
                        <option value="preventivo_inviato">🟡 Preventivo Inviato</option>
                        <option value="confermato">🟢 Confermato</option>
                        <option value="non_interessato">⚪ Non Interessato</option>
                        <option value="archiviato">📁 Archiviato</option>
                      </select>

                      {/* Nome, Azienda & Corso */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 truncate">
                            {inq.name}
                          </span>
                          {inq.company && (
                            <span className="text-xs text-slate-500 flex items-center gap-1 truncate font-medium">
                              <Building className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{inq.company}</span>
                            </span>
                          )}
                          {inq.clientType && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              {inq.clientType === "azienda" ? "Azienda" : "Privato"}
                            </span>
                          )}
                        </div>

                        {/* Riferimento al Corso o Servizio */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {isCourse ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#008e97] truncate">
                              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{inq.courseTitle}</span>
                              {inq.participantsCount && (
                                <span className="text-slate-400 font-normal">
                                  ({inq.participantsCount} pax)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#f58220] font-medium truncate">
                              <MessageSquare className="w-3 h-3 shrink-0" />
                              <span className="truncate">{inq.service_type || "Richiesta Consulenza"}</span>
                            </span>
                          )}
                          <span className="text-slate-300 hidden sm:inline">•</span>
                          <span
                            className="text-[11px] text-slate-400 font-mono hidden sm:inline"
                            suppressHydrationWarning
                          >
                            {formatDate(inq.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Azioni Rapide a Micro-Icone (WhatsApp, Chiama, Mail, Elimina, Dettagli) */}
                    <div className="flex items-center justify-end gap-1.5 shrink-0">
                      {/* WhatsApp 1-Click */}
                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#25D366] border border-emerald-200/80 transition-all shadow-2xs hover:scale-105"
                          title="Scrivi su WhatsApp con messaggio precompilato"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {/* Chiama Subito */}
                      {inq.phone ? (
                        <a
                          href={`tel:${formatCleanPhone(inq.phone)}`}
                          className="p-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-[#008e97] border border-cyan-200/80 transition-all shadow-2xs hover:scale-105"
                          title={`Chiama ${inq.phone}`}
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      ) : null}

                      {/* Invia Mail */}
                      <a
                        href={mailtoLink}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all shadow-2xs hover:scale-105"
                        title={`Invia email a ${inq.email}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>

                      {/* Pianifica in Agenda 1-Click */}
                      {onScheduleInquiry && (
                        <button
                          type="button"
                          onClick={() => onScheduleInquiry(inq)}
                          className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 transition-all shadow-2xs hover:scale-105"
                          title="Pianifica evento in Agenda collegato a questa richiesta"
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </button>
                      )}

                      {/* Elimina */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(inq.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-[#df0000] hover:bg-rose-50 transition-colors"
                        title="Elimina richiesta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Tasto Espandi / Dettagli */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(inq.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all ml-1"
                        title="Visualizza o nascondi dettagli"
                      >
                        <span className="text-[11px] hidden sm:inline">
                          {isExpanded ? "Meno" : "Dettagli"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CASSETTO DETTAGLI ESPANDIBILE (PROGRESSIVE DISCLOSURE) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-in fade-in duration-150">
                      {/* Recapiti Diretti */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pb-2 border-b border-slate-200/60">
                        {inq.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5 text-[#008e97]" />
                            <strong>{inq.phone}</strong>
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono">
                          <Mail className="w-3.5 h-3.5 text-[#008e97]" />
                          {inq.email}
                        </span>
                        {inq.pec && (
                          <span className="flex items-center gap-1 font-mono text-blue-700">
                            <strong>PEC:</strong> {inq.pec}
                          </span>
                        )}
                        {inq.courseSlug && (
                          <Link
                            to={`/corsi/${inq.courseSlug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008e97] hover:underline"
                          >
                            <span>Scheda Corso Online</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        {onScheduleInquiry && (
                          <button
                            type="button"
                            onClick={() => onScheduleInquiry(inq)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100/70 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-all ml-auto"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            <span>Pianifica in Agenda</span>
                          </button>
                        )}
                      </div>

                      {/* Messaggio del cliente se presente */}
                      {inq.message && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Messaggio allegato:
                          </div>
                          <p className="italic leading-relaxed whitespace-pre-wrap">
                            "{inq.message}"
                          </p>
                        </div>
                      )}

                      {/* Dati Fiscali e Anagrafici (Solo se inseriti dal cliente) */}
                      {hasFiscalData && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                            Anagrafica & Dati per Fatturazione Elettronica
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            {inq.fiscalCode && (
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase">Codice Fiscale</span>
                                <span className="font-mono font-bold text-slate-900 select-all">{inq.fiscalCode}</span>
                              </div>
                            )}
                            {inq.vatNumber && (
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase">Partita IVA</span>
                                <span className="font-mono font-bold text-slate-900 select-all">{inq.vatNumber}</span>
                              </div>
                            )}
                            {inq.sdiCode && (
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase">Codice SDI</span>
                                <span className="font-mono font-bold text-slate-900 select-all">{inq.sdiCode}</span>
                              </div>
                            )}
                            {inq.atecoCode && (
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase">Codice ATECO</span>
                                <span className="font-mono text-slate-800">{inq.atecoCode}</span>
                              </div>
                            )}
                            {inq.address && (
                              <div className="col-span-2">
                                <span className="text-slate-400 block text-[9px] uppercase">Indirizzo / Sede</span>
                                <span className="text-slate-800">{inq.address} {inq.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Note Interne Operative */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Appunti Interni
                          </span>
                          {editingNoteId !== inq.id && (
                            <button
                              type="button"
                              onClick={() => handleStartEditingNote(inq)}
                              className="text-[11px] text-[#008e97] hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{inq.notes ? "Modifica Note" : "+ Aggiungi Note"}</span>
                            </button>
                          )}
                        </div>

                        {editingNoteId === inq.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="es. Chiamato il 18/09: interessato ad aula Porto Torres per 3 persone..."
                              rows={2}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={handleCancelNote}
                                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                              >
                                Annulla
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveNote(inq.id, inq.status)}
                                className="px-3 py-1 bg-[#008e97] text-white text-xs font-bold rounded-lg hover:bg-[#00777f]"
                              >
                                Salva Nota
                              </button>
                            </div>
                          </div>
                        ) : inq.notes ? (
                          <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-slate-700 italic">
                            {inq.notes}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf2f2] text-[#df0000] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Elimina Richiesta
            </h4>
            <p className="text-xs text-slate-600 text-center mb-6">
              Sei sicuro di voler eliminare questa richiesta dal registro? L'operazione non è reversibile.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onDeleteInquiry(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider shadow-xs"
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

