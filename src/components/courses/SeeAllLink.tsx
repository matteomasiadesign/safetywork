import React from "react";
import Link from "@/components/ui/Link";
import { ArrowRight } from "lucide-react";

/** Pulsante d'invito a vedere l'elenco completo (sotto le anteprime da 4 corsi). */
export default function SeeAllLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex w-fit items-center gap-3 rounded-full bg-slate-900 py-3 pl-6 pr-3 text-sm font-bold text-white transition-colors hover:bg-[#008e97]"
    >
      <span>{children}</span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
