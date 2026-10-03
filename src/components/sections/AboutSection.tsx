import React from "react";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";
import Link from "@/components/ui/Link";
import RichText from "@/components/ui/RichText";
import { splitTrailingSymbol } from "@/lib/content/format";
import type { SiteContent } from "@/lib/content/schema";

export default function AboutSection({ content }: { content: SiteContent }) {
  const [stat1, stat1Symbol] = splitTrailingSymbol(content["home.about.stat1_value"]);
  const [stat2, stat2Symbol] = splitTrailingSymbol(content["home.about.stat2_value"]);
  const text2 = content["home.about.text2"];

  return (
    <section id="chi-siamo" className="relative py-24 sm:py-32 overflow-hidden flex items-center min-h-[80vh] bg-slate-900 border-t border-slate-200">
      {/* Immagine a piena sezione con effetto sfocato e overlay scuro */}
      <div className="absolute inset-0 z-0">
        <img
          src={content["home.about.image"]}
          alt="Safety Works Team"
          loading="lazy"
          className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-slate-950/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Colonna Sinistra: Testo e Mission */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Users className="w-3.5 h-3.5 text-[#008e97]" />
              <span>{content["home.about.badge"]}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 drop-shadow-md">
              <RichText
                text={content["home.about.title"]}
                highlight="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#008e97]"
              />
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal mb-8">
              <RichText text={content["home.about.text1"]} />
            </p>
            {text2.trim() && (
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal border-l-2 border-[#008e97] pl-4">
                <RichText text={text2} />
              </p>
            )}
          </div>

          {/* Colonna Destra: Box Glassmorphism con Statistiche e Pulsante */}
          <div className="flex flex-col items-start lg:items-end w-full mt-8 lg:mt-0">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                <div className="relative">
                  <div className="absolute -left-[16px] top-2 w-1.5 h-1.5 bg-[#008e97] rounded-full shadow-[0_0_10px_rgba(0,142,151,0.8)]" />
                  <div className="text-4xl font-black text-white mb-1">{stat1}<span className="text-[#008e97]">{stat1Symbol}</span></div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">{content["home.about.stat1_label"]}</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[16px] top-2 w-1.5 h-1.5 bg-[#df0000] rounded-full shadow-[0_0_10px_rgba(223,0,0,0.8)]" />
                  <div className="text-4xl font-black text-white mb-1">{stat2}<span className="text-[#df0000]">{stat2Symbol}</span></div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">{content["home.about.stat2_label"]}</div>
                </div>
              </div>

              {/* Footer della card: Pulsante a tutta larghezza */}
              <div className="flex justify-center border-t border-white/10 pt-8 mt-4">
                <Link
                  href="/chi-siamo"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#df0000] hover:bg-[#b80000] text-white text-base font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 group w-full"
                >
                  <span>{content["home.about.button"]}</span>
                  <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-[#df0000] flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
