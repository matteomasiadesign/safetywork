"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Phone, PhoneCall, X, Shield, Clock, ArrowUpRight, MessageSquare } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";
import BrandStripe from "@/components/ui/BrandStripe";

// Icona vettoriale ufficiale WhatsApp ad alta fedeltà
function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.65.81-.8 1-.15.19-.3.21-.55.08-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.45.06-.68.31-.23.25-.89.87-.89 2.12 0 1.25.91 2.45 1.04 2.62.13.17 1.79 2.73 4.33 3.83.6.26 1.08.42 1.45.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
    </svg>
  );
}

export default function FloatingContactWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Non mostrare nel pannello di amministrazione
  const isExcludedPage = pathname?.startsWith("/admin");

  // Mostra un piccolo avviso/fumetto dopo 3 secondi per attirare l'attenzione con discrezione
  useEffect(() => {
    if (isExcludedPage) return;
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, [isExcludedPage]);

  // Chiudi cliccando fuori dal widget
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (isExcludedPage) return null;

  const phoneHref = `tel:${COMPANY_CONFIG.contacts.phoneClean}`;
  const whatsappMessage = encodeURIComponent(
    "Buongiorno, vorrei informazioni sui corsi di formazione e servizi di sicurezza sul lavoro Safety Work."
  );
  const whatsappHref = `https://wa.me/393505973817?text=${whatsappMessage}`;

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end print:hidden select-none"
    >
      {/* 1. Popover Card (Nuvoletta interattiva espansa) */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Opzioni di contatto rapido"
          className="mb-3 w-[calc(100vw-40px)] max-w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          {/* Fascia Geometrica Tricolore Brand in cima alla card */}
          <BrandStripe height="h-1.5" />

          {/* Intestazione Card */}
          <div className="p-4 bg-gradient-to-br from-[#0c2231] to-[#081724] text-white relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Chiudi finestra contatto"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-lg bg-[#008e97] flex items-center justify-center text-white shadow-xs shrink-0">
                <Shield className="w-4 h-4" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0c2231]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight leading-tight">
                  Supporto Rapido Safety Work
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Consulenti & Segreteria attivi</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              Hai domande su un corso, preventivi D.Lgs. 81/08 o ispezioni urgenti? Scegli il canale che preferisci:
            </p>
          </div>

          {/* Opzioni di Contatto */}
          <div className="p-3 space-y-2 bg-slate-50/70">
            {/* Opzione 1: Scrivi su WhatsApp */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-between p-3 rounded-xl bg-white hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    Scrivi su WhatsApp
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Chat istantanea con un operatore
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
            </a>

            {/* Opzione 2: Chiama Subito */}
            <a
              href={phoneHref}
              onClick={() => setIsOpen(false)}
              className="group flex items-center justify-between p-3 rounded-xl bg-white hover:bg-cyan-50/80 border border-slate-200 hover:border-[#008e97]/40 shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#008e97] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-[#008e97]">
                    Chiama al Telefono
                  </span>
                  <span className="block text-[11px] font-mono text-slate-600 font-semibold">
                    {COMPANY_CONFIG.contacts.phone}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#008e97] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
            </a>
          </div>

          {/* Footer Orari */}
          <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Orari: Lun - Ven 08:30 - 18:30</span>
            </span>
            <span className="font-semibold text-slate-600">Porto Torres (SS)</span>
          </div>
        </div>
      )}

      {/* 2. Nuvoletta messaggio di invito (Speech Bubble Tooltip quando chiuso) */}
      {!isOpen && showTooltip && (
        <div
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
          className="mb-2.5 mr-1 cursor-pointer bg-white text-slate-900 px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 hover:border-[#008e97]/40 hover:shadow-2xl transition-all group"
        >
          <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping shrink-0" />
          <span>Serve aiuto? <strong>Scrivici o Chiama</strong></span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 ml-1 p-0.5 rounded-full hover:bg-slate-100"
            title="Chiudi fumetto"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. Bottone Trigger Principale Galleggiante */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        aria-label={isOpen ? "Chiudi contatti rapidi" : "Apri opzioni WhatsApp e Telefono"}
        className={`relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? "w-13 h-13 bg-slate-800 text-white border-2 border-slate-700 rotate-90"
            : "h-14 px-4 bg-gradient-to-r from-[#008e97] via-[#09737a] to-[#25D366] text-white border-2 border-white shadow-[0_8px_25px_rgba(0,142,151,0.4)]"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="flex items-center gap-2.5">
            {/* Doppia icona coordinata: WhatsApp + Telefono */}
            <div className="relative flex items-center -space-x-1.5">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs border border-white/30 shrink-0">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <div className="w-7 h-7 rounded-full bg-[#f58220] text-white flex items-center justify-center shadow-xs border border-white/30 shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
            </div>

            <span className="hidden sm:inline-block text-xs font-bold tracking-wide uppercase pr-1 text-white text-shadow-xs">
              Contattaci
            </span>

            {/* Punto verde pulsante online */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>
        )}
      </button>
    </div>
  );
}

