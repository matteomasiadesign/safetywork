/** Classi condivise dei pulsanti admin: altezza minima da dito (44px) su mobile, più compatti da tablet in su. */
const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 disabled:pointer-events-none min-h-[44px] px-4 sm:min-h-[40px]";

export const btnPrimary = `${base} bg-[#df0000] text-white shadow-xs hover:bg-[#b80000] active:bg-[#9f0000]`;
export const btnTeal = `${base} bg-[#008e97] text-white shadow-xs hover:bg-[#00777f] active:bg-[#006e75]`;
export const btnSecondary = `${base} bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300`;
export const btnOutline = `${base} border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 active:bg-slate-100`;

/** Pulsante a sola icona (44x44 su mobile). */
export const iconBtn =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-10 sm:w-10";
