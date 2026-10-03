"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import CourseCard from "@/components/ui/CourseCard";
import Link from "@/components/ui/Link";
import type { Course } from "@/lib/types/database";
import { MODE_OPTIONS, normalizeMode, upcomingLocations, type CourseMode } from "@/lib/courses/format";
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  Sparkles,
  BookOpen,
  PhoneCall,
  X,
  ShieldCheck,
  ChevronDown,
  Check,
  Flame,
  RotateCcw,
} from "lucide-react";

export default function CoursesCatalog({ courses }: { courses: Course[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tutti");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<CourseMode | "tutte">("tutte");

  // Dropdown states
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Solo le categorie che hanno almeno un corso pubblicato
  const categories = useMemo(() => {
    const byId = new Map<string, Course["category"]>();
    courses.forEach((c) => byId.set(c.category.id, c.category));
    const sorted = Array.from(byId.values()).sort(
      (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "it")
    );
    return ["Tutti", ...sorted.map((c) => c.name)];
  }, [courses]);

  const recommendedCourses = useMemo(() => {
    return courses.filter((c) => c.is_featured || c.is_open_for_enrollment).slice(0, 4);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === "Tutti" || course.category.name === selectedCategory;
      const matchesMode = selectedMode === "tutte" || normalizeMode(course.mode) === selectedMode;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        course.title.toLowerCase().includes(q) ||
        course.short_description.toLowerCase().includes(q) ||
        course.normative_ref.toLowerCase().includes(q) ||
        upcomingLocations(course.editions).some((place) => place.toLowerCase().includes(q));

      return matchesCategory && matchesMode && matchesSearch;
    });
  }, [courses, selectedCategory, selectedMode, searchQuery]);

  return (
    <>
      <main className="flex-grow pt-[84px] pb-24">
        {/* Sticky Search & Filter Toolbar with Glassmorphism */}
        <div className="sticky top-[84px] z-30 bg-white/75 hover:bg-white backdrop-blur-md border-b border-slate-200/80 py-3 shadow-xs transition-all duration-300 group/toolbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              
              {/* Main Prominent Search Bar */}
              <div ref={searchContainerRef} className="relative flex-1 w-full">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Cerca corso per titolo, normativa o città (es. RSPP, Antincendio, Sassari)..."
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 bg-white/60 hover:bg-white focus:bg-white backdrop-blur-sm border border-slate-200/80 hover:border-slate-300 focus:border-[#008e97] rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008e97]/20 shadow-xs transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Cancella ricerca"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Quick Suggestions Dropdown */}
                {isSearchFocused && !searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2">
                      <Flame className="w-3.5 h-3.5 text-[#df0000]" />
                      <span>Ricerche Frequenti & Consigliati</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {recommendedCourses.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSearchQuery(c.title);
                            setIsSearchFocused(false);
                          }}
                          className="text-left px-3 py-2 rounded-lg hover:bg-[#e6f6f7] transition-colors group flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-800 group-hover:text-[#008e97] line-clamp-1">
                              {c.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {c.normative_ref}
                            </div>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {c.duration_hours}h
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Dropdowns for Categories and Filters/Recommended */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                {/* 1. Category Dropdown Menu */}
                <div ref={categoryDropdownRef} className="relative flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCategoryOpen(!isCategoryOpen);
                    }}
                    className={`w-full sm:w-auto inline-flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 shadow-xs ${
                      selectedCategory !== "Tutti"
                        ? "bg-[#008e97] text-white border-[#008e97]"
                        : "bg-white/70 hover:bg-white backdrop-blur-sm border-slate-200/80 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {selectedCategory === "Tutti" ? "Tutte le Categorie" : selectedCategory}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Popover */}
                  {isCategoryOpen && (
                    <div className="absolute right-0 sm:left-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                        <span>Filtra per Categoria</span>
                        <span className="font-mono text-[10px]">{categories.length - 1} categorie</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto py-1">
                        {categories.map((cat) => {
                          const isSelected = selectedCategory === cat;
                          const count = cat === "Tutti" 
                            ? courses.length 
                            : courses.filter(c => c.category.name === cat).length;

                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat);
                                setIsCategoryOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-[#e6f6f7] text-[#008e97] font-semibold"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{cat}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                  isSelected ? "bg-[#008e97] text-white" : "bg-slate-100 text-slate-400"
                                }`}>
                                  {count}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#008e97]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Reset Filters button if any filter is active */}
                {(selectedCategory !== "Tutti" || selectedMode !== "tutte" || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("Tutti");
                      setSelectedMode("tutte");
                      setSearchQuery("");
                    }}
                    className="p-2.5 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-white text-slate-500 hover:text-[#df0000] hover:border-[#df0000]/30 transition-all shadow-xs shrink-0"
                    title="Azzera filtri"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Hero Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdf2f2] border border-[#df0000]/20 text-[#df0000] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Formazione Accreditata D.Lgs. 81/08</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Catalogo Corsi di Formazione
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                Corsi in presenza, online o misti, con date e sedi aggiornate. Attestati con validità legale su tutto il territorio nazionale.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {([{ value: "tutte", label: "Tutte le modalità" }, ...MODE_OPTIONS] as { value: CourseMode | "tutte"; label: string }[]).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedMode(option.value)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      selectedMode === option.value
                        ? "bg-[#008e97] text-white border-[#008e97]"
                        : "bg-white text-slate-700 border-slate-200 hover:border-[#008e97] hover:text-[#008e97]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                {filteredCourses.length} di {courses.length} corsi visualizzati
              </span>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {courses.length === 0 ? "Il catalogo sarà online a breve" : "Nessun corso trovato"}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {courses.length === 0
                  ? "Stiamo aggiornando l'offerta formativa. Contattaci per conoscere le prossime date."
                  : "Nessun corso corrisponde ai filtri scelti. Prova a cambiare categoria, modalità o ricerca."}
              </p>
              {courses.length > 0 && (<button
                type="button"
                onClick={() => {
                  setSelectedCategory("Tutti");
                  setSelectedMode("tutte");
                  setSearchQuery("");
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#008e97] text-white text-xs font-bold hover:bg-[#00777f] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mostra tutti i corsi</span>
              </button>)}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

