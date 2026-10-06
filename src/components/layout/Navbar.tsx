"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/ui/Link";
import { ArrowRight, ArrowUpRight, ChevronDown, Clock, Mail, PhoneCall, X } from "lucide-react";
import type { CompanyContacts } from "@/lib/content/format";

export interface NavbarCourseLink {
  name: string;
  href: string;
}

interface NavbarProps {
  /** Corsi in evidenza mostrati nel menu "Corsi" (arrivano dal database). */
  courseLinks?: NavbarCourseLink[];
  /** Recapiti aziendali (modificabili da /admin). */
  contacts: CompanyContacts;
  /** Logo (modificabile da /admin). */
  logoSrc: string;
}

/** Sezioni della home che accendono la voce di menu corrispondente mentre si scorre. */
const HOME_SECTIONS: [id: string, link: string][] = [
  ["corsi-del-momento", "Corsi"],
  ["chi-siamo", "Chi Siamo"],
  ["servizi", "Servizi"],
  ["contatti", "Contatti"],
];

function Logo({ src, light = false }: { src: string; light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 object-contain transition-transform duration-300 group-hover/logo:scale-105"
      />
      <span className={`font-display text-[1.2rem] font-extrabold leading-none tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        SAFETY<span className="text-[#19b8c2]">WORKS</span>
      </span>
    </span>
  );
}

export default function Navbar({ courseLinks = [], contacts, logoSrc }: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [homeActive, setHomeActive] = useState<string | null>(null);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);

  const navLinks: { name: string; href: string; hasMenu?: boolean }[] = [
    { name: "Corsi", href: "/corsi", hasMenu: true },
    { name: "Chi Siamo", href: "/chi-siamo" },
    { name: "Servizi", href: "/#servizi" },
    { name: "Contatti", href: "/#contatti" },
  ];

  // Voce attiva: nella home dipende dalla sezione in vista, altrove dalla pagina.
  const activeName =
    pathname === "/"
      ? homeActive
      : pathname.startsWith("/corsi")
        ? "Corsi"
        : pathname.startsWith("/chi-siamo")
          ? "Chi Siamo"
          : null;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      if (pathname !== "/") return;
      let current: string | null = null;
      for (const [id, link] of HOME_SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = link;
      }
      setHomeActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Cambio pagina: chiude i menu aperti.
  useEffect(() => {
    setMenuOpen(false);
    setCoursesOpen(false);
  }, [pathname]);

  // Menu mobile aperto: blocca lo scroll della pagina e chiude con Esc.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    // Altezza zero: l'isola galleggia sopra il contenuto e resta agganciata in alto mentre si scorre.
    <header className="sticky top-3 z-50 h-0 px-3 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div
          className={`grid h-14 grid-cols-[1fr_auto] items-center rounded-full border border-white/70 pl-4 pr-2 ring-1 ring-slate-900/5 backdrop-blur-xl transition-[background-color,box-shadow] duration-300 lg:h-[60px] lg:grid-cols-[1fr_auto_1fr] lg:pl-5 ${
            scrolled
              ? "bg-white/95 shadow-[0_14px_40px_-12px_rgba(15,23,42,0.45)]"
              : "bg-white/95 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.35)]"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="group/logo flex w-fit items-center" aria-label="Safety Works, home">
            <Logo src={logoSrc} />
          </Link>

          {/* Navigazione desktop */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Principale">
            {navLinks.map((link) => {
              const active = activeName === link.name;
              const linkClass = `relative flex items-center gap-1 rounded-full px-3.5 py-2 text-[14px] font-medium whitespace-nowrap transition-colors ${
                active ? "bg-slate-900/[0.06] text-slate-900" : "text-slate-600 hover:bg-slate-900/5 hover:text-slate-900"
              }`;
              const dot = active && (
                <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#008e97]" />
              );

              if (!link.hasMenu) {
                return (
                  <Link key={link.name} href={link.href} className={linkClass}>
                    {link.name}
                    {dot}
                  </Link>
                );
              }

              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setCoursesOpen(true)}
                  onMouseLeave={() => setCoursesOpen(false)}
                  onFocus={() => setCoursesOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setCoursesOpen(false);
                  }}
                >
                  <Link href={link.href} className={linkClass} aria-haspopup="true" aria-expanded={coursesOpen}>
                    {link.name}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${coursesOpen ? "rotate-180" : ""}`} />
                    {dot}
                  </Link>

                  {/* Pannello corsi (il padding superiore tiene il passaggio del mouse senza "buchi") */}
                  <div
                    className={`absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-5 transition-all duration-200 ${
                      coursesOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="rounded-3xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15">
                      <Link
                        href="/corsi"
                        className="group/all flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#008e97]"
                      >
                        Tutti i corsi
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/all:translate-x-0.5" />
                      </Link>
                      {courseLinks.length > 0 && (
                        <>
                          <div className="px-4 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                            In evidenza
                          </div>
                          <ul>
                            {courseLinks.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className="group/sub flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#e6f6f7] hover:text-[#005e64]"
                                >
                                  <span className="line-clamp-2">{sub.name}</span>
                                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all group-hover/sub:-translate-y-0.5 group-hover/sub:translate-x-0.5 group-hover/sub:text-[#008e97]" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Azioni */}
          <div className="flex items-center justify-end gap-1.5 lg:gap-2">
            <a
              href={contacts.phoneHref}
              title="Chiama direttamente"
              className="hidden h-10 items-center gap-2 rounded-full px-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-900/5 hover:text-slate-900 lg:inline-flex"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f6f7] text-[#008e97]">
                <PhoneCall className="h-4 w-4" />
              </span>
              <span className="hidden whitespace-nowrap xl:inline">{contacts.phone}</span>
              <span className="sr-only xl:hidden">Chiama</span>
            </a>

            <Link
              href="/#contatti"
              className="group hidden items-center gap-2 whitespace-nowrap rounded-full bg-[#df0000] py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#c40000] lg:inline-flex"
            >
              Richiedi consulenza
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white group-hover:text-[#df0000]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            {/* Mobile: chiamata rapida + apertura menu */}
            <a
              href={contacts.phoneHref}
              aria-label="Chiama direttamente"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6f6f7] text-[#008e97] lg:hidden"
            >
              <PhoneCall className="h-[18px] w-[18px]" />
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Apri il menu"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white lg:hidden"
            >
              <span className="flex flex-col items-end gap-[5px]">
                <span className="h-[2px] w-[18px] rounded bg-white" />
                <span className="h-[2px] w-[11px] rounded bg-white" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile: pannello scuro a tutto schermo */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Chiudi il menu"
            onClick={closeMenu}
            className="hero-fade absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <div className="hero-fade absolute inset-x-3 bottom-3 top-3 flex flex-col overflow-hidden rounded-[28px] bg-[#0b1320] text-white shadow-2xl">
            <div className="flex h-[68px] shrink-0 items-center justify-between pl-5 pr-3">
              <Link href="/" onClick={closeMenu} className="group/logo" aria-label="Safety Works, home">
                <Logo src={logoSrc} light />
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Chiudi il menu"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overscroll-contain px-6 pb-4 pt-2" aria-label="Principale">
              <ul>
                {navLinks.map((link, i) => {
                  const active = activeName === link.name;
                  const row = (
                    <>
                      <span className="w-6 shrink-0 font-mono text-[11px] text-slate-500">0{i + 1}</span>
                      <span className="font-display text-[2rem] font-bold leading-none tracking-tight">{link.name}</span>
                      {active && <span className="ml-1 h-2 w-2 rounded-full bg-[#19b8c2]" />}
                    </>
                  );

                  return (
                    <li
                      key={link.name}
                      className="hero-fade border-b border-white/10"
                      style={{ ["--d" as string]: `${120 + i * 70}ms` }}
                    >
                      {link.hasMenu ? (
                        <>
                          <div className="flex items-center">
                            <Link href={link.href} onClick={closeMenu} className="flex flex-1 items-baseline gap-3 py-4">
                              {row}
                            </Link>
                            <button
                              type="button"
                              onClick={() => setMobileCoursesOpen((v) => !v)}
                              aria-expanded={mobileCoursesOpen}
                              aria-label="Mostra i corsi in evidenza"
                              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"
                            >
                              <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${mobileCoursesOpen ? "rotate-180" : ""}`} />
                            </button>
                          </div>
                          <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                              mobileCoursesOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                          >
                            <ul className="overflow-hidden">
                              {[{ name: "Tutti i corsi", href: "/corsi" }, ...courseLinks].map((sub) => (
                                <li key={sub.href}>
                                  <Link
                                    href={sub.href}
                                    onClick={closeMenu}
                                    className="flex items-center justify-between gap-3 py-2.5 pl-9 text-[15px] text-slate-300 hover:text-white"
                                  >
                                    <span className="line-clamp-2">{sub.name}</span>
                                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-500" />
                                  </Link>
                                </li>
                              ))}
                              <li className="h-2" />
                            </ul>
                          </div>
                        </>
                      ) : (
                        <Link href={link.href} onClick={closeMenu} className="flex items-baseline gap-3 py-4">
                          {row}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Azioni sempre raggiungibili col pollice */}
            <div className="hero-fade shrink-0 space-y-2.5 border-t border-white/10 p-4" style={{ ["--d" as string]: "420ms" }}>
              <Link
                href="/#contatti"
                onClick={closeMenu}
                className="group flex w-full items-center justify-between rounded-full bg-[#df0000] py-2 pl-6 pr-2 text-base font-semibold text-white transition-colors hover:bg-[#c40000]"
              >
                Richiedi consulenza
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <a
                href={contacts.phoneHref}
                onClick={closeMenu}
                className="flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                <PhoneCall className="h-[18px] w-[18px] text-[#19b8c2]" />
                {contacts.phone}
              </a>
              <div className="flex flex-col items-center gap-1 pt-1 text-[11px] text-slate-400">
                {contacts.hours && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {contacts.hours}
                  </span>
                )}
                {contacts.email && (
                  <a href={`mailto:${contacts.email}`} className="flex min-w-0 items-center gap-1.5 hover:text-white">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{contacts.email}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
