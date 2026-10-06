import React from "react";
import { ArrowRight, Check, Phone } from "lucide-react";
import RichText from "@/components/ui/RichText";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { companyContacts, whatsappNumber } from "@/lib/content/format";
import type { ContentSlice } from "@/lib/content/schema";

const actionBase =
  "group inline-flex min-h-14 w-full items-center justify-between gap-3 rounded-full py-1.5 pl-6 pr-1.5 text-sm font-bold transition-colors sm:w-auto sm:justify-start sm:gap-4";
const actionIcon = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full";

/** Sezione dopo i corsi: non rimanda a nessuna pagina, solo a WhatsApp, chiamata e modulo contatti della home. */
export default function EventsSection({ content }: { content: ContentSlice<"home.events." | "company."> }) {
  const contacts = companyContacts(content);
  const whatsappHref = `https://wa.me/${whatsappNumber(contacts.phone)}?text=${encodeURIComponent(content["home.events.whatsapp_message"])}`;
  const points = [content["home.events.point1"], content["home.events.point2"], content["home.events.point3"]].filter((p) => p.trim());

  return (
    <section
      id="eventi"
      className="relative flex min-h-[34rem] items-end overflow-hidden border-t border-slate-800 bg-slate-950 py-20 text-white sm:min-h-[40rem] sm:py-28"
    >
      {/* Foto a piena sezione con velature: il testo resta leggibile anche su immagini chiare */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={content["home.events.image"]}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-200 sm:text-xs">
            <span className="h-px w-8 shrink-0 bg-[#df0000]" />
            {content["home.events.badge"]}
          </div>

          <h2 className="mt-5 text-balance font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.04] tracking-[-0.03em] drop-shadow-md">
            <RichText text={content["home.events.title"]} highlight="text-[#ff5a52]" />
          </h2>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-slate-200 sm:text-lg">
            <RichText text={content["home.events.subtitle"]} />
          </p>

          {points.length > 0 && (
            <ul className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {points.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm font-semibold text-white">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#008e97]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionBase} bg-[#25d366] text-slate-950 hover:bg-[#1ebe5b]`}
            >
              <span>{content["home.events.cta_whatsapp"]}</span>
              <span className={`${actionIcon} bg-slate-950/15`}>
                <WhatsAppIcon className="h-5 w-5" />
              </span>
            </a>

            <a href={contacts.phoneHref} className={`${actionBase} bg-white text-slate-900 hover:bg-slate-100`}>
              <span>{content["home.events.cta_call"]}</span>
              <span className={`${actionIcon} bg-slate-900/10`}>
                <Phone className="h-[18px] w-[18px]" />
              </span>
            </a>

            <a href="#contatti" className={`${actionBase} bg-[#df0000] text-white hover:bg-[#c40000]`}>
              <span>{content["home.events.cta_form"]}</span>
              <span className={`${actionIcon} bg-white/20`}>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
