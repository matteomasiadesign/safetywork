"use client";

import React from "react";
import { ArrowDown, ChevronRight, ShieldCheck, FileText, CheckCircle2, Award } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import RichText from "@/components/ui/RichText";
import { parseCounter } from "@/lib/content/format";
import type { ContentSlice } from "@/lib/content/schema";

const STAT_COLORS = ["text-white", "text-[#008e97]", "text-[#f58220]", "text-[#df0000]"];

export default function HeroSection({ content }: { content: ContentSlice<"home.hero."> }) {
  const scrollToCourses = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("corsi-del-momento");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("contatti");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex flex-col justify-center min-h-[calc(100svh-72px)] px-4 sm:px-6 lg:px-8 border-b border-slate-200 overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={content["home.hero.image"]}
          alt="Sicurezza sul lavoro"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Compliance Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-semibold tracking-wide mb-5 shadow-sm text-center">
          <ShieldCheck className="w-4 h-4 text-[#008e97] shrink-0" />
          <span>{content["home.hero.badge"]}</span>
        </div>

        {/* High-Impact Headline Pulita */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white max-w-4xl text-balance">
          <RichText
            text={content["home.hero.title"]}
            highlight="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#008e97]"
          />
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-3xl leading-relaxed font-normal text-pretty">
          {content["home.hero.subtitle"]}
        </p>

        {/* Technical Key Indicators */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-white">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-[#008e97] shrink-0" />
            <span>{content["home.hero.chip1"]}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm whitespace-nowrap">
            <Award className="w-4 h-4 text-[#f58220] shrink-0" />
            <span>{content["home.hero.chip2"]}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm whitespace-nowrap">
            <FileText className="w-4 h-4 text-slate-200 shrink-0" />
            <span>{content["home.hero.chip3"]}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          {/* Primary CTA */}
          <button
            onClick={scrollToContact}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#df0000] hover:bg-[#df0000]/90 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <span>{content["home.hero.cta_primary"]}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>

          {/* Secondary CTA */}
          <button
            onClick={scrollToCourses}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-base font-semibold rounded-xl border border-white/20 transition-all shadow-sm whitespace-nowrap"
          >
            <span>{content["home.hero.cta_secondary"]}</span>
            <ArrowDown className="w-4 h-4 text-[#008e97] animate-bounce shrink-0" />
          </button>
        </div>

        {/* Numbers Strip */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center w-full max-w-4xl">
          {([1, 2, 3, 4] as const).map((n) => {
            const value = content[`home.hero.stat${n}_value`];
            const label = content[`home.hero.stat${n}_label`];
            const counter = parseCounter(value);
            return (
              <div key={n}>
                <div className={`text-2xl sm:text-3xl font-extrabold ${STAT_COLORS[n - 1]}`}>
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
                <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">{label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
