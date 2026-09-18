import React, { useState, useMemo } from "react";
import { Course } from "@/lib/types/database";
import CourseCard from "@/components/ui/CourseCard";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

interface CoursesSectionProps {
  initialCourses: Course[];
  isFromDb?: boolean;
}

export default function CoursesSection({
  initialCourses,
}: CoursesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tutti");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialCourses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["Tutti", ...Array.from(set)];
  }, [initialCourses]);

  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const matchesCategory =
        selectedCategory === "Tutti" || course.category === selectedCategory;
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.short_description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [initialCourses, selectedCategory, searchQuery]);

  return (
    <section id="corsi" className="py-24 sm:py-32 bg-[#008e97] text-white relative overflow-hidden">
      {/* Background Decorative Tech Elements */}
      <div className="absolute inset-0 bg-tech-grid-dark opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Formazione Certificata D.Lgs. 81/08</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              I Nostri Percorsi Formativi
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
              Corsi conformi agli Accordi Stato-Regioni con rilascio immediato di attestati con validità legale su tutto il territorio nazionale.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-80 relative">
            <Search className="w-4 h-4 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca corso per parola chiave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-[#008e97]/90 hover:bg-[#008e97] border border-[#008e97] focus:border-brand-cyan rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 mr-2 py-1 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Filtra per:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-brand-cyan text-white shadow-tech-cyan scale-105"
                  : "bg-[#008e97]/80 hover:bg-[#008e97] text-slate-400 hover:text-white border border-[#008e97]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#008e97]/50 rounded-2xl border border-[#008e97]">
            <p className="text-base text-slate-600">
              Nessun corso corrisponde ai criteri di ricerca selezionati.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("Tutti");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-brand-cyan text-white text-xs font-bold hover:bg-brand-cyan-hover transition-colors"
            >
              Azzera filtri di ricerca
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
