"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, PhoneCall } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CONTENT_DEFAULTS } from "@/lib/content/schema";
import { companyContacts } from "@/lib/content/format";

// La schermata di errore non può leggere il database: usa recapiti e logo originali.
const contacts = companyContacts(CONTENT_DEFAULTS);

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar contacts={contacts} logoSrc={CONTENT_DEFAULTS["brand.logo"]} />
      <main className="flex-grow flex items-center justify-center px-4 py-24">
        <div className="max-w-md text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#fdf2f2] border border-[#df0000]/20 text-[#df0000] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Non riusciamo a caricare i contenuti
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Il servizio che contiene corsi e informazioni non risponde in questo momento. Riprova tra qualche istante;
            se il problema persiste puoi contattarci direttamente.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Riprova</span>
            </button>
            <a
              href={contacts.phoneHref}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 hover:border-[#008e97] text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-[#008e97]" />
              <span>{contacts.phone}</span>
            </a>
          </div>
        </div>
      </main>
      <Footer contacts={contacts} logoSrc={CONTENT_DEFAULTS["brand.logo"]} />
    </div>
  );
}
