import type { Course } from "@/lib/types/database";
import { upcomingEditions } from "@/lib/courses/format";

/** Quanti corsi mostrare in anteprima prima del pulsante "vedi tutti". */
export const PREVIEW_COUNT = 4;

/** Slug che non si possono dare a un corso: sono pagine fisse sotto /corsi. */
export const RESERVED_COURSE_SLUGS = ["inprogramma", "categoria"];

export const IN_PROGRAMMA_HREF = "/corsi/inprogramma";
export const categoryHref = (slug: string) => `/corsi/categoria/${slug}`;

/**
 * Corsi realmente in programma (almeno una data non conclusa).
 * L'ordine è quello ricevuto, cioè quello scelto in admin con il drag & drop.
 */
export function scheduledCourses(courses: Course[]): Course[] {
  return courses.filter((course) => upcomingEditions(course.editions).length > 0);
}

export type CategoryGroup = { category: Course["category"]; courses: Course[] };

/** Corsi raggruppati per categoria (nell'ordine scelto in admin); solo le categorie con almeno un corso. */
export function groupByCategory(courses: Course[]): CategoryGroup[] {
  const groups = new Map<string, CategoryGroup>();
  for (const course of courses) {
    const group = groups.get(course.category.id) ?? { category: course.category, courses: [] };
    group.courses.push(course);
    groups.set(course.category.id, group);
  }
  return Array.from(groups.values()).sort(
    (a, b) => a.category.sort_order - b.category.sort_order || a.category.name.localeCompare(b.category.name, "it")
  );
}
