import React from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import BrandStripe from "@/components/ui/BrandStripe";

interface LegalPageProps {
  title: string;
  /** Riga sotto il titolo (es. data di aggiornamento). */
  updated: string;
  children: React.ReactNode;
}

/** Cornice delle pagine legali: intestazione, testo leggibile a colonna singola e footer del sito. */
export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <SiteHeader />

      <main className="flex-grow">
        <section className="relative overflow-hidden bg-slate-900 pb-14 pt-32 lg:pb-20 lg:pt-44">
          <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-slate-400">{updated}</p>
          </div>
        </section>
        <BrandStripe height="h-1.5" />

        <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">{children}</article>
      </main>

      <SiteFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-slate-600 sm:text-base [&_a]:font-medium [&_a]:text-[#008e97] [&_a]:underline [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
