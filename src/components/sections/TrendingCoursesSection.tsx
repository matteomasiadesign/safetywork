import React from "react";
import Link from "@/components/ui/Link";
import { Course } from "@/lib/types/database";
import CourseCard from "@/components/ui/CourseCard";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";


interface TrendingCoursesSectionProps {
  courses: Course[];
}

export default function TrendingCoursesSection({
  courses,
}: TrendingCoursesSectionProps) {
  // Mostra SOLO i corsi a cui è già possibile iscriversi
  const openCourses = courses.filter((c) => c.is_open_for_enrollment);

  return (
    <section
      id="corsi-del-momento"
      className="py-24 bg-tech-blueprint-slate text-slate-900 relative overflow-hidden border-b border-slate-200"
    >
      {/* Corner crosshairs for technical precision framing */}
      <div className="hidden lg:flex justify-between items-center max-w-7xl w-full mx-auto px-6 absolute top-6 left-0 right-0 pointer-events-none">
        
        
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Intestazione Stondata Pulita su Sfondo Chiaro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#fdf2f2] border border-[#df0000]/30 text-[#df0000] text-xs font-bold uppercase tracking-wider mb-4 rounded-full shadow-xs">
              <span className="w-2 h-2 bg-[#df0000] rounded-full animate-pulse" />
              <span>Scopri i corsi disponibili</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
              Corsi del <span className="text-slate-900">Momento</span>
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed font-normal text-pretty">
              Sessioni formative confermate con posti disponibili in tempo reale. Seleziona una scheda per consultare i moduli didattici e bloccare direttamente la tua partecipazione.
            </p>
          </div>

          {/* Quick Header CTA */}
          <div className="hidden md:block">
            <Link
              to="/corsi"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-white hover:bg-white text-slate-900 hover:text-[#008e97] border border-slate-200 hover:border-[#008e97]/40 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs transition-all duration-200 group whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 text-slate-900 shrink-0" />
              <span>Tutti i corsi ({courses.length})</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Griglia dei Corsi del Momento con Card Bianche Stondate */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {openCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Engineering Dimension Guide */}
        <div className="mt-14 max-w-2xl mx-auto">
          
        </div>

        {/* GRANDE PULSANTE CENTRATO "VEDI TUTTI I CORSI" */}
        <div className="mt-6 flex flex-col items-center justify-center text-center">
          <Link
            to="/corsi"
            className="inline-flex items-center justify-center gap-3.5 px-10 sm:px-12 py-4.5 sm:py-5 bg-[#df0000] hover:bg-[#b80000] text-white text-base sm:text-lg font-bold rounded-full shadow-lg shadow-[#df0000]/25 hover:shadow-xl hover:shadow-[#df0000]/35 transition-all duration-300 transform hover:-translate-y-1 group whitespace-nowrap"
          >
            <BookOpen className="w-5 h-5 text-white shrink-0" />
            <span>Vedi tutti i corsi</span>
            <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-[#df0000] flex items-center justify-center transition-all duration-300 shrink-0">
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <p className="mt-4 text-xs sm:text-sm text-slate-600 font-medium text-balance">
            Esplora l'intero catalogo formativo accreditato <span className="whitespace-nowrap">D.Lgs. 81/08</span> ({courses.length} percorsi disponibili con ricerca e filtri)
          </p>
        </div>
      </div>
    </section>
  );
}
