"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MessageCircle, Phone, PenLine, X } from "lucide-react";
import Link from "@/components/ui/Link";
import { whatsappNumber, type CompanyContacts } from "@/lib/content/format";
import { getOpenStatus, type OpenStatus } from "@/lib/content/hours";

const SEEN_KEY = "sw-contact-seen";

// Icona ufficiale WhatsApp
function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.65.81-.8 1-.15.19-.3.21-.55.08-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.45.06-.68.31-.23.25-.89.87-.89 2.12 0 1.25.91 2.45 1.04 2.62.13.17 1.79 2.73 4.33 3.83.6.26 1.08.42 1.45.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
    </svg>
  );
}

/**
 * Contatto rapido: un pulsante tondo e discreto che compare quando serve.
 * - Sulla home resta nascosto finché la hero è in vista e mentre si guarda la sezione Contatti (già lì il modulo).
 * - Per qualche secondo mostra "Serve aiuto?" una sola volta per sessione, poi resta solo l'icona.
 * - Il pallino dice se la segreteria è aperta (ricavato dagli orari scritti in admin).
 * - Il messaggio WhatsApp si adatta alla pagina: sulla scheda di un corso cita il corso.
 */
export default function FloatingContactWidget({ contacts }: { contacts: CompanyContacts }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  const [status, setStatus] = useState<OpenStatus | null>(null);
  const [whatsappHref, setWhatsappHref] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const markSeen = useCallback(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }, []);

  // Compare dopo un po' di scroll (sulla home: dopo la hero) e sparisce davanti al modulo contatti.
  useEffect(() => {
    if (isAdmin) return;
    const onScroll = () => {
      const threshold = pathname === "/" ? window.innerHeight * 0.7 : 240;
      let visible = window.scrollY > threshold;
      const form = document.getElementById("contatti");
      if (form) {
        const r = form.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.2) visible = false;
      }
      setShown(visible);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname, isAdmin]);

  useEffect(() => setOpen(false), [pathname]);

  // Invito "Serve aiuto?": una volta per sessione, appena il pulsante compare.
  useEffect(() => {
    if (!shown || open) return;
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SEEN_KEY);
    } catch {}
    if (seen) return;
    const show = window.setTimeout(() => setPeek(true), 1800);
    const hide = window.setTimeout(() => {
      setPeek(false);
      markSeen();
    }, 8200);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [shown, open, markSeen]);

  // Stato della segreteria, aggiornato ogni minuto.
  useEffect(() => {
    const update = () => setStatus(getOpenStatus(contacts.hours));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [contacts.hours]);

  // Chiusura: clic fuori o tasto Esc.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      // Messaggio WhatsApp calcolato al momento dell'apertura: sulla scheda di un corso cita il corso.
      const title = pathname?.startsWith("/corsi/") ? document.querySelector("main h1")?.textContent?.trim() : "";
      const text = title
        ? `Buongiorno, vorrei informazioni sul corso "${title}".`
        : "Buongiorno, vorrei avere informazioni sui vostri servizi di consulenza e formazione.";
      setWhatsappHref(`https://wa.me/${whatsappNumber(contacts.phone)}?text=${encodeURIComponent(text)}`);
    }
    setOpen((v) => !v);
    setPeek(false);
    markSeen();
  };

  if (isAdmin) return null;

  const visible = shown || open;

  return (
    <div
      ref={rootRef}
      className={`fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 transition-all duration-300 print:hidden sm:bottom-6 sm:right-6 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Contatti rapidi"
          className="sw-pop w-[min(20rem,calc(100vw-2rem))] rounded-3xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/10"
        >
          <div className="px-4 pb-2 pt-3">
            <div className="font-display text-lg font-bold leading-tight tracking-tight text-slate-900">
              Come preferisci parlarci?
            </div>
            {status && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                <span className={`h-2 w-2 rounded-full ${status.open ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span>
                  <strong className="font-semibold text-slate-700">{status.label}</strong> · {status.detail}
                </span>
              </div>
            )}
          </div>

          <ul>
            <li>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <WhatsAppIcon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">Scrivici su WhatsApp</span>
                  <span className="block text-xs text-slate-500">Un messaggio e ci siamo</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" />
              </a>
            </li>
            <li>
              <a
                href={contacts.phoneHref}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e6f6f7] text-[#008e97]">
                  <Phone className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">Chiamaci</span>
                  <span className="block text-xs tabular-nums text-slate-500">{contacts.phone}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" />
              </a>
            </li>
            <li>
              <Link
                href="/#contatti"
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf2f2] text-[#df0000]">
                  <PenLine className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">Richiedi una consulenza</span>
                  <span className="block text-xs text-slate-500">Raccontaci cosa ti serve</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-600" />
              </Link>
            </li>
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Chiudi i contatti rapidi" : "Apri i contatti rapidi"}
        className="group relative flex h-14 items-center rounded-full bg-[#0b1320] px-[15px] text-white shadow-[0_14px_32px_-10px_rgba(11,19,32,0.65)] ring-1 ring-white/15 transition-transform duration-200 hover:scale-[1.04] active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        <span
          className={`overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-500 ease-out ${
            peek && !open ? "max-w-[9rem] pl-3 pr-1 opacity-100" : "max-w-0 opacity-0 group-hover:max-w-[9rem] group-hover:pl-3 group-hover:pr-1 group-hover:opacity-100"
          } ${open ? "hidden" : ""}`}
        >
          Serve aiuto?
        </span>

        {status && !open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            {status.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />}
            <span
              className={`relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-[#0b1320] ${
                status.open ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
          </span>
        )}
      </button>
    </div>
  );
}
