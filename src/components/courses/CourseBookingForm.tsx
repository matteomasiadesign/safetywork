"use client";

import React, { useState } from "react";
import { Course } from "@/lib/types/database";
import { useData } from "@/context/DataContext";
import {
  Send,
  CheckCircle2,
  Building,
  User,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  PhoneCall,
  Mail,
  Clock,
  Calendar,
} from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";
import BrandStripe from "@/components/ui/BrandStripe";

interface CourseBookingFormProps {
  course: Course;
}

export default function CourseBookingForm({ course }: CourseBookingFormProps) {
  const { addInquiry } = useData();

  const [clientType, setClientType] = useState<"privato" | "azienda">("privato");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Privato
    firstName: "",
    lastName: "",
    fiscalCode: "",
    birthDate: "",
    birthPlace: "",

    // Azienda
    participantsCount: "1",
    companyName: "",
    vatNumber: "",
    atecoCode: "",
    sdiCode: "",
    pec: "",

    // Recapiti comuni
    address: "",
    city: "",
    postalCode: "",
    email: "",
    phone: "",
    preferredMode: course.mode?.includes("Aula") ? "Aula in sede" : "Videoconferenza",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setFormData({
      firstName: "",
      lastName: "",
      fiscalCode: "",
      birthDate: "",
      birthPlace: "",
      participantsCount: "1",
      companyName: "",
      vatNumber: "",
      atecoCode: "",
      sdiCode: "",
      pec: "",
      address: "",
      city: "",
      postalCode: "",
      email: "",
      phone: "",
      preferredMode: course.mode?.includes("Aula") ? "Aula in sede" : "Videoconferenza",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const displayName =
      clientType === "privato"
        ? `${formData.firstName.trim()} ${formData.lastName.trim()}`
        : formData.companyName.trim();

    try {
      // Salva tramite DataContext (localStorage + Supabase)
      await addInquiry({
        type: "corso",
        clientType,
        name: displayName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: clientType === "azienda" ? formData.companyName.trim() : undefined,
        courseTitle: course.title,
        courseSlug: course.slug,
        participantsCount: clientType === "azienda" ? Number(formData.participantsCount) || 1 : 1,
        preferredMode: formData.preferredMode,
        message: formData.notes.trim() || `Prenotazione per il corso ${course.title}`,
        status: "nuovo",

        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        fiscalCode: formData.fiscalCode.trim().toUpperCase() || undefined,
        birthDate: formData.birthDate || undefined,
        birthPlace: formData.birthPlace.trim() || undefined,

        companyName: formData.companyName.trim() || undefined,
        vatNumber: formData.vatNumber.trim().toUpperCase() || undefined,
        atecoCode: formData.atecoCode.trim() || undefined,
        sdiCode: formData.sdiCode.trim().toUpperCase() || undefined,
        pec: formData.pec.trim() || undefined,

        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
      });

      // Notifica server API (Route Handler)
      try {
        await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            type: "corso",
            client_type: clientType,
            name: displayName,
            course_title: course.title,
            course_slug: course.slug,
            message: formData.notes || `Iscrizione al corso ${course.title}`,
          }),
        });
      } catch {
        // Fallback locale trasparente
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error("Errore salvataggio prenotazione:", err);
      alert("Si è verificato un errore durante l'invio. Riprova o contattaci telefonicamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white border border-emerald-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Richiesta Asseverata Ricevuta
        </span>

        <h3 className="text-2xl font-extrabold text-slate-900 mt-4 tracking-tight">
          Prenotazione Registrata con Successo!
        </h3>

        <p className="text-sm text-slate-600 mt-3 max-w-lg mx-auto leading-relaxed">
          Grazie per aver scelto <strong>{COMPANY_CONFIG.name}</strong>. Il nostro ufficio formazione ha preso in carico la richiesta per <strong>{course.title}</strong> e ti contatterà entro 24 ore per finalizzare calendario e attestazione.
        </p>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nuova Iscrizione</span>
          </button>
          <a
            href={`tel:${COMPANY_CONFIG.contacts.phoneClean}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold transition-colors shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Chiama Segreteria Corsi</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div id="iscrizione" className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden">
      <BrandStripe height="h-2" />
      <div className="p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fdf2f2] border border-[#df0000]/20 text-[#df0000] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Modulo Iscrizione Ufficiale</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Iscriviti o Richiedi Informazioni
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Compila il modulo per ricevere la documentazione formativa e la conferma delle date.
          </p>
        </div>

        {/* Client Type Selector Pill */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setClientType("privato")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              clientType === "privato"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Privato / Lavoratore</span>
          </button>
          <button
            type="button"
            onClick={() => setClientType("azienda")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              clientType === "azienda"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Azienda / Studio</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEZIONE PRIVATO */}
        {clientType === "privato" && (
          <div className="space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Dati Anagrafici del Corsista
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome *</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Mario"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cognome *</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Rossi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Codice Fiscale *</label>
                <input
                  type="text"
                  name="fiscalCode"
                  required
                  maxLength={16}
                  value={formData.fiscalCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fiscalCode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="RSSMRA80A01H501U"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 uppercase focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Data di Nascita</label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Luogo di Nascita</label>
                <input
                  type="text"
                  name="birthPlace"
                  value={formData.birthPlace}
                  onChange={handleInputChange}
                  placeholder="Sassari (SS)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEZIONE AZIENDA */}
        {clientType === "azienda" && (
          <div className="space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
              Dati Societari e di Fatturazione
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Ragione Sociale *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Impresa Edile Rossi S.r.l."
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Numero Partecipanti *</label>
                <input
                  type="number"
                  name="participantsCount"
                  min="1"
                  max="100"
                  required
                  value={formData.participantsCount}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Partita IVA *</label>
                <input
                  type="text"
                  name="vatNumber"
                  required
                  value={formData.vatNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vatNumber: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="01234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-mono uppercase text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Codice Destinatario SDI</label>
                <input
                  type="text"
                  name="sdiCode"
                  maxLength={7}
                  value={formData.sdiCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sdiCode: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="M5UXCR1 (o 0000000)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-mono uppercase text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Indirizzo PEC</label>
                <input
                  type="email"
                  name="pec"
                  value={formData.pec}
                  onChange={handleInputChange}
                  placeholder="azienda@pec.it"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* RECAPITI COMUNI */}
        <div className="space-y-4 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            Recapiti di Contatto e Sede
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Indirizzo Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="info@azienda.it"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Telefono / Cellulare *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+39 333 1234567"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Indirizzo Sede / Residenza</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Via Roma, 10"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Comune / Città</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Porto Torres"
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Modalità Preferita</label>
              <select
                name="preferredMode"
                value={formData.preferredMode}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all"
              >
                <option value="Aula in sede">Aula in presenza (Sede Safety Work)</option>
                <option value="Videoconferenza">Videoconferenza Sincrona</option>
                <option value="Presso Azienda">Presso sede del cliente (aziendale)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Note o Esigenze Particolari</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Specificare eventuali richieste su orari, attestati pregressi o date desiderate..."
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#008e97] focus:ring-2 focus:ring-[#008e97]/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit & Legal */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#008e97] shrink-0" />
            <span>Trattamento conforme GDPR • Nessun pagamento anticipato richiesto</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#df0000] hover:bg-[#b80000] text-white text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Invio in corso..." : "Invia Richiesta Iscrizione"}</span>
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}

