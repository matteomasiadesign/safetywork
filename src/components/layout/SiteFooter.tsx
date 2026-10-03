import Footer from "@/components/layout/Footer";
import { getFeaturedCourseLinks } from "@/components/layout/featuredLinks";
import { getSiteContent } from "@/lib/data/content";
import { companyContacts } from "@/lib/content/format";

/** Footer con i corsi in evidenza e i recapiti letti da Supabase. */
export default async function SiteFooter() {
  const [courseLinks, content] = await Promise.all([getFeaturedCourseLinks(), getSiteContent()]);
  return <Footer courseLinks={courseLinks} contacts={companyContacts(content)} />;
}
