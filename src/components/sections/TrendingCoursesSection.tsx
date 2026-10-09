import React from "react";
import { Course } from "@/lib/types/database";
import CourseCard from "@/components/ui/CourseCard";
import SeeAllLink from "@/components/courses/SeeAllLink";
import { PREVIEW_COUNT, scheduledCourses } from "@/lib/courses/listing";
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

/**
 * Anteprima in home: al massimo 4 corsi realmente in programma (con almeno una data non conclusa).
 * Se in admin ne sono stati messi "In evidenza", si mostrano quelli; altrimenti i 4 con la data più vicina.
 */
function pickPreviewCourses(courses: Course[]): Course[] {
  const scheduled = scheduledCourses(courses);
  const featured = scheduled.filter((course) => course.is_featured);
  return (featured.length > 0 ? featured : scheduled).slice(0, PREVIEW_COUNT);
}

export default function TrendingCoursesSection({ courses, content }: TrendingCoursesSectionProps) {
  const openCourses = pickPreviewCourses(courses);
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
            Al momento non ci sono corsi con date in programma. Consulta il catalogo completo o contattaci per le
            prossime date.
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <SeeAllLink to="/corsi">Vedi tutti i corsi</SeeAllLink>
        </div>
      </div>
    </section>
  );
}
