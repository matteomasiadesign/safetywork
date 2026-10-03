"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  GraduationCap,
  FileCheck,
  Activity,
  CheckCircle2,
  Flame,
  HardHat,
  Building,
  Scale,
  Wrench,
  Users,
  PhoneCall,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Check,
  Upload,
} from "lucide-react";
import type { ServiceItem } from "@/lib/types/database";
import type { ServiceInput } from "@/context/AdminDataContext";
import { COURSE_IMAGE_PRESETS } from "@/components/admin/CoursesManager";
import { compressImage, formatBytes } from "@/lib/images/compress";

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  FileCheck,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Flame,
  HardHat,
  Building,
  Scale,
  Wrench,
  Users,
  PhoneCall,
};

interface ServicesManagerProps {
  services: ServiceItem[];
  onSaveService: (input: ServiceInput, id?: string, imageFile?: File | null) => Promise<unknown>;
  onDeleteService: (id: string) => Promise<void>;
  showToast: (msg: string, tone?: "success" | "error") => void;
}

type ServiceFormState = ServiceInput & { newDeliverable: string };

const emptyForm = (code: string): ServiceFormState => ({
  code,
  title: "",
  law: "Titolo IV D.Lgs. 81/08",
  image_url: COURSE_IMAGE_PRESETS[1].url,
  description: "",
  deliverables: [
    "Incarico e nomina formale asseverata",
    "Sopralluoghi e redazione verbali di controllo",
    "Assistenza in caso di ispezione ASL / Vigili del Fuoco",
  ],
  newDeliverable: "",
  icon_name: "ShieldAlert",
  badge_color: "cyan",
  is_published: true,
});

