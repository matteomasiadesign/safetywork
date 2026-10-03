"use client";

import React, { useEffect, useRef, useState } from "react";
import { COMPANY_CONFIG } from "@/config/company";
import { companyContacts, whatsappNumber } from "@/lib/content/format";
import { getOpenStatus, type OpenStatus } from "@/lib/content/hours";
import { submitInquiry } from "@/lib/utils/submitInquiry";
import type { ContentSlice } from "@/lib/content/schema";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ClipboardCheck,
  Compass,
  Flame,
  GraduationCap,
  HardHat,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Send,
  Volume2,
} from "lucide-react";

type Topic = { id: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }> };

/** Ambiti tra cui scegliere: servono a indirizzare la richiesta al consulente giusto. */
const TOPICS: Topic[] = [
  { id: "formazione", label: "Formazione e corsi", hint: "per lavoratori e figure aziendali", icon: GraduationCap },
  { id: "rischi", label: "Valutazione dei rischi", hint: "documenti e adempimenti", icon: ClipboardCheck },
  { id: "antincendio", label: "Antincendio e primo soccorso", hint: "squadre ed emergenze", icon: Flame },
  { id: "cantieri", label: "Cantieri e coordinamento", hint: "sicurezza in fase di lavori", icon: HardHat },
  { id: "rumore", label: "Rumore e igiene industriale", hint: "misure e valutazioni", icon: Volume2 },
  { id: "orientarsi", label: "Non so ancora da dove partire", hint: "ne parliamo insieme", icon: Compass },
];
const ORIENTAMENTO_ID = "orientarsi";

const STEPS_AFTER = [
  { title: "Ci racconti la situazione", text: "Poche righe bastano: settore, dimensioni, cosa ti preoccupa." },
  { title: "Un consulente ti richiama", text: "Per capire le tue esigenze e farti le domande giuste." },
  { title: "Ricevi una proposta chiara", text: "Cosa serve davvero, con quali tempi e a quali condizioni." },
];

