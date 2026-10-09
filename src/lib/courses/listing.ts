import type { Course } from "@/lib/types/database";
import { upcomingEditions } from "@/lib/courses/format";

/** Quanti corsi mostrare in anteprima prima del pulsante "vedi tutti". */
export const PREVIEW_COUNT = 4;

/** Slug che non si possono dare a un corso: sono pagine fisse sotto /corsi. */
export const RESERVED_COURSE_SLUGS = ["inprogramma", "categoria"];

export const IN_PROGRAMMA_HREF = "/corsi/inprogramma";
export const categoryHref = (slug: string) => `/corsi/categoria/${slug}`;

/** Data di inizio della prima edizione non ancora conclusa, oppure null. */
const nextStart = (course: Course): string | null => upcomingEditions(course.editions)[0]?.start_date ?? null;

/** Corsi realmente in programma (almeno una data non conclusa), dalla data più vicina. */
export function scheduledCourses(courses: Course[]): Course[] {
  return courses
    .map((course) => ({ course, start: nextStart(course) }))
    .filter((entry): entry is { course: Course; start: string } => entry.start !== null)
    .sort((a, b) => a.start.localeCompare(b.start))
    .map((entry) => entry.course);
}

/** Prima i corsi con una data in programma (dalla più vicina), poi gli altri nell'ordine ricevuto. */
export function scheduledFirst(courses: Course[]): Course[] {
  const scheduled = scheduledCourses(courses);
  const ids = new Set(scheduled.map((course) => course.id));
  return [...scheduled, ...courses.filter((course) => !ids.has(course.id))];
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
  return Array.from(groups.values())
    .sort((a, b) => a.category.sort_order - b.category.sort_order || a.category.name.localeCompare(b.category.name, "it"))
    .map((group) => ({ ...group, courses: scheduledFirst(group.courses) }));
}
