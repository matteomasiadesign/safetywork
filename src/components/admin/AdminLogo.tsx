import Image from "next/image";

/** Logo del sito pubblico (stesso marchio e stesso carattere della navbar) con l'etichetta ADMIN. */
export default function AdminLogo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/favicon.webp" alt="" width={36} height={36} priority className="h-9 w-9 shrink-0 object-contain" />
      <span className="flex min-w-0 items-center gap-2">
        <span className={`font-display text-[1.2rem] font-extrabold leading-none tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
          SAFETY<span className="text-[#19b8c2]">WORKS</span>
        </span>
        <span className="rounded bg-[#df0000] px-1.5 py-0.5 text-[9px] font-black uppercase leading-none tracking-wider text-white">
          Admin
        </span>
      </span>
    </span>
  );
}
