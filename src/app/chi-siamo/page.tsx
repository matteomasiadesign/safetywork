import React from "react";
import { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { Shield, FileText, Award, HardHat, Settings, CheckCircle2 } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";
import RichText from "@/components/ui/RichText";
import { getSiteContent } from "@/lib/data/content";

export const revalidate = 60; // ISR ogni 60 secondi (e subito dopo ogni modifica dall'admin)

export const metadata: Metadata = {
  title: `Chi Siamo & Metodo Operativo | ${COMPANY_CONFIG.name}`,
  description:
    "Oltre 15 anni di esperienza nella consulenza, progettazione antincendio e formazione accreditata per la salute e sicurezza sul lavoro.",
};

const PILLAR_ICONS = [FileText, Award, HardHat, Settings] as const;

export default async function AboutPage() {
  const content = await getSiteContent();

  const pillars = ([1, 2, 3, 4] as const).map((n) => ({
    num: String(n).padStart(2, "0"),
    code: content[`about.pillar${n}.code`],
    title: content[`about.pillar${n}.title`],
    subtitle: content[`about.pillar${n}.subtitle`],
    desc: content[`about.pillar${n}.text`],
    tag: content[`about.pillar${n}.tag`],
    image: content[`about.pillar${n}.image`],
    icon: PILLAR_ICONS[n - 1],
  }));

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <SiteHeader />

      <main className="flex-grow">
        {/* Page Hero */}
        <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={content["about.hero.image"]}
              alt="Il nostro Team"
              className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Shield className="w-3.5 h-3.5 text-[#008e97]" />
              <span>{content["about.hero.badge"]}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 text-balance">
              <RichText text={content["about.hero.title"]} highlight={["text-[#008e97]", "text-[#df0000]"]} />
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {content["about.hero.subtitle"]}
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
                  <RichText text={content["about.approach.title"]} highlight="text-[#008e97]" />
                </h2>
                <div className="space-y-6 text-slate-600 leading-relaxed text-base sm:text-lg">
                  {(
                    [
                      "about.approach.text1",
                      "about.approach.text2",
                      "about.approach.text3",
                      "about.approach.text4",
                      "about.approach.text5",
                      "about.approach.text6",
                    ] as const
                  ).map(
                    (key) =>
                      content[key].trim() && (
                        <p key={key}>
                          <RichText text={content[key]} />
                        </p>
                      )
                  )}
                  {content["about.approach.closing"].trim() && (
                    <p className="font-bold text-slate-900">{content["about.approach.closing"]}</p>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-[#e6f6f7] rounded-3xl transform rotate-3 -z-10"></div>
                <img
                  src={content["about.approach.image"]}
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
                {content["about.pillars.title"]}
              </h2>
              <p className="text-lg text-slate-600">
                {content["about.pillars.subtitle"]}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pillars.map((pillar) => {
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

      <SiteFooter />
    </div>
  );
}

