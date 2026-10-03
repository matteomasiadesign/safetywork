import Footer from "@/components/layout/Footer";
import { getFeaturedCourseLinks } from "@/components/layout/featuredLinks";

/** Footer con i corsi in evidenza letti da Supabase. */
export default async function SiteFooter() {
  const courseLinks = await getFeaturedCourseLinks();
  return <Footer courseLinks={courseLinks} />;
}
