import Navbar from "@/components/layout/Navbar";
import { getFeaturedCourseLinks } from "@/components/layout/featuredLinks";

/** Navbar con i corsi in evidenza letti da Supabase. */
export default async function SiteHeader() {
  const courseLinks = await getFeaturedCourseLinks();
  return <Navbar courseLinks={courseLinks} />;
}
