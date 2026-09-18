import { notFound } from "next/navigation";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "@/components/ui/Link";
import CourseBookingForm from "@/components/courses/CourseBookingForm";
import { getCourseBySlug, getCourses } from "@/lib/supabase/server";
import {
  Clock,
  BookOpen,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  Award,
  PhoneCall,
  MapPin,
  Users,
} from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";

interface PageProps {
  params: {
    slug: string;
  };
}

export const revalidate = 60; // ISR ogni 60 secondi

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug);
  if (!course) {
    return {
      title: "Corso non trovato | Safety Work S.r.l.s.",
    };
  }

  return {
    title: `${course.title} | ${COMPANY_CONFIG.name}`,
    description: course.short_description,
    openGraph: {
      title: `${course.title} - Formazione Sicurezza ${course.normative_ref}`,
      description: course.short_description,
      siteName: COMPANY_CONFIG.name,
    },
  };
}

export async function generateStaticParams() {
  const { courses } = await getCourses();
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

export default async function CourseDetailPage({ params }: PageProps) {
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-grow pb-24">
        {/* Top Breadcrumbs & Back link */}
        <div className="bg-white border-b border-slate-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <Link
              href="/corsi"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#008e97] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Torna al catalogo completo corsi</span>
            </Link>

            <span className="text-[11px] font-mono text-slate-400 uppercase">
              {course.category}
            </span>
          </div>
        </div>

        {/* Course Header Banner */}
        <section className="relative bg-slate-950 text-white py-14 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <img
              src={course.image_url || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=80"}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/70" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f6f7]/20 border border-[#008e97]/40 text-[#008e97] text-xs font-bold uppercase tracking-wider mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Normativa: {course.normative_ref}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                {course.short_description}
              </p>

              {/* Fast Fact Badges */}
              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                  <Clock className="w-4 h-4 text-[#008e97]" />
                  <span>Durata: {course.duration_hours} Ore</span>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                  <BookOpen className="w-4 h-4 text-[#f58220]" />
                  <span>Modalità: {course.mode}</span>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                  <Award className="w-4 h-4 text-[#df0000]" />
                  <span>Validità: {course.validity_years} Anni</span>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Sede: {course.location || COMPANY_CONFIG.headquarters.city}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content & Booking Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Syllabus & Details */}
            <div className="lg:col-span-7 space-y-8">
              {/* Programma Formativo */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#008e97]" />
                  <span>Programma e Contenuti Didattici</span>
                </h2>
                <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {course.content || "Il programma didattico dettagliato viene fornito ai partecipanti prima dell'inizio delle sessioni, comprendendo modulo normativo, modulo tecnico e verifica finale di apprendimento."}
                </div>
              </div>

              {/* Destinatari & Attestato */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#e6f6f7] text-[#008e97] flex items-center justify-center mb-3">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">A Chi Si Rivolge</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {course.target_audience || "Lavoratori, datori di lavoro, preposti e dirigenti soggetti agli obblighi di formazione e aggiornamento periodico."}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-[#fdf2f2] text-[#df0000] flex items-center justify-center mb-3">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Certificazione Rilasciata</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {course.certification_issued || "Attestato di frequenza e profitto con validità legale asseverata ai sensi del D.Lgs. 81/08."}
                  </p>
                </div>
              </div>

              {/* Formazione su Misura Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md">
                <div className="flex items-center gap-2 text-[#f58220] font-bold text-xs uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Hai più di 3 dipendenti da formare?</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Sessioni Formative Aziendali Dedicate
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Organizziamo corsi dedicati direttamente presso la sede della tua azienda o in date flessibili concordate con i nostri docenti e RSPP qualificati.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={`tel:${COMPANY_CONFIG.contacts.phoneClean}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Contatta l'ufficio corsi</span>
                  </a>
                  <span className="text-xs text-slate-400 font-mono">
                    {COMPANY_CONFIG.contacts.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Booking Form */}
            <div className="lg:col-span-5">
              <div className="sticky top-[88px]">
                <CourseBookingForm course={course} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