export default function ServicesManager({
  services,
  onSaveService,
  onDeleteService,
  showToast,
}: ServicesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteService, setDeleteService] = useState<ServiceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);

  // Foto scelta dal computer: compressa subito, caricata su Storage solo al salvataggio
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState("");

  const [serviceForm, setServiceForm] = useState<ServiceFormState>(emptyForm("SRV-01"));

  const resetImageState = () => {
    setServiceForm((prev) => {
      if (prev.image_url?.startsWith("blob:")) URL.revokeObjectURL(prev.image_url);
      return prev;
    });
    setPendingImage(null);
    setImageInfo("");
  };

  // Imposta un'immagine da URL, scartando l'eventuale foto in attesa
  const setImageUrl = (url: string) => {
    resetImageState();
    setServiceForm((prev) => ({ ...prev, image_url: url }));
  };

  // Chiusura del modale: libera l'anteprima della foto non salvata
  useEffect(() => {
    if (!isServiceModalOpen) resetImageState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isServiceModalOpen]);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.law.toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  const openNewServiceModal = () => {
    setEditingService(null);
    setServiceForm(emptyForm("SRV-" + String(services.length + 1).padStart(2, "0")));
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (service: ServiceItem) => {
    setEditingService(service);
    setServiceForm({
      code: service.code,
      title: service.title,
      law: service.law,
      image_url: service.image_url,
      description: service.description,
      deliverables: [...service.deliverables],
      newDeliverable: "",
      icon_name: service.icon_name,
      badge_color: service.badge_color,
      is_published: service.is_published,
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      showToast("Inserisci il titolo del servizio.", "error");
      return;
    }

    const { newDeliverable: _ignored, ...fields } = serviceForm;
    setIsSaving(true);
    try {
      await onSaveService(
        {
          ...fields,
          code: fields.code.trim(),
          title: fields.title.trim(),
          law: fields.law.trim(),
          description: fields.description.trim(),
          // con una foto in attesa il vero URL lo assegna il salvataggio dopo il caricamento
          image_url: pendingImage ? editingService?.image_url ?? null : fields.image_url?.trim() || null,
        },
        editingService?.id,
        pendingImage
      );
      showToast(
        editingService
          ? 'Servizio "' + serviceForm.title + '" aggiornato.'
          : 'Servizio "' + serviceForm.title + '" creato.'
      );
      setIsServiceModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Salvataggio non riuscito.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsSaving(true);
    try {
      const result = await compressImage(file);
      resetImageState();
      setPendingImage(result.file);
      setServiceForm((prev) => ({ ...prev, image_url: URL.createObjectURL(result.file) }));
      setImageInfo(
        "Ottimizzata: " + formatBytes(result.originalBytes) + " → " + formatBytes(result.file.size) +
          " (" + result.width + "×" + result.height + " px)"
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Immagine non valida.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDeliverable = () => {
    if (!serviceForm.newDeliverable.trim()) return;
    setServiceForm((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, prev.newDeliverable.trim()],
      newDeliverable: "",
    }));
  };

  const handleRemoveDeliverable = (idx: number) => {
    setServiceForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }));
  };

  const executeDelete = async () => {
    if (!deleteService) return;
    setIsSaving(true);
    try {
      await onDeleteService(deleteService.id);
      showToast("Servizio eliminato.");
      setDeleteService(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Eliminazione non riuscita.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. UNIFIED SECTION HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e6f6f7] border border-[#008e97]/20 flex items-center justify-center text-[#008e97] shrink-0 shadow-2xs">
                  <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Servizi Tecnici HSE
                    </h2>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                      {services.length} schede
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestisci le schede di consulenza per DVR, cantieri, RSPP esterno e verifiche periodiche.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={openNewServiceModal}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Servizio</span>
                </button>
              </div>
            </div>

            {/* 2. INTEGRATED CONTROLS & SEARCH BAR */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-600 px-1">
                Schede attive e visibili nella sezione Servizi del sito pubblico
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca per titolo, codice, legge..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Nessun servizio trovato</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Verifica i termini di ricerca inseriti oppure aggiungi un nuovo servizio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((srv) => {
                const IconComp = SERVICE_ICONS[srv.icon_name] || ShieldAlert;
                return (
                  <div
                    key={srv.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="relative h-36 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl">
                      <img
                        src={srv.image_url || COURSE_IMAGE_PRESETS[1].url}
                        alt={srv.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                      <span className="absolute top-3 left-3 font-mono text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                        {srv.code}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                        <span className="text-[11px] font-mono text-slate-200 bg-black/40 px-2 py-0.5 rounded">
                          {srv.law}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                          <IconComp className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h4 className="text-base font-bold text-slate-900 mb-2">{srv.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4">{srv.description}</p>

                      <div className="bg-slate-50 p-3 rounded-xl mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Deliverables ({srv.deliverables.length}):
                        </div>
                        <ul className="space-y-1">
                          {srv.deliverables.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-[11px] text-slate-700 flex items-center gap-1.5 line-clamp-1">
                              <CheckCircle2 className="w-3 h-3 text-[#008e97] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                          {srv.deliverables.length > 3 && (
                            <li className="text-[10px] text-slate-400 italic">
                              +{srv.deliverables.length - 3} altri punti inclusi
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          srv.badge_color === "orange"
                            ? "bg-amber-100 text-amber-800"
                            : srv.badge_color === "red"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#e6f6f7] text-[#008e97]"
                        }`}
                      >
                        Badge: {srv.badge_color}{!srv.is_published && " · BOZZA"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditServiceModal(srv)}
                          className="p-1.5 text-slate-500 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-lg transition-colors"
                          title="Modifica servizio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteService(srv)
                          }
                          className="p-1.5 text-slate-400 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-lg transition-colors"
                          title="Elimina servizio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#008e97] text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingService ? "Modifica Servizio di Sicurezza" : "Aggiungi Nuovo Servizio"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configura codice, descrizione tecnica, deliverables e icona
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 overflow-y-auto space-y-5 flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Codice Servizio *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.code}
                    onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })}
                    placeholder="es. SRV-07"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titolo del Servizio *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    placeholder="es. Valutazione Rischio Rumore & Vibrazioni Meccaniche"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Riferimento Normativo / Sottotitolo
                  </label>
                  <input
                    type="text"
                    value={serviceForm.law}
                    onChange={(e) => setServiceForm({ ...serviceForm, law: e.target.value })}
                    placeholder="es. Titolo VIII Capo II D.Lgs. 81/08"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Colore Badge Tema</label>
                  <select
                    value={serviceForm.badge_color}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, badge_color: e.target.value as "cyan" | "orange" | "red" })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="cyan">Ciano Tecnico (#008e97)</option>
                    <option value="orange">Arancione Cantiere (#f58220)</option>
                    <option value="red">Rosso Sicurezza (#df0000)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Icona Rappresentativa
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Object.keys(SERVICE_ICONS).map((iconKey) => {
                    const IconComp = SERVICE_ICONS[iconKey];
                    const isSelected = serviceForm.icon_name === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setServiceForm({ ...serviceForm, icon_name: iconKey })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? "bg-[#e6f6f7] border-[#008e97] text-[#008e97] font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[9px] truncate max-w-full">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrizione Approfondita del Servizio
                </label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Spiega gli interventi operativi e i vantaggi per l'azienda committente..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Deliverables Inclusi (Punti elenco forniti al cliente):
                </label>

                <div className="space-y-1.5">
                  {serviceForm.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008e97]" />
                        <span className="text-slate-800">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-slate-400 hover:text-[#df0000] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={serviceForm.newDeliverable}
                    onChange={(e) => setServiceForm({ ...serviceForm, newDeliverable: e.target.value })}
                    placeholder="Aggiungi deliverable (es. Rilascio attestazione di conformità asseverata)..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase shrink-0"
                  >
                    Aggiungi
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Immagine di Copertina del Servizio
                  </label>
                  <input
                    type="text"
                    value={pendingImage ? "(foto caricata dal computer)" : serviceForm.image_url ?? ""}
                    readOnly={Boolean(pendingImage)}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="URL immagine..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 mb-2"
                  />

                  <input
                    type="file"
                    ref={serviceFileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleServiceImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => serviceFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#008e97]" />
                    <span>Carica dal computer</span>
                  </button>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {imageInfo || "Ottimizzata automaticamente sotto i 150 kB, senza perdita visibile."}
                  </p>
                </div>

                <div className="h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-200">
                  {serviceForm.image_url && (
                    <img src={serviceForm.image_url} alt="Anteprima" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>

              <label className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                <input
                  type="checkbox"
                  checked={serviceForm.is_published}
                  onChange={(e) => setServiceForm({ ...serviceForm, is_published: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">Pubblicato sul sito</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Se disattivato il servizio resta in bozza e non compare nella sezione Servizi.
                  </div>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 disabled:opacity-50 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingService ? "Salva Modifiche" : "Pubblica Servizio"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf2f2] text-[#df0000] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Conferma Eliminazione
            </h4>
            <p className="text-xs text-slate-600 text-center mb-6">
              Sei sicuro di voler eliminare definitivamente{" "}
              <strong>"{deleteService.title}"</strong>? Il servizio sparirà anche dal sito pubblico.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteService(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
              >
                Annulla
              </button>
              <button
                onClick={executeDelete}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                Elimina Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
