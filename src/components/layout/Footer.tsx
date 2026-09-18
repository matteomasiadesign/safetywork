"use client";

import React from "react";
import Link from "@/components/ui/Link";
import { Shield, ArrowUp, Mail, Phone, MapPin, CheckCircle2, PhoneCall, ArrowRight } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";
import BrandStripe from "@/components/ui/BrandStripe";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#081724] text-slate-300 overflow-hidden">
      {/* 1. FASCIA GEOMETRICA SUPERIORE CON I TRE COLORI DEL BRAND */}
      <BrandStripe height="h-2.5" />

      {/* 2. GEOMETRIE DI SFONDO (Blueprint & Poligoni Architetturali) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow ciano geometrico */}
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-[#008e97]/15 blur-3xl" />
        {/* Glow arancione geometrico */}
        <div className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full bg-[#f58220]/10 blur-3xl" />
        
        {/* Griglia blueprint millimetrata */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#008e97_1px,transparent_1px),linear-gradient(to_bottom,#008e97_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Poligoni vettoriali ad angolo tecnico */}
        <svg
          className="absolute right-0 bottom-0 w-[420px] h-[320px] opacity-[0.05] text-white"
          viewBox="0 0 420 320"
          fill="currentColor"
        >
          <polygon points="0,320 420,0 420,320" />
          <polygon points="120,320 420,100 420,320" fill="#008e97" opacity="0.6" />
          <polygon points="260,320 420,190 420,320" fill="#f58220" opacity="0.6" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 z-10">
        
        {/* 3. CALLOUT BOX GEOMETRICO: Identità del Brand & Azione Diretta */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0c2231] via-[#091b26] to-[#0d2737] border border-[#008e97]/30 shadow-xl relative overflow-hidden">
          {/* Angolo geometrico tagliato a 45 gradi */}
          <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none">
            <div className="absolute -top-18 -right-18 w-36 h-36 bg-gradient-to-br from-[#f58220] via-[#df0000] to-transparent transform rotate-45 opacity-25" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008e97]/15 border border-[#008e97]/30 text-[#008e97] text-xs font-bold uppercase tracking-wider mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#008e97] animate-pulse" />
                <span>Sicurezza & Conformità Integrata</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Consulenza tecnica, adempimenti D.Lgs. 81/08 e formazione accreditata
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 font-normal">
                Sede operativa e aule didattiche a Porto Torres (SS). Servizi e perizie in tutta la Sardegna.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${COMPANY_CONFIG.contacts.phoneClean}`}
                className="px-5 py-3 rounded-xl bg-[#f58220] hover:bg-[#df6f11] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{COMPANY_CONFIG.contacts.phone}</span>
              </a>
              <Link
                href="/#contatti"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
              >
                <span>Scrivici</span>
                <ArrowRight className="w-4 h-4 text-[#008e97]" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4. GRIGLIA PRINCIPALE DEL FOOTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          
          {/* Colonna Brand & Recapiti con Barrette Geometriche */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              {/* Logo con rotazione geometrica a due livelli (Ciano e Rosso) */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-[#008e97] transform -rotate-6 rounded-xl shadow-xs" />
                <div className="absolute inset-0.5 bg-[#df0000] transform rotate-6 rounded-lg opacity-90" />
                <div className="relative z-10 text-white flex items-center justify-center">
                  <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  SAFETY<span className="text-[#008e97]">WORK</span>
                  <span className="text-xs text-[#f58220] ml-1.5 font-bold">S.r.l.s.</span>
                </span>
                <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                  {COMPANY_CONFIG.tagline}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-300/90 leading-relaxed max-w-sm">
              {COMPANY_CONFIG.description}
            </p>

            {/* Recapiti con indicatori geometrici laterali nei colori del brand */}
            <div className="pt-2 flex flex-col space-y-3 text-xs text-slate-300">
              <div className="border-l-2 border-[#008e97] pl-3 py-0.5">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Sede Operativa & Aule</span>
                <span className="font-medium text-white">{COMPANY_CONFIG.headquarters.fullAddress}</span>
              </div>
              <div className="border-l-2 border-[#f58220] pl-3 py-0.5">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Linea Telefonica</span>
                <a href={`tel:${COMPANY_CONFIG.contacts.phoneClean}`} className="font-bold text-white hover:text-[#f58220] transition-colors">
                  {COMPANY_CONFIG.contacts.phone}
                </a>
              </div>
              <div className="border-l-2 border-[#df0000] pl-3 py-0.5">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Canale Email</span>
                <a href={`mailto:${COMPANY_CONFIG.contacts.email}`} className="font-medium text-white hover:text-[#008e97] transition-colors break-all sm:break-normal">
                  {COMPANY_CONFIG.contacts.email}
                </a>
              </div>
            </div>
          </div>

          {/* Colonna Navigazione */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008e97]" />
              <span>Navigazione</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/corsi" className="hover:text-[#008e97] transition-colors">
                  Tutti i Corsi
                </Link>
              </li>
              <li>
                <Link href="/chi-siamo" className="hover:text-[#008e97] transition-colors">
                  Chi Siamo & Metodo
                </Link>
              </li>
              <li>
                <Link href="/#servizi" className="hover:text-[#008e97] transition-colors">
                  Servizi di Sicurezza
                </Link>
              </li>
              <li>
                <Link href="/#contatti" className="hover:text-[#008e97] transition-colors">
                  Parla con il team
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonna Corsi con accenti */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f58220]" />
              <span>Corsi Principali</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/corsi/rspp-datore-di-lavoro" className="hover:text-[#f58220] transition-colors">
                  RSPP Datore di Lavoro
                </Link>
              </li>
              <li>
                <Link href="/corsi/rappresentante-lavoratori-sicurezza-rls" className="hover:text-[#f58220] transition-colors">
                  Corso RLS 32 Ore
                </Link>
              </li>
              <li>
                <Link href="/corsi/addetto-antincendio-emergenze" className="hover:text-[#f58220] transition-colors">
                  Addetto Antincendio
                </Link>
              </li>
              <li>
                <Link href="/corsi/primo-soccorso-aziendale" className="hover:text-[#f58220] transition-colors">
                  Primo Soccorso Aziendale
                </Link>
              </li>
              <li>
                <Link href="/corsi/patentino-carrelli-elevatori-muletto" className="hover:text-[#f58220] transition-colors">
                  Patentino Muletto
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonna Normativa con Color-Coding del Brand */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#df0000]" />
              <span>Conformità di Legge</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#008e97] shrink-0" />
                <span>D.Lgs. 81/08 (Testo Unico)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#008e97] shrink-0" />
                <span>Accordo Stato-Regioni 2016</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#df0000] shrink-0" />
                <span>D.M. 02/09/2021 (Antincendio)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#f58220] shrink-0" />
                <span>D.M. 388/2003 (Primo Soccorso)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#df0000] shrink-0" />
                <span>D.P.R. 151/2011 (SCIA VVF)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5. BARRA INFERIORE CON DATI FISCALI E TASTO TORNA SU */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} {COMPANY_CONFIG.name} • P.IVA {COMPANY_CONFIG.piva} • REA {COMPANY_CONFIG.rea}
          </div>

          <div className="flex items-center space-x-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cookie Policy</span>
            <button
              onClick={scrollToTop}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-[#008e97] text-white transition-all ml-2 border border-white/10 hover:border-[#008e97]"
              aria-label="Torna in cima"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
