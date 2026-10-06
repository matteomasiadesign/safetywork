"use client";

import React, { useEffect, useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "@/components/ui/Link";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { parseCounter } from "@/lib/content/format";
import type { ContentSlice } from "@/lib/content/schema";

/** Prossima data in calendario, già pronta da mostrare (calcolata lato server). */
export interface HeroNextDate {
  id: string;
  slug: string;
  title: string;
  day: string;
  month: string;
  place: string;
}

const STAT_MARKERS = ["bg-white", "bg-[#008e97]", "bg-[#f58220]", "bg-[#df0000]"];

/** Colori "di segnaletica": ciano = informazione, arancione = pericolo, rosso = divieto/emergenza. */
const HOTSPOTS = [
  { code: "R-01", color: "#19b8c2", left: "69%", top: "17%", side: "right" },
  { code: "R-02", color: "#f58220", left: "87%", top: "31%", side: "left" },
  { code: "R-03", color: "#ff3b30", left: "73%", top: "45%", side: "right" },
] as const;

/** Spezza il titolo in parole; quelle in [[doppie parentesi]] vengono evidenziate. */
function tokenizeTitle(text: string): { word: string; highlight: boolean }[] {
  return text
    .split(/(\[\[[^\]]+?\]\])/g)
    .flatMap((part) => {
      const highlight = part.startsWith("[[") && part.endsWith("]]") && part.length > 4;
      const clean = highlight ? part.slice(2, -2) : part;
      return clean
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({ word, highlight }));
    });
}

