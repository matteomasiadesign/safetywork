import React from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Link from "@/components/ui/Link";
import CourseCard from "@/components/ui/CourseCard";
import type { Course } from "@/lib/types/database";
import { ArrowLeft, BookOpen } from "lucide-react";

interface CourseListingProps {
  eyebrow: string;
  title: string;
  description: string;
  courses: Course[];
  fallbackImage: string;
  emptyMessage: string;
}

/** Pagina con l'elenco completo di un gruppo di corsi (in programma, o di una categoria). */
export default function CourseListing({ eyebrow, title, description, courses, fallbackImage, emptyMessage }: CourseListingProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white bg-tech-blueprint-slate text-slate-900">
      <SiteHeader />

      <main className="flex-grow pt-[84px] pb-24">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-6 sm:px-6 lg:px-8">
          <Link
            to="/corsi"
            className="inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#008e97]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Catalogo corsi</span>
          </Link>

          <div className="mt-3 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#df0000]/20 bg-[#fdf2f2] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#df0000] shadow-xs">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{eyebrow}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
            </div>
            <span className="font-mono text-xs text-slate-500">
              {courses.length} {courses.length === 1 ? "corso" : "corsi"}
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} fallbackImage={fallbackImage} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-600 shadow-xs">
              {emptyMessage}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
