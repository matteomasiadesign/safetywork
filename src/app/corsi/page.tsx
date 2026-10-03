import type { Metadata } from "next";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CoursesCatalog from "@/components/courses/CoursesCatalog";
import { getPublishedCourses } from "@/lib/data/catalog";
import { COMPANY_CONFIG } from "@/config/company";

export const revalidate = 60; // ISR ogni 60 secondi (e subito dopo ogni modifica dall'admin)

export const metadata: Metadata = {
  title: `Catalogo Corsi di Formazione | ${COMPANY_CONFIG.name}`,
  description:
    "Corsi di formazione sulla sicurezza sul lavoro D.Lgs. 81/08: RSPP, RLS, antincendio, primo soccorso e attrezzature. Attestati validi su tutto il territorio nazionale.",
};

export default async function CoursesPage() {
  // Se Supabase non risponde l'errore sale a app/error.tsx: nessun dato di ripiego.
  const courses = await getPublishedCourses();

  return (
    <div className="flex flex-col min-h-screen bg-white bg-tech-blueprint-slate text-slate-900">
      <SiteHeader />
      <CoursesCatalog courses={courses} />
      <SiteFooter />
    </div>
  );
}
