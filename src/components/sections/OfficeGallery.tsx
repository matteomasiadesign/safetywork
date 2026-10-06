import React from "react";
import { Building2 } from "lucide-react";
import RichText from "@/components/ui/RichText";
import type { ContentSlice } from "@/lib/content/schema";

/**
 * Posizione di ogni foto nella griglia, in base a quante ne sono state caricate.
 * Le classi sono scritte per intero perché Tailwind le trova solo così.
 * Mobile: 2 colonne; da lg: 4 colonne con righe alte uguali.
 */
const LAYOUTS: Record<number, string[]> = {
  1: ["col-span-2 row-span-2 lg:col-span-4"],
  2: ["col-span-2 row-span-2 lg:col-span-2", "col-span-2 row-span-2 lg:col-span-2"],
  3: ["col-span-2 row-span-2", "col-span-1 lg:col-span-2", "col-span-1 lg:col-span-2"],
  4: ["col-span-2 row-span-2", "col-span-2", "col-span-1", "col-span-1"],
  5: ["col-span-2 row-span-2", "col-span-1", "col-span-1", "col-span-1", "col-span-1"],
};

/** Bento grid con le foto dell'ufficio (fino a 5). Senza foto non mostra nulla. */
export default function OfficeGallery({ content }: { content: ContentSlice<"about.gallery."> }) {
  const photos = ([1, 2, 3, 4, 5] as const)
    .map((n) => content[`about.gallery.photo${n}`])
    .filter((src) => src.trim());

  if (photos.length === 0) return null;

  const layout = LAYOUTS[photos.length];
  const badge = content["about.gallery.badge"].trim();
  const subtitle = content["about.gallery.subtitle"].trim();

  return (
    <section id="ufficio" className="border-t border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          {badge && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#008e97]/20 bg-[#e6f6f7] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#008e97]">
              <Building2 className="h-3.5 w-3.5" />
              <span>{badge}</span>
            </div>
          )}
          <h2 className="text-balance text-3xl font-extrabold text-slate-900 sm:text-4xl">
            <RichText text={content["about.gallery.title"]} highlight="text-[#008e97]" />
          </h2>
          {subtitle && <p className="mt-4 text-lg text-slate-600">{subtitle}</p>}
        </div>

        <div className="grid auto-rows-[9.5rem] grid-cols-2 gap-3 sm:auto-rows-[13rem] sm:gap-4 lg:auto-rows-[15rem] lg:grid-cols-4">
          {photos.map((src, i) => (
            <div key={`${i}-${src}`} className={`relative overflow-hidden rounded-2xl bg-slate-200 ${layout[i]}`}>
              <img
                src={src}
                alt={`Il nostro ufficio, foto ${i + 1}`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