const field =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all hover:bg-white focus:border-[#008e97] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008e97]/15";
const label = "mb-1.5 block text-xs font-semibold text-slate-700";

export default function ContactSection({ content }: { content: ContentSlice<"home.contact." | "company."> }) {
  const contacts = companyContacts(content);
  const whatsappHref = `https://wa.me/${whatsappNumber(contacts.phone)}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contacts.address)}`;

  const cardRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [topics, setTopics] = useState<string[]>([]);
  const [stepError, setStepError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [openStatus, setOpenStatus] = useState<OpenStatus | null>(null);
  const [form, setForm] = useState({
    message: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    privacyAccepted: false,
    website: "", // campo trappola anti-bot: deve restare vuoto
  });

  useEffect(() => {
    const update = () => setOpenStatus(getOpenStatus(contacts.hours));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [contacts.hours]);

  // Cambio passo: se l'inizio della scheda è uscito dallo schermo (tipico su telefono) la riporta in vista.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 80) card.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const toggleTopic = (id: string) => {
    setStepError("");
    setTopics((current) => {
      if (id === ORIENTAMENTO_ID) return current.includes(id) ? [] : [id];
      const without = current.filter((t) => t !== ORIENTAMENTO_ID);
      return without.includes(id) ? without.filter((t) => t !== id) : [...without, id];
    });
  };

  const topicLabels = topics.map((id) => TOPICS.find((t) => t.id === id)?.label).filter(Boolean) as string[];

  const goToStep2 = () => {
    if (topics.length === 0) {
      setStepError("Scegli almeno un ambito: ci aiuta a metterti in contatto con la persona giusta.");
      return;
    }
    setStepError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError("");

    if (!form.name.trim()) return setStepError("Come ti chiami? Ci serve almeno il nome.");
    if (!form.email.trim() || !form.email.includes("@")) return setStepError("Inserisci un indirizzo email valido.");
    if (!form.phone.trim()) return setStepError("Lascia un numero di telefono: ti richiamiamo noi.");
    if (!form.privacyAccepted) return setStepError("Per inviare la richiesta serve accettare l'informativa sulla privacy.");

    setStatus("loading");
    setFeedback("");

    const result = await submitInquiry({
      kind: "contatto",
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      serviceType: topicLabels.join(", "),
      message: form.message.trim() || `Richiesta di consulenza: ${topicLabels.join(", ")}.`,
      privacyAccepted: form.privacyAccepted,
      website: form.website,
    });

    if (!result.ok) {
      setStatus("error");
      setFeedback(result.error);
      return;
    }

    setStatus("success");
    setFeedback(result.message || "Abbiamo ricevuto la tua richiesta: un nostro consulente ti ricontatterà al più presto.");
  };

  const reset = () => {
    setStatus("idle");
    setFeedback("");
    setStep(1);
    setTopics([]);
    setForm({ message: "", name: "", email: "", phone: "", company: "", privacyAccepted: false, website: "" });
  };

  return (
    <section
      id="contatti"
      className="relative scroll-mt-16 overflow-hidden border-t border-slate-800 bg-[#0b1320] py-20 text-white lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid-white opacity-60" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,142,151,0.22) 0%, transparent 65%)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sinistra: invito e come funziona */}
          <div className="lg:col-span-5 lg:pt-6">
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300 sm:text-xs">
              <span className="h-px w-8 shrink-0 bg-[#19b8c2]" />
              Contatti
            </div>

            <h2 className="mt-5 text-balance font-display text-[clamp(2.4rem,5vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em]">
              {content["home.contact.title"]}
            </h2>
            <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              {content["home.contact.subtitle"]}
            </p>

            <ol className="mt-10 space-y-0">
              {STEPS_AFTER.map((s, i) => (
                <li key={s.title} className="relative flex gap-5 pb-7 last:pb-0">
                  {i < STEPS_AFTER.length - 1 && (
                    <span className="absolute left-[15px] top-9 h-[calc(100%-2.25rem)] w-px bg-white/15" aria-hidden="true" />
                  )}
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#0b1320] font-mono text-xs text-[#19b8c2]">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-[15px] font-semibold">{s.title}</div>
                    <div className="mt-0.5 text-sm leading-relaxed text-slate-400">{s.text}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Destra: richiesta guidata in due passi */}
          <div className="lg:col-span-7">
            <div
              ref={cardRef}
              className="scroll-mt-24 overflow-hidden rounded-[28px] bg-white text-slate-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
            >
              {status === "success" ? (
                <div className="px-6 py-14 text-center sm:px-12 sm:py-20">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f6f7] text-[#008e97]">
                    <Check className="h-8 w-8" />
                  </span>
                  <h3 className="mt-6 font-display text-3xl font-bold tracking-tight">Richiesta ricevuta</h3>
                  <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-slate-600">{feedback}</p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-slate-50"
                    >
                      Hai fretta? Scrivici su WhatsApp
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
                    >
                      Invia un'altra richiesta
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Campo trappola anti-bot (invisibile per le persone) */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label>
                      Non compilare questo campo
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                      />
                    </label>
                  </div>

                  {/* Avanzamento */}
                  <div className="flex">
                    {[1, 2].map((n) => (
                      <div key={n} className="h-1 flex-1 bg-slate-100">
                        <div
                          className="h-full bg-[#008e97] transition-all duration-500 ease-out"
                          style={{ width: step >= n ? "100%" : "0%" }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-6 sm:p-9">
                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div>
                        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                          Passo {step} di 2
                        </div>
                        <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight sm:text-[1.75rem]">
                          {step === 1 ? "Di cosa hai bisogno?" : "Come ti ricontattiamo?"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {step === 1
                            ? "Scegli uno o più ambiti: ci aiuta a indirizzarti subito alla persona giusta."
                            : "Lasciaci i tuoi recapiti: ti chiamiamo noi, senza che tu debba fare altro."}
                        </p>
                      </div>
                    </div>

                    {step === 1 && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {TOPICS.map((t) => {
                            const active = topics.includes(t.id);
                            const Icon = t.icon;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => toggleTopic(t.id)}
                                aria-pressed={active}
                                className={`group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                                  active
                                    ? "border-[#008e97] bg-[#e6f6f7] shadow-sm"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <span
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                    active ? "bg-[#008e97] text-white" : "bg-slate-100 text-slate-600 group-hover:bg-white"
                                  }`}
                                >
                                  {active ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold leading-snug text-slate-900">{t.label}</span>
                                  <span className="block text-xs text-slate-500">{t.hint}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div>
                          <label htmlFor="contact-message" className={label}>
                            Vuoi aggiungere qualche dettaglio? <span className="font-normal text-slate-400">(facoltativo)</span>
                          </label>
                          <textarea
                            id="contact-message"
                            rows={3}
                            placeholder="Es. siamo un'azienda di 12 persone, vorremmo mettere in regola la formazione entro l'estate…"
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            className={`${field} resize-none`}
                          />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                          <span className="min-w-0 text-slate-600">
                            <span className="text-slate-400">Ti serve: </span>
                            <span className="font-semibold text-slate-900">{topicLabels.join(" · ")}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#008e97] hover:underline"
                          >
                            <Pencil className="h-3 w-3" />
                            Modifica
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="contact-name" className={label}>
                              Nome e cognome *
                            </label>
                            <input
                              id="contact-name"
                              type="text"
                              autoComplete="name"
                              placeholder="Mario Rossi"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              className={field}
                            />
                          </div>
                          <div>
                            <label htmlFor="contact-phone" className={label}>
                              Telefono *
                            </label>
                            <input
                              id="contact-phone"
                              type="tel"
                              autoComplete="tel"
                              placeholder="+39 350 000 0000"
                              value={form.phone}
                              onChange={(e) => setForm({ ...form, phone: e.target.value })}
                              className={field}
                            />
                          </div>
                          <div>
                            <label htmlFor="contact-email" className={label}>
                              Email *
                            </label>
                            <input
                              id="contact-email"
                              type="email"
                              autoComplete="email"
                              placeholder="mario.rossi@azienda.it"
                              value={form.email}
                              onChange={(e) => setForm({ ...form, email: e.target.value })}
                              className={field}
                            />
                          </div>
                          <div>
                            <label htmlFor="contact-company" className={label}>
                              Azienda o ente <span className="font-normal text-slate-400">(facoltativo)</span>
                            </label>
                            <input
                              id="contact-company"
                              type="text"
                              autoComplete="organization"
                              placeholder="Ragione sociale"
                              value={form.company}
                              onChange={(e) => setForm({ ...form, company: e.target.value })}
                              className={field}
                            />
                          </div>
                        </div>

                        <label className="flex cursor-pointer items-start gap-3 pt-1 text-xs leading-relaxed text-slate-600">
                          <input
                            type="checkbox"
                            checked={form.privacyAccepted}
                            onChange={(e) => setForm({ ...form, privacyAccepted: e.target.checked })}
                            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-[#008e97] focus:ring-[#008e97]"
                          />
                          <span>
                            Acconsento al trattamento dei miei dati per essere ricontattato, secondo l'informativa sulla
                            privacy (Regolamento UE 2016/679).
                          </span>
                        </label>
                      </div>
                    )}

                    {(stepError || status === "error") && (
                      <div
                        role="alert"
                        className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#df0000]/25 bg-[#fdf2f2] px-4 py-3 text-sm text-[#b80000]"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{stepError || feedback}</span>
                      </div>
                    )}

                    <div className="mt-6 flex items-center gap-3">
                      {step === 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setStepError("");
                            setStatus("idle");
                            setStep(1);
                          }}
                          aria-label="Torna indietro"
                          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                      )}

                      {step === 1 ? (
                        <button
                          type="button"
                          onClick={goToStep2}
                          className="group flex flex-1 items-center justify-between rounded-full bg-slate-900 py-1.5 pl-7 pr-1.5 text-base font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          Continua
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-transform group-hover:translate-x-0.5">
                            <ArrowRight className="h-5 w-5" />
                          </span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={status === "loading"}
                          className="group flex flex-1 items-center justify-between rounded-full bg-[#df0000] py-1.5 pl-7 pr-1.5 text-base font-semibold text-white transition-colors hover:bg-[#c40000] disabled:opacity-60"
                        >
                          {status === "loading" ? "Invio in corso…" : "Invia la richiesta"}
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                            <Send className="h-[18px] w-[18px]" />
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Recapiti diretti per chi preferisce parlare */}
        <div className="mt-16 grid grid-cols-1 border-t border-white/15 sm:grid-cols-2 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1.35fr)]">
          <div className="border-b border-white/10 py-6 pr-6 sm:border-b-0 lg:pr-8">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <Phone className="h-3.5 w-3.5 text-[#f58220]" />
              Chiamaci
            </div>
            <a
              href={contacts.phoneHref}
              className="mt-2.5 block font-display text-2xl font-bold tracking-tight tabular-nums transition-colors hover:text-[#19b8c2]"
            >
              {contacts.phone}
            </a>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              {openStatus && <span className={`h-2 w-2 rounded-full ${openStatus.open ? "bg-emerald-400" : "bg-slate-500"}`} />}
              <span>
                {openStatus ? (
                  <>
                    <strong className="font-semibold text-slate-200">{openStatus.label}</strong> · {openStatus.detail}
                  </>
                ) : (
                  contacts.hours
                )}
              </span>
            </div>
          </div>

          <div className="border-b border-white/10 py-6 pr-6 sm:border-b-0 sm:pl-6 lg:border-l lg:pl-8">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <Mail className="h-3.5 w-3.5 text-[#19b8c2]" />
              Scrivici
            </div>
            <a
              href={`mailto:${contacts.email}`}
              className="mt-2.5 block break-words text-lg font-semibold transition-colors hover:text-[#19b8c2]"
            >
              {contacts.email}
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-white"
            >
              oppure su WhatsApp <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          <div className="border-b border-white/10 py-6 pr-6 sm:col-span-2 sm:border-b-0 sm:border-t sm:pt-6 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-8">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-[#ff3b30]" />
              Passa a trovarci
            </div>
            <div className="mt-2.5 text-lg font-semibold leading-snug">{contacts.address}</div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>{contacts.hours}</span>
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-white"
              >
                Indicazioni <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-xs text-slate-500">
          {COMPANY_CONFIG.name} · P.IVA / C.F. <span className="font-mono">{COMPANY_CONFIG.piva}</span> · REA{" "}
          <span className="font-mono">{COMPANY_CONFIG.rea}</span>
        </div>
      </div>
    </section>
  );
}
