import React from "react";
import Link from "@/components/ui/Link";
import { Clock, Lock, MapPin, ArrowRight, Monitor, Layers, CalendarDays } from "lucide-react";
import { Course } from "@/lib/types/database";
import {
  editionDayMonth,
  formatEditionDates,
  modeLabel,
  normalizeMode,
  upcomingEditions,
} from "@/lib/courses/format";

interface CourseCardProps {
  course: Course;
  /** "wide": immagine a sinistra e testo a destra (da md in su). Serve quando c'è un solo corso. */
  variant?: "stack" | "wide";
  /** Foto usata se il corso non ne ha una propria (modificabile da /admin). */
  fallbackImage: string;
}

export default function CourseCard({ course, variant = "stack", fallbackImage }: CourseCardProps) {
  const mode = normalizeMode(course.mode);
  const ModeIcon = mode === "online" ? Monitor : mode === "misto" ? Layers : MapPin;
  const editions = upcomingEditions(course.editions);
  const next = editions[0];
  const moreDates = editions.length - 1;
  const wide = variant === "wide";

  const place = mode === "online" ? "Online" : next?.location || "Sede da definire";
  const PlaceIcon = mode === "online" ? Monitor : MapPin;

  return (
    <Link
      to={`/corsi/${course.slug}`}
      className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-tech-card transition-all duration-300 hover:-translate-y-1 hover:border-[#008e97]/50 hover:shadow-card-hover ${
        wide ? "md:flex-row" : ""
      }`}
    >
      {/* Immagine con le due etichette di contesto: categoria (cosa) e modalità (come) */}
      <div className={`relative aspect-[16/10] shrink-0 overflow-hidden bg-slate-200 ${wide ? "md:aspect-auto md:w-5/12" : ""}`}>
        <img
          src={course.image_url || fallbackImage}
          alt={course.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/60 to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span title={course.category.name} className="min-w-0 truncate rounded-md bg-[#008e97] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            {course.category.name}
          </span>
          {course.is_open_for_enrollment ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur">
              <ModeIcon className="h-3 w-3 text-[#008e97]" />
              {modeLabel(course.mode)}
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur">
              <Lock className="h-3 w-3 text-[#f58220]" />
              Iscrizioni chiuse
            </span>
          )}
        </div>
      </div>

      {/* Contenuto: titolo → descrizione → quando/dove → durata e azione */}
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <h3 className={`font-display font-bold ${wide ? "text-[1.4rem] md:text-3xl" : "text-[1.4rem]"} leading-[1.15] tracking-tight text-slate-900 transition-colors text-balance break-words line-clamp-3 group-hover:text-[#008e97]`}>
          {course.title}
        </h3>

        {course.short_description && (
          <p className="mt-2.5 text-sm leading-relaxed text-slate-600 line-clamp-2">{course.short_description}</p>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white">
              {next ? (
                <>
                  <span className="font-display text-2xl font-bold leading-none text-slate-900">
                    {editionDayMonth(next).day}
                  </span>
                  <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#008e97]">
                    {editionDayMonth(next).month}
                  </span>
                </>
              ) : (
                <CalendarDays className="h-6 w-6 text-slate-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {next ? (
                <>
                  <div className="text-sm font-semibold leading-snug text-slate-900 line-clamp-2">
                    {formatEditionDates(next, { short: true })}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <PlaceIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate" title={place}>
                      {place}
                    </span>
                  </div>
                  {moreDates > 0 && (
                    <div className="mt-1 text-[11px] font-semibold text-[#008e97]">
                      +{moreDates} {moreDates === 1 ? "altra data" : "altre date"}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold text-slate-700">Date da definire</div>
                  <div className="mt-0.5 text-xs text-slate-500">Contattaci per le prossime edizioni</div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Clock className="h-3.5 w-3.5 text-[#f58220]" />
              {course.duration_hours} ore
            </span>
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-bold ${
                course.is_open_for_enrollment ? "text-[#df0000]" : "text-slate-700"
              }`}
            >
              {course.is_open_for_enrollment ? "Iscriviti" : "Scopri il corso"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
