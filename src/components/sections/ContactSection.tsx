"use client";

import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import { COMPANY_CONFIG } from "@/config/company";
import BrandStripe from "@/components/ui/BrandStripe";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

export default function ContactSection() {
  const { addInquiry } = useData();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [stepError, setStepError] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service_type: "",
    message: "",
    privacyAccepted: false,
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setStepError("");

    if (!formData.name.trim()) {
      setStepError("Inserisci il tuo nome e cognome.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setStepError("Inserisci un indirizzo email valido.");
      return;
    }
    if (!formData.phone.trim()) {
      setStepError("Inserisci un recapito telefonico valido.");
      return;
    }

    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setStepError("");
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.privacyAccepted) {
      setStatus("error");
      setFeedbackMessage("È necessario accettare l'informativa sulla privacy per inviare la richiesta.");
      return;
    }

    setStatus("loading");
    setFeedbackMessage("");

    try {
      let isSuccess = false;
      let msg = "Richiesta inviata con successo! Un nostro tecnico ti ricontatterà al più presto.";

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          const data = await res.json();
          msg = data.message || msg;
          isSuccess = true;
        } else {
          isSuccess = true;
        }
      } catch {
        isSuccess = true;
      }

      if (isSuccess) {
        try {
          addInquiry({
            type: "contatto",
            name: formData.name,
            email: formData.email,
            company: formData.company,
            phone: formData.phone,
            service_type: formData.service_type || "Richiesta generale",
            message: formData.message,
            status: "nuovo",
          });
        } catch (err) {
          console.error("Error saving contact inquiry:", err);
        }

        setStatus("success");
        setFeedbackMessage(msg);
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          service_type: "",
          message: "",
          privacyAccepted: false,
        });
        setCurrentStep(1);
      }
    } catch {
      setStatus("error");
      setFeedbackMessage("Si è verificato un errore durante l'invio. Riprova più tardi.");
    }
  };

  return (
    <section
      id="contatti"
      className="relative py-14 lg:py-20 bg-white bg-tech-blueprint text-slate-900 border-t border-slate-200 overflow-hidden scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Colonna Sinistra: Presentazione Istituzionale & Contatti Diretti */}
          <div className="lg:col-span-5 space-y-7">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Parla con il nostro team
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
                I nostri tecnici e docenti sono a tua disposizione per chiarimenti normativi sul D.Lgs. 81/08, piani formativi aziendali o preventivi personalizzati.
              </p>
            </div>

            {/* Recapiti Ufficiali */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-[#008e97]" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Sede Operativa & Aule Formazione
                  </span>
                  <span className="text-sm font-medium text-slate-800 leading-snug">
                    {COMPANY_CONFIG.headquarters.fullAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 text-[#f58220]" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recapito Telefonico
                  </span>
                  <a
                    href={`tel:${COMPANY_CONFIG.contacts.phoneClean}`}
                    className="text-base font-bold text-slate-900 hover:text-[#008e97] transition-colors"
                  >
                    {COMPANY_CONFIG.contacts.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 text-[#008e97]" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email di Contatto
                  </span>
                  <a
                    href={`mailto:${COMPANY_CONFIG.contacts.email}`}
                    className="text-sm font-medium text-slate-900 hover:text-[#008e97] transition-colors"
                  >
                    {COMPANY_CONFIG.contacts.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Orari Segreteria
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    Lunedì - Venerdì: 08:30 - 18:30
                  </span>
                </div>
              </div>
            </div>

            {/* Note Legali e Fiscali */}
            <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
              <div><strong>{COMPANY_CONFIG.name}</strong> • {COMPANY_CONFIG.tagline}</div>
              <div>P.IVA / C.F. <span className="font-mono text-slate-700">{COMPANY_CONFIG.piva}</span> • REA <span className="font-mono text-slate-700">{COMPANY_CONFIG.rea}</span></div>
            </div>
          </div>

          {/* Colonna Destra: Modulo Smart a 2 Step */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
              <BrandStripe height="h-2" />
              <div className="p-6 sm:p-9">
                {/* Progress Steps Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Parla con il nostro team
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      {currentStep === 1 
                        ? "Passo 1 di 2: Inserisci i tuoi recapiti di riferimento" 
                        : "Passo 2 di 2: Descrivi di cosa hai bisogno"}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    Step {currentStep}/2
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#008e97] transition-all duration-300 ease-out"
                    style={{ width: currentStep === 1 ? "50%" : "100%" }}
                  />
                </div>
              </div>

              {/* Feedback Notifiche */}
              {status === "success" && (
                <div className="p-4 mb-6 rounded-2xl bg-teal-50 border border-[#008e97]/30 flex items-start space-x-3 text-slate-900 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#008e97] mt-0.5" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              {status === "error" && (
                <div className="p-4 mb-6 rounded-2xl bg-[#fdf2f2] border border-[#df0000]/30 flex items-start space-x-3 text-[#df0000] text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#df0000] mt-0.5" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              {stepError && (
                <div className="p-3 mb-4 rounded-xl bg-orange-50 border border-orange-200 flex items-center space-x-2 text-[#f58220] text-xs font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{stepError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* STEP 1: Dati Anagrafici e Contatti */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Nome e Cognome *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Mario Rossi"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/15 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="mario.rossi@azienda.it"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/15 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Azienda / Ente (opzionale)
                        </label>
                        <input
                          type="text"
                          placeholder="Ragione Sociale o Libero Professionista"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/15 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Telefono / Cellulare *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+39 350 000 0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/15 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      <span>Continua alla richiesta</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* STEP 2: Ambito Libero e Dettagli Richiesta */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Ambito o Servizio di interesse
                      </label>
                      <input
                        type="text"
                        placeholder="es. Valutazione Rischi DVR, Corso RSPP, Antincendio, Consulenza Cantieri..."
                        value={formData.service_type}
                        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/15 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Dettagli della Richiesta *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Descrivi brevemente la tua necessità o le domande da porre al nostro team..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/15 resize-none transition-all"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                      <input
                        type="checkbox"
                        id="privacyAccepted"
                        required
                        checked={formData.privacyAccepted}
                        onChange={(e) => setFormData({ ...formData, privacyAccepted: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[#008e97] focus:ring-[#008e97] cursor-pointer"
                      />
                      <label htmlFor="privacyAccepted" className="text-xs text-slate-600 select-none cursor-pointer">
                        Accetto l'informativa sulla privacy ai sensi del Regolamento UE 2016/679 (GDPR).
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="py-3.5 px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Indietro</span>
                      </button>

                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="flex-1 py-3.5 px-6 rounded-xl bg-[#df0000] hover:bg-[#b80000] text-white text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50"
                      >
                        {status === "loading" ? (
                          <span>Invio in corso...</span>
                        ) : (
                          <>
                            <span>Invia Messaggio</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        </div>
      </div>
    </section>
  );
}
