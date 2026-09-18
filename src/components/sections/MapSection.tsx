import React from "react";
import { MapPin } from "lucide-react";

export default function MapSection() {
  return (
    <section className="w-full bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e6f6f7] border border-[#008e97]/30 text-[#008e97] text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>Vieni a Trovarci</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            La Nostra Sede Operativa
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            Corso Vittorio Emanuele, 56 - 07046 Porto Torres (SS)
          </p>
        </div>
        
        <div className="w-full h-[400px] sm:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative">
          <iframe
            src="https://maps.google.com/maps?q=Corso%20Vittorio%20Emanuele%2C%2056%2C%20Porto%20Torres&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mappa Sede Safety Work S.r.l.s."
            className="absolute inset-0"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

