"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ExternalLink, ImageIcon, PenLine, Undo2, Upload, X } from "lucide-react";
import SectionHeader from "@/components/admin/ui/SectionHeader";
import type { SiteContentChanges, SiteContentOverrides } from "@/context/AdminDataContext";
import {
  CONTENT_DEFAULTS,
  CONTENT_SECTIONS,
  type ContentField,
  type ContentKey,
  type ContentSection,
} from "@/lib/content/schema";
import { compressImage, formatBytes } from "@/lib/images/compress";

interface ContentEditorProps {
  overrides: SiteContentOverrides;
  onSave: (changes: SiteContentChanges, images: Partial<Record<ContentKey, File>>) => Promise<void>;
  showToast: (msg: string, tone?: "success" | "error") => void;
  onDirtyChange: (dirty: boolean) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all";

const PAGES = Array.from(new Set(CONTENT_SECTIONS.map((s) => s.page)));

export default function ContentEditor({ overrides, onSave, showToast, onDirtyChange }: ContentEditorProps) {
  const [activeId, setActiveId] = useState(CONTENT_SECTIONS[0].id);
  // Modifiche non ancora salvate (testo digitato o anteprima della foto scelta).
  const [draft, setDraft] = useState<Partial<Record<ContentKey, string>>>({});
  const [pendingImages, setPendingImages] = useState<Partial<Record<ContentKey, File>>>({});
  const [imageInfo, setImageInfo] = useState<Partial<Record<ContentKey, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [busyImage, setBusyImage] = useState<ContentKey | null>(null);

  const blobUrls = useRef<Set<string>>(new Set());
  const fileInputs = useRef<Partial<Record<ContentKey, HTMLInputElement | null>>>({});

  useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const section = CONTENT_SECTIONS.find((s) => s.id === activeId) ?? CONTENT_SECTIONS[0];

  const savedValue = (key: ContentKey) => overrides[key] ?? CONTENT_DEFAULTS[key];
  const currentValue = (key: ContentKey) => draft[key] ?? savedValue(key);

  /** Chiavi realmente diverse da ciò che è già salvato. */
  const changedKeys = useMemo(
    () =>
      (Object.keys(draft) as ContentKey[]).filter(
        (key) => pendingImages[key] !== undefined || draft[key] !== (overrides[key] ?? CONTENT_DEFAULTS[key])
      ),
    [draft, pendingImages, overrides]
  );
  const isDirty = changedKeys.length > 0;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // Avvisa se si chiude la scheda con modifiche non salvate.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const releaseBlob = (url: string | undefined) => {
    if (url && blobUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      blobUrls.current.delete(url);
    }
  };

