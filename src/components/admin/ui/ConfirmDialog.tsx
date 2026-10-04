"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import AdminModal from "@/components/admin/ui/AdminModal";
import { btnPrimary, btnSecondary } from "@/components/admin/ui/styles";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Testo della domanda; può contenere il nome dell'elemento in evidenza. */
  children: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Conferma di un'azione distruttiva: foglio dal basso su mobile, finestra al centro altrove. */
export default function ConfirmDialog({ open, title, children, confirmLabel, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <AdminModal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      bodyClassName="p-5 sm:p-6"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className={`${btnSecondary} sm:min-w-28`}>
            Annulla
          </button>
          <button type="button" onClick={onConfirm} disabled={busy} className={btnPrimary}>
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-[#fdf2f2] text-[#df0000]">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 text-sm leading-relaxed text-slate-600 [&_strong]:break-words [&_strong]:font-bold [&_strong]:text-slate-900">
          {children}
        </div>
      </div>
    </AdminModal>
  );
}
