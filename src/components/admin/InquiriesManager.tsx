"use client";

import React, { useState, useMemo } from "react";
import Link from "@/components/ui/Link";
import { Inquiry } from "@/lib/types/database";
import { COMPANY_CONFIG } from "@/config/company";
import AdminModal from "@/components/admin/ui/AdminModal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

import {
  Inbox,
  Search,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  CalendarPlus,
  Building,
  GraduationCap,
  Trash2,
  ExternalLink,
  Edit3,
  X,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";

const STATUS_NAMES: Record<string, string> = {
  nuovo: "Nuovo",
  preventivo_inviato: "Preventivo Inviato",
  contattato: "Preventivo Inviato",
  confermato: "Confermato",
  non_interessato: "Non Interessato",
  archiviato: "Archiviato",
};

interface InquiriesManagerProps {
  inquiries: Inquiry[];
  onUpdateStatus: (id: string, status: Inquiry["status"], notes?: string) => void;
  onDeleteInquiry: (id: string) => void;
  onScheduleInquiry?: (inquiry: Inquiry) => void;
}

type StatusFilter = "all" | Inquiry["status"];

/** Filtri per stato: colori da "acceso" (selezionato) e "spento". */
const STATUS_CHIPS: {
  id: StatusFilter;
  label: string;
  stat: "total" | "nuove" | "preventivi" | "confermate" | "nonInteressate" | "archiviate";
  on: string;
  off: string;
  countOff: string;
  dot?: string;
}[] = [
  { id: "all", label: "Tutte", stat: "total", on: "bg-slate-900 text-white", off: "bg-slate-50 text-slate-600 border-slate-200/60", countOff: "bg-slate-200/70 text-slate-600" },
  { id: "nuovo", label: "Nuove", stat: "nuove", on: "bg-[#df0000] text-white", off: "bg-rose-50 text-[#df0000] border-rose-200/60", countOff: "bg-rose-200/60 text-[#df0000]", dot: "bg-[#df0000]" },
  { id: "preventivo_inviato", label: "Preventivo", stat: "preventivi", on: "bg-amber-600 text-white", off: "bg-amber-50 text-amber-800 border-amber-200/60", countOff: "bg-amber-200/60 text-amber-800", dot: "bg-amber-500" },
  { id: "confermato", label: "Confermate", stat: "confermate", on: "bg-emerald-600 text-white", off: "bg-emerald-50 text-emerald-800 border-emerald-200/60", countOff: "bg-emerald-200/60 text-emerald-800", dot: "bg-emerald-500" },
  { id: "non_interessato", label: "Non interessate", stat: "nonInteressate", on: "bg-slate-700 text-white", off: "bg-slate-50 text-slate-500 border-slate-200/60", countOff: "bg-slate-200/70 text-slate-500" },
  { id: "archiviato", label: "Archiviate", stat: "archiviate", on: "bg-slate-700 text-white", off: "bg-slate-50 text-slate-500 border-slate-200/60", countOff: "bg-slate-200/70 text-slate-500" },
];

export default function InquiriesManager({
  inquiries,
  onUpdateStatus,
  onDeleteInquiry,
  onScheduleInquiry,
}: InquiriesManagerProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "corso" | "contatto">("all");

  // Expanded items state for progressive disclosure
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Inline note editor state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Conferma eliminazione e menu "altre azioni" (mobile)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  // Cambio di stato: si salva solo dopo la conferma esplicita
  const [pendingStatus, setPendingStatus] = useState<{ inquiry: Inquiry; status: Inquiry["status"] } | null>(null);
  const [menuFor, setMenuFor] = useState<Inquiry | null>(null);

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
    return { total, nuove, preventivi, confermate, nonInteressate, archiviate };
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

  const hasActiveFilters = Boolean(searchQuery) || typeFilter !== "all" || statusFilter !== "all";
  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
  };

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
    const text = `Gentile ${inquiry.name}, la contatto dal centro di formazione Safety Works S.r.l.s. in merito alla Sua richiesta per "${courseOrService}". Siamo a Sua disposizione per concordare le date e la partecipazione.`;
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  };

  // Helper to build prefilled Mailto link
  const getMailtoLink = (inquiry: Inquiry) => {
    const subject = inquiry.courseTitle
      ? `Safety Works - Riscontro prenotazione per "${inquiry.courseTitle}"`
      : `Safety Works - Riscontro richiesta di contatto`;

    const body = `Gentile ${inquiry.name},\n\n` +
      `La ringraziamo per averci contattato tramite il portale Safety Works S.r.l.s.\n\n` +
      (inquiry.courseTitle ? `In merito alla Sua richiesta per il corso "${inquiry.courseTitle}" (${inquiry.participantsCount || 1} partecipanti)${inquiry.editionLabel ? `, data indicata: ${inquiry.editionLabel}` : ""}:\n` : "") +
      `Restiamo a completa disposizione per definire le date del corso, i dettagli logistici e le modalità di iscrizione.\n\n` +
      `Cordiali saluti,\n` +
      `Ufficio Formazione & Consulenza HSE\n` +
      `Safety Works S.r.l.s.\n` +
      `Tel: ${COMPANY_CONFIG.contacts.phone} | ${COMPANY_CONFIG.contacts.email}`;

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
    <div className="space-y-4">
      {/* BARRA STRUMENTI: su mobile prima la ricerca, poi i filtri a scorrimento orizzontale */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 lg:order-2 lg:shrink-0">
          <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca cliente, corso..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] [&::-webkit-search-cancel-button]:hidden"
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

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | "corso" | "contatto")}
            aria-label="Tipo di richiesta"
            className="shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
          >
            <option value="all">Tutti i tipi</option>
            <option value="corso">Corsi</option>
            <option value="contatto">Contatti</option>
          </select>
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
                <span>{chip.label}</span>
                <span className={`rounded-md px-1.5 text-[10px] font-semibold leading-5 ${selected ? "bg-white/20 text-white" : chip.countOff}`}>
                  {stats[chip.stat]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-3 px-1 text-xs text-slate-500">
          <span>
            <strong className="font-bold text-slate-700">{filteredInquiries.length}</strong> di {inquiries.length} richieste
          </span>
          <button type="button" onClick={resetFilters} className="min-h-9 px-2 font-bold text-[#df0000] hover:underline">
            Azzera filtri
          </button>
        </div>
      )}

      {/* LISTA RICHIESTE */}
      {filteredInquiries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
          <Inbox className="mx-auto mb-2 h-10 w-10 text-slate-300" />
          <h4 className="text-sm font-bold text-slate-800">Nessuna richiesta trovata</h4>
          <p className="mt-0.5 text-xs text-slate-500">Non ci sono richieste o prenotazioni corrispondenti ai filtri attivi.</p>
        </div>
      ) : (
        <div className="space-y-3">
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
                className={`overflow-hidden rounded-2xl border bg-white shadow-xs transition-all hover:shadow-md ${
                  inq.status === "nuovo"
                    ? "border-rose-300 ring-1 ring-rose-200/70"
                    : inq.status === "preventivo_inviato" || inq.status === "contattato"
                    ? "border-amber-300 ring-1 ring-amber-200/50"
                    : inq.status === "confermato"
                    ? "border-emerald-300 ring-1 ring-emerald-200/50"
                    : inq.status === "non_interessato"
                    ? "border-slate-200 bg-slate-50/40 opacity-70"
                    : "border-slate-200"
                }`}
              >
                {/* 1. Stato (modificabile) + data */}
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-b border-slate-100 bg-slate-50/80 px-3.5 py-2.5 sm:px-4">
                  <div className="flex items-center gap-2">
                    <select
                      value={inq.status === "contattato" ? "preventivo_inviato" : inq.status}
                      onChange={(e) => setPendingStatus({ inquiry: inq, status: e.target.value as Inquiry["status"] })}
                      aria-label={`Stato della richiesta di ${inq.name}`}
                      className={`cursor-pointer rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider shadow-2xs transition-all focus:outline-none ${
                        inq.status === "nuovo"
                          ? "border-[#df0000]/40 bg-[#fdf2f2] text-[#df0000]"
                          : inq.status === "preventivo_inviato" || inq.status === "contattato"
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : inq.status === "confermato"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : inq.status === "non_interessato"
                          ? "border-slate-300 bg-slate-100 text-slate-500 line-through"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      <option value="nuovo">Nuovo</option>
                      <option value="preventivo_inviato">Preventivo Inviato</option>
                      <option value="confermato">Confermato</option>
                      <option value="non_interessato">Non Interessato</option>
                      <option value="archiviato">Archiviato</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    {inq.clientType && (
                      <span className="rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-2xs">
                        {inq.clientType === "azienda" ? "Azienda" : "Privato"}
                      </span>
                    )}
                    <span className="whitespace-nowrap font-mono text-[11px] text-slate-400" suppressHydrationWarning>
                      {formatDate(inq.created_at)}
                    </span>
                  </div>
                </div>

                {/* 2. Chi e cosa chiede */}
                <div className="space-y-2.5 p-3.5 sm:p-4">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-extrabold leading-snug tracking-tight text-slate-900">{inq.name}</h3>
                    {inq.company && (
                      <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Building className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{inq.company}</span>
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 text-slate-900 sm:p-3 ${
                      isCourse ? "border-[#008e97]/25 bg-[#e6f6f7]/60" : "border-amber-200/60 bg-amber-50/60"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-2xs ${
                          isCourse ? "bg-[#008e97]" : "bg-[#f58220]"
                        }`}
                      >
                        {isCourse ? <GraduationCap className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-xs font-bold leading-snug sm:text-sm">
                          {inq.courseTitle || inq.service_type || "Richiesta Consulenza"}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                          {inq.participantsCount && (
                            <span className="font-semibold text-slate-700">
                              {inq.participantsCount} {inq.participantsCount === 1 ? "partecipante" : "partecipanti"}
                            </span>
                          )}
                          {inq.editionLabel && <span className="font-semibold text-[#008e97]">• {inq.editionLabel}</span>}
                          {inq.preferredMode && <span>• {inq.preferredMode}</span>}
                          {inq.city && <span>• {inq.city}</span>}
                        </div>
                      </div>
                    </div>

                    {inq.courseSlug && (
                      <Link
                        to={`/corsi/${inq.courseSlug}`}
                        target="_blank"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#008e97] transition-colors hover:bg-white/80 hover:text-[#00777f]"
                        title="Vedi scheda corso"
                        aria-label="Vedi scheda corso"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>

                  {inq.message && !isExpanded && (
                    <div className="line-clamp-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs italic text-slate-600">
                      &ldquo;{inq.message}&rdquo;
                    </div>
                  )}
                </div>

                {/* 3. Azioni: contatto rapido in primo piano, il resto raccolto */}
                <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                  <div className="flex items-center gap-2">
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-emerald-600 active:scale-95 active:bg-emerald-700 sm:flex-none"
                        title="Apri chat WhatsApp con messaggio precompilato"
                      >
                        <MessageCircle className="h-4 w-4 shrink-0" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {inq.phone && (
                      <a
                        href={`tel:${formatCleanPhone(inq.phone)}`}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#008e97] px-3.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#00777f] active:scale-95 active:bg-[#006e75] sm:flex-none"
                        title={`Chiama ${inq.phone}`}
                      >
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>Chiama</span>
                      </a>
                    )}

                    <a
                      href={mailtoLink}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-100"
                      title={`Invia email a ${inq.email}`}
                      aria-label={`Invia email a ${inq.email}`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExpand(inq.id)}
                      aria-expanded={isExpanded}
                      className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 sm:min-h-10 sm:flex-none"
                    >
                      <span>{isExpanded ? "Meno dettagli" : "Dettagli"}</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {/* Mobile: altre azioni in un foglio */}
                    <button
                      type="button"
                      onClick={() => setMenuFor(inq)}
                      aria-label="Altre azioni"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 sm:hidden"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {/* Da tablet: azioni sempre visibili */}
                    <div className="hidden items-center gap-1.5 sm:flex">
                      {onScheduleInquiry && (
                        <button
                          type="button"
                          onClick={() => onScheduleInquiry(inq)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-200/80 bg-purple-50 text-purple-700 transition-colors hover:bg-purple-100"
                          title="Pianifica impegno in Agenda"
                          aria-label="Pianifica impegno in Agenda"
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(inq.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-[#df0000]"
                        title="Elimina richiesta"
                        aria-label="Elimina richiesta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dettagli espandibili */}
                {isExpanded && (
                  <div className="space-y-3 border-t border-slate-100 bg-slate-50/50 px-3.5 pb-4 pt-3 sm:px-4">
                    <div className="flex flex-col gap-2 border-b border-slate-200/60 pb-3 text-xs text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                      {inq.phone && (
                        <a href={`tel:${formatCleanPhone(inq.phone)}`} className="flex items-center gap-1.5 font-mono">
                          <Phone className="h-3.5 w-3.5 shrink-0 text-[#008e97]" />
                          <strong>{inq.phone}</strong>
                        </a>
                      )}
                      <a href={mailtoLink} className="flex min-w-0 items-center gap-1.5 font-mono">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-[#008e97]" />
                        <span className="break-all">{inq.email}</span>
                      </a>
                      {inq.pec && (
                        <span className="flex min-w-0 items-center gap-1.5 font-mono text-blue-700">
                          <strong>PEC:</strong> <span className="break-all">{inq.pec}</span>
                        </span>
                      )}
                      {inq.courseSlug && (
                        <Link
                          to={`/corsi/${inq.courseSlug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008e97] hover:underline"
                        >
                          <span>Scheda Corso Online</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>

                    {inq.editionLabel && (
                      <div className="rounded-xl border border-[#008e97]/30 bg-[#e6f6f7] p-3 text-xs text-slate-800">
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#008e97]">Data richiesta dal cliente:</div>
                        <p className="font-semibold">{inq.editionLabel}</p>
                      </div>
                    )}

                    {inq.message && (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Messaggio allegato:</div>
                        <p className="whitespace-pre-wrap break-words italic leading-relaxed">&ldquo;{inq.message}&rdquo;</p>
                      </div>
                    )}

                    {hasFiscalData && (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Anagrafica &amp; Dati per Fatturazione Elettronica
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-[11px] sm:grid-cols-4">
                          {inq.fiscalCode && (
                            <div className="min-w-0">
                              <span className="block text-[9px] uppercase text-slate-400">Codice Fiscale</span>
                              <span className="break-all font-mono font-bold text-slate-900 select-all">{inq.fiscalCode}</span>
                            </div>
                          )}
                          {inq.vatNumber && (
                            <div className="min-w-0">
                              <span className="block text-[9px] uppercase text-slate-400">Partita IVA</span>
                              <span className="break-all font-mono font-bold text-slate-900 select-all">{inq.vatNumber}</span>
                            </div>
                          )}
                          {inq.sdiCode && (
                            <div className="min-w-0">
                              <span className="block text-[9px] uppercase text-slate-400">Codice SDI</span>
                              <span className="break-all font-mono font-bold text-slate-900 select-all">{inq.sdiCode}</span>
                            </div>
                          )}
                          {inq.atecoCode && (
                            <div className="min-w-0">
                              <span className="block text-[9px] uppercase text-slate-400">Codice ATECO</span>
                              <span className="break-all font-mono text-slate-800">{inq.atecoCode}</span>
                            </div>
                          )}
                          {inq.address && (
                            <div className="col-span-2 min-w-0">
                              <span className="block text-[9px] uppercase text-slate-400">Indirizzo / Sede</span>
                              <span className="break-words text-slate-800">{inq.address} {inq.city}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Note interne */}
                    <div className="pt-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Appunti Interni</span>
                        {editingNoteId !== inq.id && (
                          <button
                            type="button"
                            onClick={() => handleStartEditingNote(inq)}
                            className="inline-flex min-h-9 items-center gap-1 px-1 text-[11px] font-bold text-[#008e97] hover:underline"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>{inq.notes ? "Modifica note" : "Aggiungi note"}</span>
                          </button>
                        )}
                      </div>

                      {editingNoteId === inq.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="es. Chiamato il 18/09: interessato ad aula Porto Torres per 3 persone..."
                            rows={3}
                            autoFocus
                            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97]"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleCancelNote}
                              className="min-h-11 rounded-xl px-4 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 sm:min-h-10"
                            >
                              Annulla
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNote(inq.id, inq.status)}
                              className="min-h-11 rounded-xl bg-[#008e97] px-5 text-xs font-bold text-white hover:bg-[#00777f] sm:min-h-10"
                            >
                              Salva nota
                            </button>
                          </div>
                        </div>
                      ) : inq.notes ? (
                        <div className="whitespace-pre-wrap break-words rounded-xl border border-amber-200/60 bg-amber-50/60 p-2.5 text-xs italic text-slate-700">
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

      {/* Altre azioni (mobile) */}
      <AdminModal
        open={Boolean(menuFor)}
        onClose={() => setMenuFor(null)}
        title={menuFor?.name ?? ""}
        subtitle={menuFor?.courseTitle || menuFor?.service_type || "Richiesta di contatto"}
        size="sm"
        bodyClassName="p-3"
      >
        {menuFor && (
          <ul className="space-y-1">
            {onScheduleInquiry && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    const target = menuFor;
                    setMenuFor(null);
                    onScheduleInquiry(target);
                  }}
                  className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-700">
                    <CalendarPlus className="h-5 w-5" />
                  </span>
                  Pianifica in Agenda
                </button>
              </li>
            )}
            {menuFor.courseSlug && (
              <li>
                <Link
                  to={`/corsi/${menuFor.courseSlug}`}
                  target="_blank"
                  onClick={() => setMenuFor(null)}
                  className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f6f7] text-[#008e97]">
                    <ExternalLink className="h-5 w-5" />
                  </span>
                  Vedi scheda del corso
                </Link>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => {
                  const id = menuFor.id;
                  setMenuFor(null);
                  setDeleteConfirmId(id);
                }}
                className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold text-[#df0000] transition-colors hover:bg-rose-50 active:bg-rose-100"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf2f2]">
                  <Trash2 className="h-5 w-5" />
                </span>
                Elimina richiesta
              </button>
            </li>
          </ul>
        )}
      </AdminModal>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        tone="neutral"
        title="Cambiare lo stato della richiesta?"
        confirmLabel="Salva"
        onConfirm={() => {
          if (pendingStatus) onUpdateStatus(pendingStatus.inquiry.id, pendingStatus.status);
          setPendingStatus(null);
        }}
        onCancel={() => setPendingStatus(null)}
      >
        La richiesta di <strong>{pendingStatus?.inquiry.name}</strong> passerà a{" "}
        <strong>{pendingStatus ? STATUS_NAMES[pendingStatus.status] ?? pendingStatus.status : ""}</strong>.
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        title="Eliminare la richiesta?"
        confirmLabel="Elimina definitivamente"
        onConfirm={() => {
          if (deleteConfirmId) onDeleteInquiry(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
      >
        La richiesta verrà rimossa dal registro. L&apos;operazione non è reversibile.
      </ConfirmDialog>
    </div>
  );
}
