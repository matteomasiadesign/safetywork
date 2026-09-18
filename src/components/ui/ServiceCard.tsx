import React from "react";
import Link from "@/components/ui/Link";
import { LucideIcon, ArrowRight, CheckCircle } from "lucide-react";

interface ServiceCardProps {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  badge: string;
  accentColor?: "cyan" | "orange";
}

export default function ServiceCard({
  title,
  subtitle,
  description,
  features,
  icon: Icon,
  badge,
  accentColor = "cyan",
}: ServiceCardProps) {
  const isCyan = accentColor === "cyan";

  return (
    <div className="relative bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
      {/* Geometric Decorative Accent */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-tr-xl pointer-events-none`}
      >
        <div
          className={`absolute -top-12 -right-12 w-24 h-24 transform rotate-45 opacity-10 transition-transform group-hover:scale-125 duration-300 ${
            isCyan ? "bg-brand-cyan" : "bg-brand-orange"
          }`}
        />
      </div>

      <div>
        {/* Header with icon & badge */}
        <div className="flex items-center justify-between mb-6">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isCyan
                ? "bg-brand-cyan-light text-brand-cyan group-hover:bg-brand-cyan group-hover:text-white"
                : "bg-brand-orange-light text-brand-orange group-hover:bg-brand-orange group-hover:text-white"
            }`}
          >
            <Icon className="w-6 h-6 stroke-[2]" />
          </div>
          <span
            className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
              isCyan
                ? "bg-white text-brand-cyan border-brand-cyan/20"
                : "bg-white text-brand-orange border-brand-orange/20"
            }`}
          >
            {badge}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-cyan transition-colors mb-1">
          {title}
        </h3>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3.5">
          {subtitle}
        </p>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {description}
        </p>

        {/* Feature checklist */}
        <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-200">
          {features.map((item, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-900">
              <CheckCircle
                className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                  isCyan ? "text-brand-cyan" : "text-brand-orange"
                }`}
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href="/#contatti"
        className={`inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
          isCyan
            ? "border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan hover:text-white"
            : "border-brand-orange/30 text-brand-orange hover:bg-brand-orange hover:text-white"
        }`}
      >
        <span>Richiedi Servizio</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

