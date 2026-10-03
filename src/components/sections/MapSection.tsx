"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MapPin, MousePointerClick, Navigation, Phone, X } from "lucide-react";
import { companyContacts } from "@/lib/content/format";
import { getOpenStatus, type OpenStatus } from "@/lib/content/hours";
import type { SiteContent } from "@/lib/content/schema";

/** Mappa chiara e leggermente desaturata finché è inerte; prende tutti i colori quando ci si interagisce. */
const IDLE_FILTER = "grayscale(0.5) saturate(0.9) contrast(1.03) brightness(1.04)";

/**
 * Mappa a tutta larghezza che "si accende" quando entra in vista: un'apertura circolare parte dal punto della sede
 * e, mentre si allarga, dal segnaposto escono onde concentriche. Per non rubare lo scroll della pagina (la
 * rotellina altrimenti zooma la mappa) resta inerte finché non ci si clicca sopra; allora si colora e si può esplorare.
 */
export default function MapSection({ content }: { content: SiteContent }) {
  const contacts = companyContacts(content);
  const address = contacts.address;
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [preload, setPreload] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [waited, setWaited] = useState(false);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<OpenStatus | null>(null);

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  // La mappa inizia a caricare quando la sezione è ancora lontana (circa due schermate): all'arrivo è già pronta.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setPreload(true), { rootMargin: "1800px 0px" });
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  // L'apertura parte appena la sezione è in vista; se Google non ha ancora finito aspetta al massimo mezzo secondo.
  const revealed = inView && (loaded || waited);
  useEffect(() => {
    if (!inView) return;
    const id = window.setTimeout(() => setWaited(true), 600);
    return () => window.clearTimeout(id);
  }, [inView]);

  // Ingresso in vista; se la mappa esce dallo schermo torna inerte.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
        else setActive(false);
      },
      { threshold: 0.2 }
    );
    io.observe(stage);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus(contacts.hours));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [contacts.hours]);

  return (
    <section className="relative w-full bg-[#0b1320] text-white">
      <div
        ref={stageRef}
        className="relative h-[600px] overflow-hidden sm:h-[640px] lg:h-[720px]"
        onPointerLeave={(e) => e.pointerType === "mouse" && setActive(false)}
      >
        {/* Mappa: si apre a cerchio dal segnaposto (al centro) */}
        <div className="sw-map-iris absolute inset-0" data-revealed={revealed}>
          <iframe
            src={preload ? mapSrc : undefined}
            title="Mappa della sede"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            onLoad={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full transition-[filter] duration-700 ${active ? "" : "pointer-events-none"}`}
            style={{ border: 0, filter: active ? "none" : IDLE_FILTER }}
          />
          {/* Sfumature ai bordi: la mappa nasce dal blu della sezione sopra */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${active ? "opacity-0" : "opacity-100"}`}
            style={{
              background:
                "linear-gradient(to bottom, #0b1320 0%, rgba(11,19,32,0) 10%)",
            }}
          />
        </div>

        {/* Onde dal segnaposto */}
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 transition-opacity duration-500 ${
            revealed && !active ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="sw-ring absolute -left-[170px] -top-[170px] h-[340px] w-[340px] rounded-full border-2"
              style={{ ["--i" as string]: i, borderColor: i === 1 ? "#f58220" : i === 2 ? "#df0000" : "#19b8c2" }}
            />
          ))}
        </div>

        {/* Un clic attiva la mappa (su touch: un tocco) */}
        {!active && (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label="Attiva la mappa per esplorarla"
            className="group absolute inset-0 z-10 cursor-pointer"
          >
            <span className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-[#0b1320]/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors group-hover:bg-[#0b1320]/90 sm:right-8 sm:top-8">
              <MousePointerClick className="h-4 w-4 text-[#19b8c2]" />
              Tocca per esplorare la mappa
            </span>
          </button>
        )}
        {active && (
          <button
            type="button"
            onClick={() => setActive(false)}
            className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-[#0b1320] px-4 py-2 text-xs font-semibold text-white shadow-lg sm:right-8 sm:top-8"
          >
            <X className="h-4 w-4" />
            Chiudi la mappa
          </button>
        )}

        {/* Scheda sede */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-7xl px-4 pb-4 transition-all duration-500 sm:px-6 sm:pb-8 lg:px-8 ${
            active ? "max-md:translate-y-6 max-md:opacity-0" : ""
          }`}
        >
          <div
            className={`sw-map-card pointer-events-auto w-full max-w-md rounded-3xl border border-white/15 bg-[#0b1320]/95 p-6 shadow-2xl backdrop-blur-xl sm:p-7 ${
              revealed ? "is-in" : ""
            }`}
          >
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#19b8c2]">
              <MapPin className="h-3.5 w-3.5" />
              {content["home.map.badge"]}
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tight sm:text-[2.1rem]">
              {content["home.map.title"]}
            </h2>
            <p className="mt-3 text-[15px] leading-snug text-slate-300">{address}</p>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              {status && <span className={`h-2 w-2 shrink-0 rounded-full ${status.open ? "bg-emerald-400" : "bg-slate-500"}`} />}
              <span>
                {status ? (
                  <>
                    <strong className="font-semibold text-slate-200">{status.label}</strong> · {status.detail}
                  </>
                ) : (
                  contacts.hours
                )}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-[#df0000] py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#c40000]"
              >
                Indicazioni
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <Navigation className="h-4 w-4" />
                </span>
              </a>
              <a
                href={contacts.phoneHref}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Phone className="h-4 w-4 text-[#19b8c2]" />
                Chiama
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