export default function HeroSection({
  content,
  nextDates = [],
}: {
  content: ContentSlice<"home.hero.">;
  nextDates?: HeroNextDate[];
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  // Alone di luce: segue il mouse e rivela i colori della foto; a riposo (o su touch) si muove piano da solo.
  useEffect(() => {
    const section = sectionRef.current;
    const scanner = scannerRef.current;
    if (!section || !scanner) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    const measure = () => {
      const r = section.getBoundingClientRect();
      w = r.width;
      h = r.height;
    };
    measure();

    const pos = { x: w * 0.72, y: h * 0.36 };
    const target = { ...pos };
    let lastPointer = -Infinity;
    let raf = 0;

    const paint = () => {
      scanner.style.setProperty("--lx", `${pos.x}px`);
      scanner.style.setProperty("--ly", `${pos.y}px`);
    };

    if (reduceMotion) {
      paint();
      return;
    }

    const tick = (t: number) => {
      if (t - lastPointer > 2500) {
        target.x = w * (0.66 + 0.2 * Math.sin(t / 2600));
        target.y = h * (0.4 + 0.22 * Math.sin(t / 2100 + 1));
      }
      pos.x += (target.x - pos.x) * 0.1;
      pos.y += (target.y - pos.y) * 0.1;
      paint();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = section.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      lastPointer = performance.now();
    };
    const onLeave = () => {
      lastPointer = -Infinity;
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 });
    io.observe(section);
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Pulsante "magnetico": segue leggermente il cursore.
  const magnet = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const magnetReset = (e: React.PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = "";
  };

  const chips = [content["home.hero.chip1"], content["home.hero.chip2"], content["home.hero.chip3"]];
  const words = tokenizeTitle(content["home.hero.title"]);

  return (
    <section
      ref={sectionRef}
      className="relative flex flex-col min-h-[100svh] overflow-hidden bg-[#0b1320] text-white border-b border-slate-800"
    >
      {/* Livello 1: foto sul lato destro (da lg), sfumata verso il testo */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-y-0 right-0 w-full lg:w-[66%]">
          <img
            src={content["home.hero.image"]}
            alt="Sicurezza sul lavoro"
            className="h-full w-full object-cover saturate-75"
          />
          <div className="absolute inset-0 bg-[#0b1320]/65 lg:bg-[#0b1320]/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1320] via-[#0b1320]/50 to-transparent" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1320] via-transparent to-[#0b1320]/50" />
      </div>

      {/* Livello 2: lo stesso scatto a piena luce, visibile solo attorno al cursore */}
      <div ref={scannerRef} aria-hidden="true" className="hero-scanner pointer-events-none absolute inset-0 z-[1]">
        <div className="hero-scanner-fade absolute inset-y-0 right-0 w-full lg:w-[66%]">
          <img src={content["home.hero.image"]} alt="" className="h-full w-full object-cover brightness-105 saturate-125" />
        </div>
      </div>

      {/* Hotspot: i tre punti di forza diventano "rischi individuati" (solo desktop) */}
      <div className="hidden lg:block">
        {HOTSPOTS.map((spot, i) => (
          <Link
            key={spot.code}
            href="/#servizi"
            className="hero-fade group absolute z-20"
            style={{ left: spot.left, top: spot.top, ["--d" as string]: `${900 + i * 150}ms` }}
          >
            <span className="relative flex h-4 w-4 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: spot.color }} />
              <span
                className="relative h-4 w-4 rounded-full border-2 border-white transition-transform group-hover:scale-125"
                style={{ background: spot.color }}
              />
            </span>
            <span
              className={`absolute top-0 -translate-y-1/2 flex items-center gap-2.5 whitespace-nowrap border border-white/15 bg-[#0b1320]/80 backdrop-blur-md px-3 py-1.5 text-xs font-semibold transition-colors group-hover:border-white/40 ${
                spot.side === "right" ? "left-6" : "right-8"
              }`}
            >
              <span className="font-mono text-[10px] tracking-widest" style={{ color: spot.color }}>
                {spot.code}
              </span>
              {chips[i]}
            </span>
          </Link>
        ))}
      </div>

      {/* Contenuto */}
      <div className="relative z-10 flex flex-1 flex-col pointer-events-none">
        <div className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-14 lg:pt-32 lg:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 lg:items-end">
            <div className="lg:col-span-8">
              {/* Etichetta */}
              <div
                className="hero-fade flex items-center gap-3 font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] text-slate-300"
                style={{ ["--d" as string]: "0ms" }}
              >
                <span className="h-px w-8 bg-[#19b8c2] shrink-0" />
                <span>{content["home.hero.badge"]}</span>
              </div>

              {/* Titolo */}
              <h1 className="mt-6 font-display font-bold tracking-[-0.03em] leading-[0.98] text-[clamp(2.5rem,5.4vw,5.75rem)] text-balance">
                {words.map((w, i) => (
                  <React.Fragment key={i}>
                    <span className="inline-block overflow-hidden align-bottom pb-[0.1em] -mb-[0.1em]">
                      <span
                        className={`hero-word ${w.highlight ? "text-[#19b8c2]" : ""}`}
                        style={{ ["--i" as string]: i }}
                      >
                        {w.word}
                      </span>
                    </span>{" "}
                  </React.Fragment>
                ))}
              </h1>

              <p
                className="hero-fade mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-slate-300 text-pretty"
                style={{ ["--d" as string]: `${300 + words.length * 40}ms` }}
              >
                {content["home.hero.subtitle"]}
              </p>

              {/* Punti di forza su mobile/tablet (su desktop sono gli hotspot) */}
              <ul
                className="hero-fade mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-slate-300 lg:hidden"
                style={{ ["--d" as string]: "700ms" }}
              >
                {chips.map((chip, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5" style={{ background: HOTSPOTS[i].color }} />
                    {chip}
                  </li>
                ))}
              </ul>

              {/* Azioni: un solo pulsante rosso */}
              <div
                className="hero-fade pointer-events-auto mt-8 flex flex-col sm:flex-row sm:items-center gap-x-8 gap-y-5"
                style={{ ["--d" as string]: "800ms" }}
              >
                <Link
                  href="/#contatti"
                  onPointerMove={magnet}
                  onPointerLeave={magnetReset}
                  className="group inline-flex w-full sm:w-auto items-center justify-between sm:justify-center gap-4 rounded-full bg-[#df0000] hover:bg-[#c40000] pl-7 pr-2 py-2 text-base font-bold text-white shadow-[0_12px_40px_-10px_rgba(223,0,0,0.7)] transition-[background-color,transform] duration-200 ease-out"
                >
                  <span>{content["home.hero.cta_primary"]}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white group-hover:text-[#df0000]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link
                  href="/#corsi-del-momento"
                  className="group inline-flex items-center gap-2 self-start sm:self-auto border-b border-white/40 pb-1 text-base font-semibold text-white transition-colors hover:border-[#19b8c2] hover:text-[#19b8c2]"
                >
                  {content["home.hero.cta_secondary"]}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Prossime date (dati reali dal catalogo) */}
            {nextDates.length > 0 && (
              <aside
                className="hero-fade pointer-events-auto lg:col-span-4 w-full max-w-md lg:max-w-none lg:justify-self-end border border-white/15 bg-[#0b1320]/70 backdrop-blur-md"
                style={{ ["--d" as string]: "1000ms" }}
                aria-label="Prossime date dei corsi"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#ff3b30] animate-pulse" />
                    Prossime date
                  </span>
                  <Link href="/corsi" className="text-slate-400 hover:text-white transition-colors">
                    Calendario →
                  </Link>
                </div>
                <ul className="divide-y divide-white/10">
                  {nextDates.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/corsi/${d.slug}`}
                        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5"
                      >
                        <div className="w-12 shrink-0 text-center">
                          <div className="font-display text-3xl font-bold leading-none">{d.day}</div>
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[#19b8c2]">{d.month}</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{d.title}</div>
                          <div className="mt-0.5 truncate text-xs text-slate-400">{d.place}</div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500 transition-all group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        </div>

        {/* Numeri */}
        <div className="border-t border-white/15 bg-[#0b1320]/60 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4">
            {([1, 2, 3, 4] as const).map((n) => {
              const value = content[`home.hero.stat${n}_value`];
              const label = content[`home.hero.stat${n}_label`];
              const counter = parseCounter(value);
              return (
                <div key={n} className="border-white/10 py-5 pr-4 lg:py-6 lg:pl-6 lg:first:pl-0 lg:border-l lg:first:border-l-0">
                  <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                    {counter ? (
                      <AnimatedCounter
                        key={value}
                        end={counter.end}
                        decimals={counter.decimals}
                        suffix={counter.suffix}
                        duration={2000}
                      />
                    ) : (
                      value
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    <span className={`h-1.5 w-1.5 shrink-0 ${STAT_MARKERS[n - 1]}`} />
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