  const setText = (key: ContentKey, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  const clearPendingImage = (key: ContentKey) => {
    releaseBlob(draft[key]);
    setPendingImages((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setImageInfo((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const restoreOriginal = (key: ContentKey) => {
    clearPendingImage(key);
    setDraft((prev) => ({ ...prev, [key]: CONTENT_DEFAULTS[key] }));
  };

  const undoField = (key: ContentKey) => {
    clearPendingImage(key);
    setDraft((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const discardAll = () => {
    Object.values(draft).forEach((value) => releaseBlob(value));
    setDraft({});
    setPendingImages({});
    setImageInfo({});
  };

  const handleImagePick = async (key: ContentKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusyImage(key);
    try {
      const result = await compressImage(file);
      releaseBlob(draft[key]);
      const preview = URL.createObjectURL(result.file);
      blobUrls.current.add(preview);
      setPendingImages((prev) => ({ ...prev, [key]: result.file }));
      setDraft((prev) => ({ ...prev, [key]: preview }));
      setImageInfo((prev) => ({
        ...prev,
        [key]: `Ottimizzata: ${formatBytes(result.originalBytes)} → ${formatBytes(result.file.size)} (${result.width}×${result.height} px)`,
      }));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Immagine non valida.", "error");
    } finally {
      setBusyImage(null);
    }
  };

  const handleSave = async () => {
    const fieldByKey = new Map<ContentKey, ContentField>();
    CONTENT_SECTIONS.forEach((s) => s.fields.forEach((field) => fieldByKey.set(field.key, field)));

    const changes: SiteContentChanges = {};
    const images: Partial<Record<ContentKey, File>> = {};

    for (const key of changedKeys) {
      const field = fieldByKey.get(key);
      const file = pendingImages[key];
      if (file) {
        images[key] = file;
        changes[key] = "";
        continue;
      }

      const value = field?.type === "image" ? (draft[key] ?? "") : (draft[key] ?? "").trim();
      const original = CONTENT_DEFAULTS[key];
      const stored = overrides[key];
      const backToOriginal = value === original || (value === "" && !field?.allowEmpty);

      if (backToOriginal) {
        if (stored !== undefined) changes[key] = null;
      } else if (value !== stored) {
        changes[key] = value;
      }
    }

    if (Object.keys(changes).length === 0) {
      discardAll();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(changes, images);
      discardAll();
      showToast("Modifiche salvate: il sito è già aggiornato.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Salvataggio non riuscito.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const sectionChangeCount = (s: ContentSection) => s.fields.filter((field) => changedKeys.includes(field.key)).length;
  const sectionCustomCount = (s: ContentSection) =>
    s.fields.filter((field) => overrides[field.key] !== undefined).length;

  const renderField = (field: ContentField, index: number) => {
    const { key } = field;
    const value = currentValue(key);
    const isCustomized = value !== CONTENT_DEFAULTS[key];
    const isChanged = changedKeys.includes(key);
    const id = `content-${key}`;

    return (
      <div key={key} className="space-y-1.5">
        {field.groupLabel && (
          <div className={`${index === 0 ? "" : "pt-4 "}text-[11px] font-black uppercase tracking-wider text-[#008e97] border-b border-slate-200 pb-1.5`}>
            {field.groupLabel}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <label htmlFor={id} className="text-xs font-semibold text-slate-700">
            {field.label}
          </label>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {isChanged && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                Da salvare
              </span>
            )}
            {isCustomized && !isChanged && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#008e97] bg-[#e6f6f7] px-1.5 py-0.5 rounded">
                Personalizzato
              </span>
            )}
            {isChanged && (
              <button
                type="button"
                onClick={() => undoField(key)}
                className="inline-flex min-h-9 items-center gap-1 px-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                title="Annulla la modifica non salvata"
              >
                <Undo2 className="w-3 h-3" />
                <span>Annulla</span>
              </button>
            )}
            {isCustomized && (
              <button
                type="button"
                onClick={() => restoreOriginal(key)}
                className="inline-flex min-h-9 items-center gap-1 px-1 text-[11px] font-semibold text-slate-500 hover:text-[#df0000]"
                title="Torna al testo originale del sito"
              >
                <X className="w-3 h-3" />
                <span>Ripristina originale</span>
              </button>
            )}
          </div>
        </div>

        {field.type === "image" ? (
          <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-4 items-start">
            <div className="h-40 sm:h-36 rounded-2xl overflow-hidden border border-slate-200 bg-slate-200 flex items-center justify-center">
              {value ? (
                <img
                  src={value}
                  alt={field.label}
                  className={`w-full h-full ${field.imageFit === "contain" ? "object-contain p-3" : "object-cover"}`}
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div className="space-y-2">
              <input
                id={id}
                type="file"
                ref={(el) => {
                  fileInputs.current[key] = el;
                }}
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => handleImagePick(key, e)}
                className="hidden"
              />
              <button
                type="button"
                disabled={busyImage === key}
                onClick={() => fileInputs.current[key]?.click()}
                className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-[#008e97]" />
                <span>{busyImage === key ? "Ottimizzo la foto..." : "Scegli un'immagine"}</span>
              </button>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {imageInfo[key] ?? "Viene ridimensionata e alleggerita (sotto i 150 kB) in automatico, senza perdita visibile."}
              </p>
            </div>
          </div>
        ) : field.type === "textarea" ? (
          <textarea
            id={id}
            rows={field.key.endsWith(".title") || field.key.endsWith("alert_title") ? 2 : 4}
            maxLength={2000}
            value={value}
            onChange={(e) => setText(key, e.target.value)}
            className={`${inputClass} leading-relaxed resize-y`}
          />
        ) : (
          <input
            id={id}
            type="text"
            maxLength={500}
            value={value}
            onChange={(e) => setText(key, e.target.value)}
            className={inputClass}
          />
        )}

        {(field.hint || field.allowEmpty) && field.type !== "image" && (
          <p className="text-[11px] text-slate-500">
            {field.hint} {field.allowEmpty && "Lascia vuoto per nascondere questo testo."}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <SectionHeader
        icon={<PenLine className="w-5 h-5 stroke-[2.2]" />}
        title="Contenuti del Sito"
        description="Modifica testi, immagini e recapiti. Le modifiche vanno online appena salvi."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)] gap-5 items-start">
        {/* Menu sezioni: elenco su desktop, menu a tendina su mobile */}
        <div className="lg:hidden">
          <label htmlFor="content-section-select" className="block text-xs font-semibold text-slate-700 mb-1">
            Sezione da modificare
          </label>
          <select
            id="content-section-select"
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
            className={inputClass}
          >
            {PAGES.map((page) => (
              <optgroup key={page} label={page}>
                {CONTENT_SECTIONS.filter((s) => s.page === page).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                    {sectionChangeCount(s) > 0 ? " •" : ""}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <nav className="hidden lg:block bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-4 sticky top-20">
          {PAGES.map((page) => (
            <div key={page}>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{page}</div>
              <div className="space-y-0.5">
                {CONTENT_SECTIONS.filter((s) => s.page === page).map((s) => {
                  const isActive = s.id === activeId;
                  const changes = sectionChangeCount(s);
                  const custom = sectionCustomCount(s);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveId(s.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-colors ${
                        isActive ? "bg-[#008e97] text-white font-bold" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate">{s.title}</span>
                      {changes > 0 ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Modifiche non salvate" />
                      ) : custom > 0 ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive ? "bg-white text-[#008e97]" : "bg-[#e6f6f7] text-[#008e97]"
                          }`}
                          title={`${custom} campi personalizzati`}
                        >
                          {custom}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Modulo della sezione */}
        <div className="min-w-0 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">{section.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xl">{section.description}</p>
              </div>
              <a
                href={section.previewHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#e6f6f7] hover:text-[#008e97] text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#008e97]" />
                <span>Vedi sul sito</span>
              </a>
            </div>

            <div className="p-5 sm:p-6 space-y-4 max-w-3xl">{section.fields.map(renderField)}</div>
          </div>

          {/* Barra di salvataggio sempre raggiungibile */}
          <div className="sticky bottom-[calc(5.75rem+env(safe-area-inset-bottom))] lg:bottom-3 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-lg p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="text-xs font-semibold text-slate-600 px-1">
              {isDirty ? (
                <span className="text-amber-700">
                  {changedKeys.length} {changedKeys.length === 1 ? "modifica non salvata" : "modifiche non salvate"}
                </span>
              ) : (
                "Nessuna modifica da salvare"
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={discardAll}
                disabled={!isDirty || isSaving}
                className="flex-1 sm:flex-none whitespace-nowrap min-h-11 sm:min-h-10 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40"
              >
                Annulla tutto
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="flex-[1.4] sm:flex-none whitespace-nowrap min-h-11 sm:min-h-10 px-4 sm:px-5 py-2 bg-[#df0000] hover:bg-[#b80000] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all inline-flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? "Salvataggio..." : "Salva e pubblica"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
