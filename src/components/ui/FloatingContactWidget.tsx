"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, MessageCircle, Phone, PenLine, X } from "lucide-react";
import Link from "@/components/ui/Link";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { whatsappNumber, type CompanyContacts } from "@/lib/content/format";
import { getOpenStatus, type OpenStatus } from "@/lib/content/hours";

const SEEN_KEY = "sw-contact-seen";

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
