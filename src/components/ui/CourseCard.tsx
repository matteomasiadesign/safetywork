import React from "react";
import Link from "@/components/ui/Link";
import { Clock, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Course } from "@/lib/types/database";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80";

  return (
    <Link 
      to={`/corsi/${course.slug}`}
      className="group relative block w-full h-[440px] rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500"
    >
      {/* Immagine di Sfondo */}
      <img
        src={course.image_url || fallbackImage}
        alt={course.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Overlay Sfumato Inferiore (Sempre visibile per leggere il titolo) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-40" />

      {/* Overlay Scuro su Hover (per oscurare tutta la carta) */}
      <div className="absolute inset-0 bg-slate-950/85 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]" />

      {/* Contenitore Testi e Bottoni */}
      <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end z-20">
        
        {/* Info Sempre Visibili: Categoria, Luogo, Durata, Sessione, Titolo */}
        <div className="transform transition-transform duration-500 group-hover:-translate-y-1">
          
          {/* Unico gruppo ordinato di pills (impossibile che si sovrappongano) */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-[#008e97] text-white rounded-lg shadow-xs shrink-0 whitespace-nowrap">
              {course.category}
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shrink-0 whitespace-nowrap">
              <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
              <span>{course.location ? course.location : (course.mode.toLowerCase().includes("aula") ? "In Presenza" : "In Sede / Online")}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shrink-0 whitespace-nowrap">
              <Clock className="w-3 h-3 text-[#008e97] shrink-0" />
              <span>{course.duration_hours} Ore</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shrink-0 whitespace-nowrap">
              <Calendar className="w-3 h-3 text-[#f58220] shrink-0" />
              <span>{course.period || "Prossimamente"}</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-white leading-snug tracking-tight drop-shadow-md line-clamp-3">
            {course.title}
          </h3>
        </div>

        {/* Blocco Nascosto: Descrizione e Pulsante (Appare su Hover) */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
          <div className="overflow-hidden">
            <div className="pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex flex-col gap-4">
              <p className="text-xs text-slate-300 line-clamp-2 font-normal leading-relaxed">
                {course.short_description}
              </p>
              
              <div className="inline-flex items-center justify-between w-full px-4 py-3 bg-[#df0000] hover:bg-[#df0000]/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg">
                <span>Iscriviti al corso</span>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
