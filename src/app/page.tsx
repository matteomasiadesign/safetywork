import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Preloader from "@/components/ui/Preloader";
import HeroSection, { type HeroNextDate } from "@/components/sections/HeroSection";
import { editionDayMonth, modeLabel, normalizeMode, upcomingEditions } from "@/lib/courses/format";
import TrendingCoursesSection from "@/components/sections/TrendingCoursesSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ContactSection from "@/components/sections/ContactSection";
import MapSection from "@/components/sections/MapSection";
import { getPublishedCourses, getPublishedServices } from "@/lib/data/catalog";
import { getSiteContent } from "@/lib/data/content";
import { pickContent } from "@/lib/content/schema";

export const revalidate = 60; // ISR ogni 60 secondi (e subito dopo ogni modifica dall'admin)

export default async function HomePage() {
  // Se Supabase non risponde l'errore sale a app/error.tsx: nessun dato di ripiego.
  const [courses, services, content] = await Promise.all([
    getPublishedCourses(),
    getPublishedServices(),
    getSiteContent(),
  ]);

  // Prossime date: la prima edizione in programma di ogni corso aperto alle iscrizioni.
  const nextDates: HeroNextDate[] = courses
    .filter((c) => c.is_open_for_enrollment)
    .flatMap((course) => {
      const edition = upcomingEditions(course.editions)[0];
      if (!edition) return [];
      const mode = normalizeMode(course.mode);
      const place = mode === "online" ? "Online" : edition.location || modeLabel(course.mode);
      return [{ id: edition.id, slug: course.slug, title: course.title, place, start: edition.start_date, ...editionDayMonth(edition) }];
    })
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 3)
    .map(({ start: _start, ...rest }) => rest);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Preloader imageSrc={content["home.hero.image"]} />
      <SiteHeader />
      <main className="flex-grow">
        {/* 1. Hero */}
        <HeroSection content={pickContent(content, "home.hero.")} nextDates={nextDates} />

        {/* 2. Corsi del momento */}
        <TrendingCoursesSection courses={courses} content={content} />

        {/* 3. Chi siamo */}
        <AboutSection content={content} />

        {/* 4. Servizi di sicurezza */}
        <ServicesSection services={services} content={content} />

        {/* 5. Contatti */}
        <ContactSection content={pickContent(content, "home.contact.", "company.")} />

        {/* 6. Mappa della sede operativa */}
        <MapSection content={content} />
      </main>
      <SiteFooter />
    </div>
  );
}
