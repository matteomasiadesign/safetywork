import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import HeroSection from "@/components/sections/HeroSection";
import TrendingCoursesSection from "@/components/sections/TrendingCoursesSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ContactSection from "@/components/sections/ContactSection";
import MapSection from "@/components/sections/MapSection";
import { getPublishedCourses, getPublishedServices } from "@/lib/data/catalog";

export const revalidate = 60; // ISR ogni 60 secondi (e subito dopo ogni modifica dall'admin)

export default async function HomePage() {
  // Se Supabase non risponde l'errore sale a app/error.tsx: nessun dato di ripiego.
  const [courses, services] = await Promise.all([getPublishedCourses(), getPublishedServices()]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <SiteHeader />
      <main className="flex-grow">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Corsi del momento */}
        <TrendingCoursesSection courses={courses} />

        {/* 3. Chi siamo */}
        <AboutSection />

        {/* 4. Servizi di sicurezza */}
        <ServicesSection services={services} />

        {/* 5. Contatti */}
        <ContactSection />

        {/* 6. Mappa della sede operativa */}
        <MapSection />
      </main>
      <SiteFooter />
    </div>
  );
}
