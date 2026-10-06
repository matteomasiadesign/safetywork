import Navbar from "@/components/layout/Navbar";
import { getFeaturedCourseLinks } from "@/components/layout/featuredLinks";
import { getSiteContent } from "@/lib/data/content";
import { companyContacts } from "@/lib/content/format";

/** Navbar con i corsi in evidenza e i recapiti letti da Supabase. */
export default async function SiteHeader() {
  const [courseLinks, content] = await Promise.all([getFeaturedCourseLinks(), getSiteContent()]);
  return <Navbar courseLinks={courseLinks} contacts={companyContacts(content)} logoSrc={content["brand.logo"]} />;
}
