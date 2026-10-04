import Image from "next/image";
import { ArrowUpRight, ImageOff } from "lucide-react";
import Link from "@/components/ui/Link";

interface AdminTopbarProps {
  title: string;
  /** Richieste nuove, mostrate accanto al titolo. */
  newCount?: number;
  loadError: boolean;
  isCleaning: boolean;
  onCleanup: () => void;
  onOpenMenu: () => void;
}

/**
 * Isola flottante in alto, la stessa della navbar del sito pubblico.
 * Altezza zero: galleggia sopra il contenuto e resta agganciata in alto mentre si scorre.
 */
export default function AdminTopbar({ title, newCount = 0, loadError, isCleaning, onCleanup, onOpenMenu }: AdminTopbarProps) {
  return (
    <header className="sticky top-3 z-40 h-0 px-3 sm:px-4 lg:px-6">
      <div className="flex h-14 items-center gap-2 rounded-full border border-white/70 bg-white/95 pl-3 pr-2 shadow-[0_8px_30px_-10px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/5 backdrop-blur-xl lg:h-[60px] lg:gap-3 lg:pl-6">
        <Image src="/favicon.webp" alt="" width={36} height={36} priority className="h-9 w-9 shrink-0 object-contain lg:hidden" />

        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-slate-400">
            <span className="lg:hidden">Safety Works · Admin</span>
            <span className="hidden lg:inline">Pannello Direzionale</span>
          </div>
          <h1 className="mt-1 truncate font-display text-[1.05rem] font-extrabold leading-none tracking-tight text-slate-900 lg:text-lg">
            {title}
          </h1>
        </div>

        {newCount > 0 && (
          <span
            className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[#df0000] px-2 text-[11px] font-bold text-white"
            aria-label={`${newCount} richieste nuove`}
          >
            <span className="lg:hidden">{newCount}</span>
            <span className="hidden lg:inline">{newCount} nuove</span>
          </span>
        )}

        {/* Strumenti: da desktop sono qui, su mobile stanno nel menu */}
        <div className="hidden items-center gap-2 lg:flex">
          <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className={`h-2 w-2 rounded-full ${loadError ? "bg-[#df0000]" : "bg-emerald-500"}`} />
            {loadError ? "Supabase non raggiungibile" : "Supabase connesso"}
          </span>

          <button
            type="button"
            onClick={onCleanup}
            disabled={isCleaning}
            title="Elimina da Storage le immagini non più usate da corsi, servizi o contenuti del sito"
            className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-900/5 hover:text-slate-900 disabled:opacity-50"
          >
            <ImageOff className="h-4 w-4 text-[#008e97]" />
            <span className="hidden xl:inline">{isCleaning ? "Pulizia..." : "Pulisci immagini"}</span>
          </button>

          <Link
            to="/"
            target="_blank"
            className="group inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-slate-900 pl-4 pr-3 text-sm font-semibold text-white transition-colors hover:bg-[#008e97]"
          >
            Visualizza sito
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Apri il menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white lg:hidden"
        >
          <span className="flex flex-col items-end gap-[5px]">
            <span className="h-[2px] w-[18px] rounded bg-white" />
            <span className="h-[2px] w-[11px] rounded bg-white" />
          </span>
        </button>
      </div>
    </header>
  );
}
