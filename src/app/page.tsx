import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import TrendingCoursesSection from "@/components/sections/TrendingCoursesSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ContactSection from "@/components/sections/ContactSection";
import MapSection from "@/components/sections/MapSection";
import { getCourses } from "@/lib/supabase/server";

export const revalidate = 60; // ISR ogni 60 secondi

export default async function HomePage() {
  const { courses } = await getCourses();

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="flex-grow">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Corsi del momento */}
        <TrendingCoursesSection courses={courses} />

        {/* 3. Chi siamo */}
        <AboutSection />

        {/* 4. Servizi di sicurezza */}
        <ServicesSection />

        {/* 5. Contatti */}
        <ContactSection />

        {/* 6. Mappa della sede operativa */}
        <MapSection />
      </main>
      <Footer />
    </div>
  );
}
