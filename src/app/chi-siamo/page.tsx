import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, FileText, Award, HardHat, Settings, CheckCircle2 } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";

export const metadata: Metadata = {
  title: `Chi Siamo & Metodo Operativo | ${COMPANY_CONFIG.name}`,
  description:
    "Oltre 15 anni di esperienza nella consulenza, progettazione antincendio e formazione accreditata per la salute e sicurezza sul lavoro.",
};

const PILLARS = [
  {
    num: "01",
    code: "CONSULENZA // GESTIONE",
    title: "Consulenza e Gestione",
    subtitle: "Gestione Documentale & Incarichi",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",
    desc: "Supportiamo le imprese nella gestione completa della sicurezza, dalla redazione del DVR (Documento di Valutazione dei Rischi) alla gestione documentale quotidiana e all'assunzione diretta di incarichi come Responsabile del Servizio di Prevenzione e Protezione (RSPP).",
    tag: "D.Lgs. 81/08",
    icon: FileText,
  },
  {
    num: "02",
    code: "FORMAZIONE // TRAINING",
    title: "Formazione Accreditata",
    subtitle: "Corsi per ogni figura aziendale",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80",
    desc: "Progettiamo ed eroghiamo corsi di formazione obbligatori e specifici per lavoratori, dirigenti, preposti, RSPP, addetti antincendio, addetti al primo soccorso e abilitazione per attrezzature di lavoro.",
    tag: "D.Lgs 81/08",
    icon: Award,
  },
  {
    num: "03",
    code: "CANTIERI // OPERATIVITÀ",
    title: "Gestione Cantieri",
    subtitle: "Incarichi CSE e HSE",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80",
    desc: "Gestiamo la sicurezza all'interno dei cantieri temporanei e mobili offrendo supporto tecnico operativo attraverso incarichi diretti come Coordinatore della Sicurezza in fase di Esecuzione (CSE) e Health, Safety & Environment Manager (HSE).",
    tag: "Titolo IV D.Lgs 81/08",
    icon: HardHat,
  },
  {
    num: "04",
    code: "CONTROLLO // AUDIT",
    title: "Controllo e Verifiche",
    subtitle: "Audit e Assistenza Ispettiva",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    desc: "Monitoriamo costantemente gli adempimenti, pianifichiamo le scadenze e supportiamo attivamente l'azienda durante le verifiche ispettive da parte degli organi di vigilanza (ASL, ITL, VVF) e negli audit interni.",
    tag: "Compliance & Metodologia",
    icon: Settings,
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="flex-grow">
        {/* Page Hero */}
        <section className="relative py-20 lg:py-28 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2000&auto=format&fit=crop&q=80"
              alt="Il nostro Team"
              className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-[#008e97]" />
              <span>{COMPANY_CONFIG.name}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 text-balance">
              La Nostra <span className="text-[#008e97]">Storia</span> e il Nostro <span className="text-[#df0000]">Metodo</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Oltre 15 anni di esperienza dedicati a trasformare la sicurezza sul lavoro da un semplice obbligo di legge a un asset organizzativo strategico per le imprese.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
                  Il nostro approccio alla <span className="text-[#008e97]">Prevenzione</span>
                </h2>
                <div className="space-y-6 text-slate-600 leading-relaxed text-base sm:text-lg">
                  <p>
                    <strong>{COMPANY_CONFIG.name}</strong> nasce con l'obiettivo di affiancare datori di lavoro, RSPP e professionisti nella complessa gestione degli adempimenti previsti dal <strong>D.Lgs. 81/2008</strong> e dalle normative collegate.
                  </p>
                  <p>
                    Crediamo fermamente che la tutela della salute nei luoghi di lavoro non debba essere un ostacolo burocratico, bensì un valore etico ed economico: un'azienda conforme è un'azienda più produttiva, affidabile e protetta da rischi sanzionatori o penali.
                  </p>
                  <p>
                    Il nostro team multidisciplinare è composto da <strong>ingegneri, tecnici della prevenzione e docenti formatori qualificati</strong>, in grado di operare sia con sopralluoghi tecnici asseverati sia con didattica accreditata.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-[#e6f6f7] rounded-3xl transform rotate-3 -z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&auto=format&fit=crop&q=80"
                  alt="Riunione sulla sicurezza"
                  className="rounded-2xl shadow-xl w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* I Nostri Pilastri */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                I Nostri Pilastri Operativi
              </h2>
              <p className="text-lg text-slate-600">
                Copertura normativa a 360 gradi per la piena conformità di ogni ambiente di lavoro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.num}
                    className="group relative bg-[#008e97] rounded-2xl p-8 sm:p-10 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden z-10 min-h-[400px]"
                  >
                    <div className="absolute inset-0 z-0">
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-slate-900/60" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-8">
                          <span className="text-4xl font-black text-white/20 group-hover:text-white/40 transition-colors">
                            {pillar.num}
                          </span>
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm group-hover:scale-105 transition-transform group-hover:bg-[#df0000]">
                            <Icon className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3 font-mono text-[10px] text-slate-300 uppercase">
                          <span className="w-1.5 h-1.5 bg-[#df0000] rounded-full" />
                          <span>{pillar.code}</span>
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-[#008e97] bg-white px-2 py-1 rounded">
                          {pillar.subtitle}
                        </span>

                        <h3 className="text-2xl font-bold text-white mt-4 mb-4">
                          {pillar.title}
                        </h3>
                        <p className="text-sm text-slate-300 leading-relaxed font-normal">
                          {pillar.desc}
                        </p>
                      </div>

                      <div className="mt-8 pt-4 border-t border-white/20 flex items-center justify-between text-xs font-mono text-slate-400 mt-auto">
                        <span>{pillar.tag}</span>
                        <CheckCircle2 className="w-4 h-4 text-[#008e97]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

