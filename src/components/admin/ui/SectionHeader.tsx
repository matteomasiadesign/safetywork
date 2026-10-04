import React from "react";

interface SectionHeaderProps {
  icon: React.ReactNode;
  /** Classi del riquadro dell'icona (colori). */
  iconClassName?: string;
  title: string;
  /** Etichetta accanto al titolo (es. "12 corsi"). */
  count?: string;
  /** Descrizione: nascosta su mobile per lasciare spazio al contenuto. */
  description?: string;
  /** Azioni: su mobile occupano la riga accanto al conteggio. */
  actions?: React.ReactNode;
}

/**
 * Intestazione di sezione. Da tablet: icona, titolo, descrizione e azioni.
 * Su mobile il titolo è già nell'isola in alto, quindi resta una sola riga compatta: conteggio + azione principale.
 */
export default function SectionHeader({
  icon,
  iconClassName = "bg-[#e6f6f7] border-[#008e97]/20 text-[#008e97]",
  title,
  count,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4">
      {count && <span className="shrink-0 text-xs font-bold text-slate-500 sm:hidden">{count}</span>}
      {!count && !actions && description && <p className="text-xs text-slate-500 sm:hidden">{description}</p>}

      <div className="hidden min-w-0 items-center gap-3 sm:flex">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-2xs ${iconClassName}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
            {count && (
              <span className="rounded-full border border-slate-200/80 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {count}
              </span>
            )}
          </div>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      </div>

      {actions && <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:flex-none sm:shrink-0 [&>*:last-child]:flex-1 sm:[&>*:last-child]:flex-none">{actions}</div>}
    </div>
  );
}
