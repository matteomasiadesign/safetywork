"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import BrandStripe from "@/components/ui/BrandStripe";
import { useBodyScrollLock } from "@/components/admin/ui/useBodyScrollLock";

const SIZES = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-4xl",
} as const;

// Pannelli aperti, dal più vecchio al più recente: Esc chiude solo quello in cima.
const stack: string[] = [];

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Icona nel riquadro a sinistra del titolo. */
  icon?: React.ReactNode;
  size?: keyof typeof SIZES;
  /** Fascia tricolore in cima. */
  stripe?: boolean;
  /** Chiusura con un tocco sullo sfondo: da spegnere nei moduli lunghi, dove un tocco sbagliato farebbe perdere i dati. */
  dismissOnBackdrop?: boolean;
  /** Altezza fissa (utile per i passaggi di una procedura guidata, così il pannello non "salta"). */
  fixedHeight?: boolean;
  /** Area sotto l'intestazione che non scorre (es. indicatore dei passaggi). */
  header?: React.ReactNode;
  /** Barra azioni sempre visibile in fondo. */
  footer?: React.ReactNode;
  bodyClassName?: string;
  children: React.ReactNode;
}

/**
 * Pannello modale dell'admin.
 * - Mobile: foglio che sale dal basso, mai più alto dello schermo; intestazione e azioni restano ferme, scorre solo il contenuto.
 * - Da tablet in su: finestra centrata.
 * - Blocca lo scroll della pagina sottostante e non la "trascina" quando si arriva a fine contenuto.
 */
export default function AdminModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  size = "md",
  stripe = false,
  dismissOnBackdrop = true,
  fixedHeight = false,
  header,
  footer,
  bodyClassName = "p-4 sm:p-6",
  children,
}: AdminModalProps) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    stack.push(id);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack[stack.length - 1] === id) onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      const index = stack.indexOf(id);
      if (index !== -1) stack.splice(index, 1);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, id]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="adm-root fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div
        aria-hidden="true"
        onClick={dismissOnBackdrop ? onClose : undefined}
        className="adm-backdrop absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        tabIndex={-1}
        className={`adm-panel relative flex w-full flex-col overflow-hidden bg-white shadow-2xl outline-none rounded-t-[28px] sm:rounded-3xl ${SIZES[size]} ${
          fixedHeight
            ? "h-[calc(100dvh-1.5rem)] sm:h-[min(88dvh,52rem)]"
            : "max-h-[calc(100dvh-1.5rem)] sm:max-h-[min(88dvh,60rem)]"
        }`}
      >
        {/* Maniglia del foglio (solo mobile) */}
        <div className="flex shrink-0 justify-center pt-2 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-slate-300" />
        </div>
        {stripe && <BrandStripe height="h-1.5 shrink-0" className="hidden sm:flex" />}

        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#008e97] text-white shadow-xs">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 id={`${id}-title`} className="truncate text-base font-bold leading-tight text-slate-900 sm:text-lg">
              {title}
            </h3>
            {subtitle && <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 sm:h-10 sm:w-10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {header}

        <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
