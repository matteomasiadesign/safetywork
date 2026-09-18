"use client";

import React from "react";
import {
  FileCheck,
  GraduationCap,
  Flame,
  Activity,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  PhoneCall,
  HardHat,
  Building,
  Scale,
  Wrench,
  Users,
} from "lucide-react";
import Link from "@/components/ui/Link";
import { useData } from "@/context/DataContext";
import BrandStripe from "@/components/ui/BrandStripe";

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  FileCheck,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Flame,
  HardHat,
  Building,
  Scale,
  Wrench,
  Users,
  PhoneCall,
};

export default function ServicesSection() {
  const { services } = useData();


  return (
    <section id="servizi" className="py-20 sm:py-28 bg-tech-blueprint-slate text-slate-900 relative overflow-hidden border-t border-slate-200">
      {/* CAD Schematic Watermark */}
      <div className="absolute -bottom-24 -right-24 opacity-20 pointer-events-none hidden lg:block">
        
      </div>

      {/* Floating technical coordinates */}
      <div className="hidden lg:flex justify-between items-center max-w-7xl w-full mx-auto px-6 absolute top-6 left-0 right-0 pointer-events-none">
        
        
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e6f6f7] border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs whitespace-nowrap">
              <span>Soluzioni Tecniche • D.Lgs. 81/08</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
              Servizi di Sicurezza e Ingegneria
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal text-pretty">
              Interventi specialistici per azzerare i rischi sanzionatori e garantire continuità e sicurezza operativa ad ogni settore d'impresa.
            </p>
          </div>

          <Link
            href="/#contatti"
            className="w-fit inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-white text-slate-900 hover:text-[#008e97] text-xs font-bold uppercase tracking-wider border border-slate-200 hover:border-[#008e97]/40 shadow-xs transition-all group whitespace-nowrap"
          >
            <span>Richiedi Check-Up Tecnico</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
          </Link>
        </div>

        {/* 4 Technical Service Cards Stondate Bianche con Header Immagine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((srv) => {
            const Icon = SERVICE_ICONS[srv.iconName] || ShieldAlert;
            return (
              <div
                key={srv.code}
                className="group relative bg-white border border-slate-200 hover:border-[#008e97]/60 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Banner Fotografico Superiore */}
                <div className="relative h-48 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-6 overflow-hidden rounded-t-3xl">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                  {/* Badge Identificativi su Foto */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-xs whitespace-nowrap">
                      {srv.code}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-1 rounded-lg bg-[#008e97] text-white font-bold tracking-wider shadow-xs whitespace-nowrap">
                      SPEC
                    </span>
                  </div>

                  {/* Icona e Riferimento Normativo */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-xs font-mono font-medium text-slate-200 backdrop-blur-sm bg-black/40 px-2.5 py-1 rounded-lg whitespace-nowrap">
                      {srv.law}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#df0000] group-hover:scale-105 transition-all shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Contenuto Testuale ad Alto Contrasto */}
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#df0000] transition-colors leading-snug mb-3">
                      {srv.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                      {srv.description}
                    </p>

                    {/* Box Deliverable Inclusi */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 mb-6 space-y-2.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Deliverable Inclusi:
                      </div>
                      {srv.deliverables.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-[#008e97] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer della Card con Link in Rosso Aziendale */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <Link
                      href="/#contatti"
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#df0000] hover:text-[#be0000] uppercase tracking-wider transition-colors group/link whitespace-nowrap"
                    >
                      <span>Richiedi offerta dedicata</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform shrink-0" />
                    </Link>
                    <span className="text-[11px] font-mono text-slate-400 font-semibold whitespace-nowrap">D.Lgs. 81/08</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Callout Box for inspection notices Stondata con Dettagli Tecnici */}
        <div className="relative mt-16 p-8 rounded-2xl bg-white border-2 border-[#df0000]/30 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          {/* Geometric Brand Top Stripe */}
          <BrandStripe height="h-1.5" className="absolute top-0 inset-x-0" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#fdf2f2] border border-[#df0000]/30 text-[#df0000] flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-bold text-[#df0000] uppercase tracking-wider bg-[#fdf2f2] px-2 py-0.5 rounded-full border border-[#df0000]/20 whitespace-nowrap">
                  FAST TRACK • RISPOSTA H24
                </span>
                
              </div>
              <h4 className="text-lg font-bold text-slate-900 text-balance">
                Hai ricevuto una prescrizione o un verbale da ASL / ITL / Vigili del Fuoco?
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed font-normal text-pretty">
                I nostri periti e ingegneri intervengono entro 24 ore con sopralluogo urgente per predisporre le memorie tecniche e regolarizzare la posizione aziendale entro i termini perentori.
              </p>
            </div>
          </div>

          <a
            href="tel:+390287198240"
            className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-[#df0000] hover:bg-[#be0000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span>Intervento Ispettivo Urgente</span>
          </a>
        </div>
      </div>
    </section>
  );
}
