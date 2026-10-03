"use client";

import { useEffect, useRef, useState } from "react";
import BrandStripe from "@/components/ui/BrandStripe";

/**
 * Preloader della home: compare solo al primo ingresso della sessione, prima delle animazioni della hero.
 *
 * - Il markup è già nell'HTML del server e lo script qui sotto accende `data-preloading` su <html> prima del
 *   primo disegno: nessun lampo della pagina sotto. Finché l'attributo c'è, le animazioni della hero restano ferme.
 * - Il logo (/favicon.webp) si colora dal basso verso l'alto seguendo il caricamento vero (foto della hero e font).
 * - Finito il caricamento il pannello scorre verso l'alto e, mentre scopre la hero, parte la sua animazione.
 * - Non compare con "riduci animazioni", se la sessione l'ha già visto o se sessionStorage non è disponibile.
 * - Se qualcosa va storto, dopo 9 secondi lo script stesso toglie il blocco: la pagina non resta mai coperta.
 */

const SESSION_KEY = "sw-preloaded";
const MIN_DURATION = 1700; // ms: il preloader non lampeggia nemmeno su connessioni velocissime
const MAX_WAIT = 5000; // ms: oltre questo tempo si procede comunque
const WIPE_MS = 950;
const HERO_START_MS = 420; // la hero parte mentre il pannello sta ancora salendo

const BOOT_SCRIPT = `try{if(!sessionStorage.getItem("${SESSION_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){sessionStorage.setItem("${SESSION_KEY}","1");var d=document.documentElement;d.setAttribute("data-preloading","");setTimeout(function(){d.removeAttribute("data-preloading")},9000)}}catch(e){}`;

export default function Preloader({ imageSrc }: { imageSrc?: string }) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">("loading");
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const root = rootRef.current;
    if (!root) return;

    // Già visto in questa sessione (o animazioni ridotte): niente da mostrare.
    if (!html.hasAttribute("data-preloading")) {
      setPhase("done");
      return;
    }

    let raf = 0;
    let cancelled = false;
    const timers: number[] = [];
    let ready = false;
    let progress = 0;
    const start = performance.now();

    const waitFor: Promise<unknown>[] = [];
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      waitFor.push(img.decode().catch(() => undefined));
    }
    if (document.fonts?.ready) waitFor.push(document.fonts.ready);
    Promise.allSettled(waitFor).then(() => (ready = true));
    timers.push(window.setTimeout(() => (ready = true), MAX_WAIT));

    const paint = () => {
      root.style.setProperty("--p", progress.toFixed(2));
      if (counterRef.current) counterRef.current.textContent = String(Math.round(progress)).padStart(3, "0");
    };

    const leave = () => {
      setPhase("leaving");
      timers.push(window.setTimeout(() => html.removeAttribute("data-preloading"), HERO_START_MS));
      timers.push(window.setTimeout(() => setPhase("done"), WIPE_MS + 250));
    };

    const tick = (now: number) => {
      const t = Math.min((now - start) / MIN_DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const target = Math.min(eased * 100, ready ? 100 : 88);
      progress += (target - progress) * 0.18;
      if (target >= 100 && progress > 99.4) progress = 100;
      paint();
      if (progress >= 100) {
        timers.push(window.setTimeout(() => !cancelled && leave(), 280));
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [imageSrc]);

  if (phase === "done") return null;

  const leaving = phase === "leaving";

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />

      <div
        id="sw-preloader"
        ref={rootRef}
        role="status"
        aria-live="polite"
        aria-label="Caricamento in corso"
        className="fixed inset-0 z-[100] flex-col bg-[#0b1320] text-white"
        style={{
          ["--p" as string]: 0,
          clipPath: leaving ? "inset(0 0 100% 0)" : "inset(0 0 0% 0)",
          transition: leaving ? `clip-path ${WIPE_MS}ms cubic-bezier(0.76, 0, 0.24, 1) 120ms` : undefined,
        }}
      >
        {/* Griglia tecnica appena accennata */}
        <div className="absolute inset-0 bg-grid-white opacity-60" aria-hidden="true" />

        {/* Centro: logo che si colora + marchio */}
        <div
          className="relative flex flex-1 flex-col items-center justify-center gap-7 px-6 transition-all duration-500 ease-out"
          style={{ opacity: leaving ? 0 : 1, transform: leaving ? "translateY(-14px) scale(0.98)" : "none" }}
        >
          <div className="relative h-28 w-[116px] sm:h-36 sm:w-[150px]">
            <div
              className="absolute -inset-16 rounded-full opacity-70"
              style={{ background: "radial-gradient(circle, rgba(25,184,194,0.2) 0%, transparent 62%)" }}
              aria-hidden="true"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/favicon.webp"
              alt=""
              width={239}
              height={230}
              className="absolute inset-0 h-full w-full object-contain opacity-[0.16] grayscale"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/favicon.webp"
              alt=""
              width={239}
              height={230}
              className="absolute inset-0 h-full w-full object-contain"
              style={{ clipPath: "inset(calc((100 - var(--p)) * 1%) 0 0 0)" }}
            />
          </div>

          <div className="font-display text-[1.65rem] font-extrabold leading-none tracking-tight sm:text-3xl" aria-hidden="true">
            {"SAFETY".split("").map((c, i) => (
              <span key={`a${i}`} className="inline-block overflow-hidden align-bottom">
                <span className="sw-pre-letter" style={{ ["--i" as string]: i }}>
                  {c}
                </span>
              </span>
            ))}
            {"WORKS".split("").map((c, i) => (
              <span key={`b${i}`} className="inline-block overflow-hidden align-bottom">
                <span className="sw-pre-letter text-[#19b8c2]" style={{ ["--i" as string]: i + 6 }}>
                  {c}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Piede: sigla e contatore */}
        <div
          className="relative flex items-end justify-between px-6 pb-7 transition-opacity duration-300 sm:px-10"
          style={{ opacity: leaving ? 0 : 1 }}
        >
          <span className="max-w-[12rem] font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-slate-400 sm:max-w-none sm:text-[11px]">
            Sicurezza sul lavoro
            <br />
            Porto Torres (SS)
          </span>
          <span className="font-display text-5xl font-bold leading-none tabular-nums sm:text-6xl">
            <span ref={counterRef}>000</span>
            <span className="ml-1 text-xl text-[#19b8c2] sm:text-2xl">%</span>
          </span>
        </div>

        {/* Barra tricolore che avanza */}
        <div className="relative h-[3px] w-full" style={{ clipPath: "inset(0 calc((100 - var(--p)) * 1%) 0 0)" }}>
          <BrandStripe height="h-[3px]" />
        </div>
      </div>
    </>
  );
}
