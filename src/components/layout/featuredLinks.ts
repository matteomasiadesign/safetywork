import { getPublishedCourses } from "@/lib/data/catalog";

const MAX_LINKS = 5;

/**
 * Link ai corsi in evidenza per menu e footer.
 * Se la lettura fallisce l'elenco resta vuoto (nessun link inventato): l'errore
 * vero viene mostrato dal contenuto principale della pagina.
 */
export async function getFeaturedCourseLinks(): Promise<{ name: string; href: string }[]> {
  try {
    const courses = await getPublishedCourses();
    const featured = courses.filter((c) => c.is_featured);
    return (featured.length > 0 ? featured : courses)
      .slice(0, MAX_LINKS)
      .map((c) => ({ name: c.title, href: `/corsi/${c.slug}` }));
  } catch {
    return [];
  }
}
