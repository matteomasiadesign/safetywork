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
import { compressImage, formatBytes } from "@/lib/images/compress";
import AdminModal from "@/components/admin/ui/AdminModal";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import SectionHeader from "@/components/admin/ui/SectionHeader";
import { btnOutline, btnPrimary, btnSecondary, iconBtn } from "@/components/admin/ui/styles";

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
  image_url: null,
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

const fieldClass =
  "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-colors";

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

  // Toglie la foto (anche quella scelta ma non ancora salvata)
  const clearImage = () => {
    resetImageState();
    setServiceForm((prev) => ({ ...prev, image_url: null }));
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

  const closeModal = () => setIsServiceModalOpen(false);

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <SectionHeader
          icon={<ShieldAlert className="h-5 w-5 stroke-[2.2]" />}
          title="Servizi Tecnici HSE"
          count={`${services.length} schede`}
          description="Gestisci le schede di consulenza per DVR, cantieri, RSPP esterno e verifiche periodiche."
          actions={
            <button type="button" onClick={openNewServiceModal} className={btnPrimary}>
              <Plus className="h-4 w-4" />
              <span>Nuovo Servizio</span>
            </button>
          }
        />

        {/* Ricerca */}
        <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden px-1 text-xs font-semibold text-slate-600 sm:block">
            Schede attive e visibili nella sezione Servizi del sito pubblico
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca per titolo, codice, legge..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-xs font-medium text-slate-900 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008e97] [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Cancella la ricerca"
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs sm:p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Nessun servizio trovato</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
              Verifica i termini di ricerca inseriti oppure aggiungi un nuovo servizio.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {filteredServices.map((srv) => {
              const IconComp = SERVICE_ICONS[srv.icon_name] || ShieldAlert;
              return (
                <div
                  key={srv.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md sm:p-5"
                >
                  <div className="relative -mx-4 -mt-4 mb-4 h-32 overflow-hidden rounded-t-2xl sm:-mx-5 sm:-mt-5 sm:h-36">
                    {srv.image_url ? (
                      <img
                        src={srv.image_url}
                        alt={srv.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-md border border-white/20 bg-slate-900/80 px-2.5 py-1 font-mono text-[11px] font-bold text-white backdrop-blur-md">
                      {srv.code}
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-white">
                      <span className="min-w-0 truncate rounded bg-black/40 px-2 py-0.5 font-mono text-[11px] text-slate-200">
                        {srv.law}
                      </span>
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-sm">
                        <IconComp className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h4 className="mb-2 text-base font-bold leading-snug text-slate-900">{srv.title}</h4>
                    <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-slate-600">{srv.description}</p>

                    <div className="mb-4 rounded-xl bg-slate-50 p-3">
                      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Deliverables ({srv.deliverables.length}):
                      </div>
                      <ul className="space-y-1.5">
                        {srv.deliverables.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex min-w-0 items-start gap-1.5 text-[11px] text-slate-700">
                            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[#008e97]" />
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                        {srv.deliverables.length > 3 && (
                          <li className="text-[10px] italic text-slate-400">+{srv.deliverables.length - 3} altri punti inclusi</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <span
                      className={`min-w-0 truncate rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        srv.badge_color === "orange"
                          ? "bg-amber-100 text-amber-800"
                          : srv.badge_color === "red"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#e6f6f7] text-[#008e97]"
                      }`}
                    >
                      Badge {srv.badge_color}
                      {!srv.is_published && " · Bozza"}
                    </span>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditServiceModal(srv)}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#e6f6f7] px-3.5 text-xs font-bold text-[#008e97] transition-colors hover:bg-[#d3eff1] sm:min-h-10"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Modifica</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteService(srv)}
                        className={`${iconBtn} text-slate-400 hover:bg-[#fdf2f2] hover:text-[#df0000]`}
                        title="Elimina servizio"
                        aria-label={`Elimina ${srv.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AdminModal
        open={isServiceModalOpen}
        onClose={closeModal}
        title={editingService ? "Modifica Servizio" : "Nuovo Servizio"}
        subtitle="Codice, descrizione tecnica, deliverables e icona"
        icon={<ShieldCheck className="h-5 w-5" />}
        size="lg"
        stripe
        dismissOnBackdrop={false}
        footer={
          <div className="flex gap-2 sm:justify-end">
            <button type="button" onClick={closeModal} className={`${btnSecondary} flex-1 sm:flex-none`}>
              Annulla
            </button>
            <button type="submit" form="service-form" disabled={isSaving} className={`${btnPrimary} flex-[2] sm:flex-none`}>
              <Check className="h-4 w-4" />
              <span>{editingService ? "Salva Modifiche" : "Pubblica Servizio"}</span>
            </button>
          </div>
        }
      >
        <form id="service-form" onSubmit={handleSaveService} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Codice Servizio *</label>
              <input
                type="text"
                required
                value={serviceForm.code}
                onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })}
                placeholder="es. SRV-07"
                className={`${fieldClass} font-bold`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Titolo del Servizio *</label>
              <input
                type="text"
                required
                value={serviceForm.title}
                onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                placeholder="es. Valutazione Rischio Rumore & Vibrazioni Meccaniche"
                className={`${fieldClass} font-bold`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Riferimento Normativo / Sottotitolo</label>
              <input
                type="text"
                value={serviceForm.law}
                onChange={(e) => setServiceForm({ ...serviceForm, law: e.target.value })}
                placeholder="es. Titolo VIII Capo II D.Lgs. 81/08"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Colore Badge Tema</label>
              <select
                value={serviceForm.badge_color}
                onChange={(e) => setServiceForm({ ...serviceForm, badge_color: e.target.value as "cyan" | "orange" | "red" })}
                className={`${fieldClass} font-semibold`}
              >
                <option value="cyan">Ciano Tecnico (#008e97)</option>
                <option value="orange">Arancione Cantiere (#f58220)</option>
                <option value="red">Rosso Sicurezza (#df0000)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Icona Rappresentativa</label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {Object.keys(SERVICE_ICONS).map((iconKey) => {
                const IconComp = SERVICE_ICONS[iconKey];
                const isSelected = serviceForm.icon_name === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, icon_name: iconKey })}
                    aria-pressed={isSelected}
                    className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-all ${
                      isSelected
                        ? "border-[#008e97] bg-[#e6f6f7] font-bold text-[#008e97]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <IconComp className="h-5 w-5" />
                    <span className="max-w-full truncate text-[9px]">{iconKey}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Descrizione Approfondita del Servizio</label>
            <textarea
              rows={4}
              required
              value={serviceForm.description}
              onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              placeholder="Spiega gli interventi operativi e i vantaggi per l'azienda committente..."
              className={fieldClass}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              Deliverables inclusi (punti elenco forniti al cliente)
            </label>

            <div className="space-y-1.5">
              {serviceForm.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-3 pr-1 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#008e97]" />
                  <span className="min-w-0 flex-1 break-words py-1.5 text-slate-800">{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDeliverable(idx)}
                    aria-label={`Rimuovi: ${item}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-[#fdf2f2] hover:text-[#df0000]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={serviceForm.newDeliverable}
                onChange={(e) => setServiceForm({ ...serviceForm, newDeliverable: e.target.value })}
                onKeyDown={(e) => {
                  // Invio aggiunge il punto elenco (senza, invierebbe l'intero modulo a metà compilazione)
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDeliverable();
                  }
                }}
                placeholder="Aggiungi un deliverable..."
                enterKeyHint="done"
                className={`${fieldClass} bg-white`}
              />
              <button type="button" onClick={handleAddDeliverable} className={`${btnOutline} shrink-0`}>
                <Plus className="h-4 w-4" />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Immagine di Copertina del Servizio</label>
              <input
                type="file"
                ref={serviceFileInputRef}
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleServiceImageUpload}
                className="hidden"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" disabled={isSaving} onClick={() => serviceFileInputRef.current?.click()} className={`${btnOutline} w-full normal-case tracking-normal sm:w-auto`}>
                  <Upload className="h-4 w-4 text-[#008e97]" />
                  <span>Carica foto dal computer</span>
                </button>
                {serviceForm.image_url && (
                  <button type="button" disabled={isSaving} onClick={clearImage} className={`${btnOutline} w-full normal-case tracking-normal sm:w-auto`}>
                    <X className="h-4 w-4" />
                    <span>Rimuovi foto</span>
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                {imageInfo ||
                  (serviceForm.image_url
                    ? "Per sostituirla scegli un'altra foto: viene ottimizzata sotto i 150 kB e salvata sul sito."
                    : "Nessuna foto: la scheda mostra uno sfondo scuro. JPG, PNG, WebP o AVIF vengono ottimizzati sotto i 150 kB.")}
              </p>
            </div>

            <div className="h-36 overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:h-full sm:min-h-28">
              {serviceForm.image_url && <img src={serviceForm.image_url} alt="Anteprima" className="h-full w-full object-cover" />}
            </div>
          </div>

          <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-emerald-300">
            <input
              type="checkbox"
              checked={serviceForm.is_published}
              onChange={(e) => setServiceForm({ ...serviceForm, is_published: e.target.checked })}
              className="mt-0.5 h-5 w-5 shrink-0 rounded text-emerald-600 focus:ring-0"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">Pubblicato sul sito</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                Se disattivato il servizio resta in bozza e non compare nella sezione Servizi.
              </div>
            </div>
          </label>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(deleteService)}
        title="Eliminare il servizio?"
        confirmLabel="Elimina definitivamente"
        busy={isSaving}
        onConfirm={executeDelete}
        onCancel={() => setDeleteService(null)}
      >
        Stai per eliminare definitivamente <strong>&ldquo;{deleteService?.title}&rdquo;</strong>. Il servizio sparirà anche dal sito
        pubblico.
      </ConfirmDialog>
    </>
  );
}
