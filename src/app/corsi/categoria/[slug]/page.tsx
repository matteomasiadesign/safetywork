import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CourseListing from "@/components/courses/CourseListing";
import { getPublishedCourses } from "@/lib/data/catalog";
import { getSiteContent } from "@/lib/data/content";
import { COMPANY_CONFIG } from "@/config/company";

interface PageProps {
  params: { slug: string };
}

export const revalidate = 60; // ISR ogni 60 secondi (e subito dopo ogni modifica dall'admin)

export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  return Array.from(new Set(courses.map((course) => course.category.slug))).map((slug) => ({ slug }));
}

/** Corsi pubblicati della categoria; null se la categoria non esiste o non ha corsi. */
async function getCategoryCourses(slug: string) {
  const courses = (await getPublishedCourses()).filter((course) => course.category.slug === slug);
  return courses.length > 0 ? { category: courses[0].category, courses } : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const found = await getCategoryCourses(params.slug);
  if (!found) return { title: `Categoria non trovata | ${COMPANY_CONFIG.name}` };

  return {
    title: `${found.category.name}: corsi di formazione | ${COMPANY_CONFIG.name}`,
    description: `Tutti i corsi di formazione della categoria ${found.category.name}: programma, date e sedi.`,
  };
}

export default async function CategoryCoursesPage({ params }: PageProps) {
  const [found, content] = await Promise.all([getCategoryCourses(params.slug), getSiteContent()]);
  if (!found) notFound();

  return (
    <CourseListing
      eyebrow="Categoria"
      title={found.category.name}
      description="Tutti i corsi di questa categoria, nell’ordine scelto da noi."
      courses={found.courses}
      fallbackImage={content["courses.fallback_image"]}
      emptyMessage="Nessun corso in questa categoria."
    />
  );
}
