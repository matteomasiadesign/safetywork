"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import AdminModal from "@/components/admin/ui/AdminModal";
import { btnPrimary, btnSecondary, btnTeal } from "@/components/admin/ui/styles";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Testo della domanda; può contenere il nome dell'elemento in evidenza. */
  children: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" (rosso) per le eliminazioni; "neutral" (azzurro) per le modifiche da salvare. */
  tone?: "danger" | "neutral";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Conferma esplicita di un'azione: nulla viene salvato finché non si preme il pulsante di conferma.
 * Foglio dal basso su mobile, finestra al centro altrove. Chiusura con Esc o "Annulla" = nessuna modifica.
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = "Annulla",
  tone = "danger",
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const danger = tone === "danger";
  const Icon = danger ? AlertTriangle : Info;

  return (
    <AdminModal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      bodyClassName="p-5 sm:p-6"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className={`${btnSecondary} sm:min-w-28`}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={danger ? btnPrimary : btnTeal}>
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
            danger ? "border-red-200 bg-[#fdf2f2] text-[#df0000]" : "border-[#008e97]/30 bg-[#e6f6f7] text-[#008e97]"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 text-sm leading-relaxed text-slate-600 [&_strong]:break-words [&_strong]:font-bold [&_strong]:text-slate-900">
          {children}
        </div>
      </div>
    </AdminModal>
  );
}
