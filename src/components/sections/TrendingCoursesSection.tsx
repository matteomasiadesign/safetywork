import React from "react";
import Link from "@/components/ui/Link";
import { Course } from "@/lib/types/database";
import CourseCard from "@/components/ui/CourseCard";
import { ArrowRight } from "lucide-react";
import RichText from "@/components/ui/RichText";
import type { SiteContent } from "@/lib/content/schema";

interface TrendingCoursesSectionProps {
  courses: Course[];
  content: SiteContent;
}

/** La griglia si adatta a quanti corsi ci sono, così non restano mai buchi o card spropositate. */
function gridClass(count: number): string {
  if (count === 1) return "grid-cols-1 max-w-4xl mx-auto";
  if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto";
  if (count === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  if (count === 4) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
  return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}

export default function TrendingCoursesSection({ courses, content }: TrendingCoursesSectionProps) {
  // Mostra SOLO i corsi a cui è già possibile iscriversi
  const openCourses = courses.filter((c) => c.is_open_for_enrollment);
  const single = openCourses.length === 1;

  return (
    <section
      id="corsi-del-momento"
      className="py-20 sm:py-28 bg-tech-blueprint-slate text-slate-900 relative overflow-hidden border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#fdf2f2] border border-[#df0000]/30 text-[#df0000] text-xs font-bold uppercase tracking-wider mb-4 rounded-full">
              <span className="w-2 h-2 bg-[#df0000] rounded-full animate-pulse" />
              <span>{content["home.courses.badge"]}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.05] text-balance">
              <RichText text={content["home.courses.title"]} />
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed text-pretty">
              {content["home.courses.subtitle"]}
            </p>
          </div>

          <Link
            to="/corsi"
            className="group inline-flex w-fit items-center gap-3 rounded-full bg-slate-900 py-3 pl-6 pr-3 text-sm font-bold text-white transition-colors hover:bg-[#008e97] whitespace-nowrap"
          >
            <span>Tutti i corsi ({courses.length})</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        {openCourses.length > 0 ? (
          <div className={`grid items-stretch gap-6 ${gridClass(openCourses.length)}`}>
            {openCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                variant={single ? "wide" : "stack"}
                fallbackImage={content["courses.fallback_image"]}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">
            Al momento non ci sono corsi con iscrizioni aperte. Consulta il catalogo completo o contattaci per le
            prossime date.
          </div>
        )}

        <p className="mt-10 text-center text-xs sm:text-sm text-slate-600 font-medium text-balance">
          {courses.length} percorsi formativi in catalogo, con ricerca e filtri
        </p>
      </div>
    </section>
  );
}
