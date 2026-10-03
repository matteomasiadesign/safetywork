import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { toServiceItem } from "@/lib/data/serviceMapper";
import { sortEditions } from "@/lib/courses/format";
import type { Course, ServiceItem } from "@/lib/types/database";

/**
 * Lettura del catalogo pubblico (solo contenuti pubblicati).
 * Nessun dato di ripiego: se Supabase non risponde viene sollevato un errore
 * e la pagina mostra la schermata di errore.
 */

const COURSE_SELECT =
  "*, category:categories(id, name, slug, sort_order), editions:course_editions(id, course_id, start_date, end_date, location, notes)";

const toCourse = (row: unknown): Course => {
  const course = row as Course;
  return { ...course, editions: sortEditions(course.editions) };
};

export class CatalogError extends Error {
  constructor(what: string, detail?: string) {
    super(`Impossibile caricare ${what}${detail ? `: ${detail}` : ""}`);
    this.name = "CatalogError";
  }
}

/** Corsi pubblicati: in evidenza per primi, poi i più recenti. */
export const getPublishedCourses = cache(async (): Promise<Course[]> => {
  const { data, error } = await createPublicClient()
    .from("courses")
    .select(COURSE_SELECT)
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new CatalogError("i corsi", error.message);
  return (data ?? []).map(toCourse);
});

/** Scheda di un corso pubblicato, oppure null se lo slug non esiste. */
export const getPublishedCourseBySlug = cache(async (slug: string): Promise<Course | null> => {
  const { data, error } = await createPublicClient()
    .from("courses")
    .select(COURSE_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new CatalogError("il corso", error.message);
  return data ? toCourse(data) : null;
});

export const getPublishedServices = cache(async (): Promise<ServiceItem[]> => {
  const { data, error } = await createPublicClient()
    .from("services")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("code", { ascending: true });

  if (error) throw new CatalogError("i servizi", error.message);
  return (data ?? []).map(toServiceItem);
});
