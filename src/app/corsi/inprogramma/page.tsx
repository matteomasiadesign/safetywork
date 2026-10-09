import type { Metadata } from "next";
import CourseListing from "@/components/courses/CourseListing";
import { getPublishedCourses } from "@/lib/data/catalog";
import { getSiteContent } from "@/lib/data/content";
import { scheduledCourses } from "@/lib/courses/listing";
import { COMPANY_CONFIG } from "@/config/company";

export const revalidate = 60; // ISR ogni 60 secondi (e subito dopo ogni modifica dall'admin)

export const metadata: Metadata = {
  title: `Corsi in programma | ${COMPANY_CONFIG.name}`,
  description: "Tutti i corsi di formazione sulla sicurezza sul lavoro con date e sedi già in programma.",
};

export default async function ScheduledCoursesPage() {
  const [courses, content] = await Promise.all([getPublishedCourses(), getSiteContent()]);

  return (
    <CourseListing
      eyebrow="Date confermate"
      title="Corsi in programma"
      description="I corsi con almeno una data in calendario. Scegli una scheda per vedere programma, sedi e inviare la richiesta di iscrizione."
      courses={scheduledCourses(courses)}
      fallbackImage={content["courses.fallback_image"]}
      emptyMessage="Al momento non ci sono corsi con date in programma. Consulta il catalogo completo o contattaci per le prossime date."
    />
  );
}
