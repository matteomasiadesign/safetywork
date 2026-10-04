"use client";

import React, { useEffect } from "react";
import { ArrowUpRight, ImageOff, LogOut, X } from "lucide-react";
import Link from "@/components/ui/Link";
import AdminLogo from "@/components/admin/AdminLogo";
import { useBodyScrollLock } from "@/components/admin/ui/useBodyScrollLock";
import type { AdminNavItem, AdminTab } from "@/components/admin/adminNav";

interface AdminMobileMenuProps {
  open: boolean;
  onClose: () => void;
  items: AdminNavItem[];
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
  userEmail: string;
  loadError: boolean;
  isCleaning: boolean;
  onCleanup: () => void;
  onLogout: () => void;
}

/** Menu a tutto schermo, stesso pannello scuro del menu mobile del sito pubblico. */
export default function AdminMobileMenu({
  open,
  onClose,
  items,
  activeTab,
  onSelect,
  userEmail,
  loadError,
  isCleaning,
  onCleanup,
  onLogout,
}: AdminMobileMenuProps) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="adm-root fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button
        type="button"
        aria-label="Chiudi il menu"
        onClick={onClose}
        className="hero-fade absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />

      <div className="hero-fade absolute inset-x-3 bottom-3 top-3 flex flex-col overflow-hidden rounded-[28px] bg-[#0b1320] text-white shadow-2xl">
        <div className="flex h-[68px] shrink-0 items-center justify-between pl-5 pr-3">
          <AdminLogo light />
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi il menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-3 pt-1" aria-label="Sezioni">
          <ul>
            {items.map((item, i) => {
              const active = activeTab === item.id;
              return (
                <li
                  key={item.id}
                  className="hero-fade border-b border-white/10"
                  style={{ ["--d" as string]: `${100 + i * 55}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    aria-current={active ? "page" : undefined}
                    className="flex w-full items-center gap-3 py-3.5 text-left"
                  >
                    <span className="w-6 shrink-0 font-mono text-[11px] text-slate-500">0{i + 1}</span>
                    <span className={`font-display text-[1.7rem] font-bold leading-none tracking-tight ${active ? "text-white" : "text-slate-300"}`}>
                      {item.short}
                    </span>
                    {active && <span className="h-2 w-2 shrink-0 rounded-full bg-[#19b8c2]" />}
                    {item.badge && (
                      <span
                        className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          item.urgent ? "bg-[#df0000] text-white" : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hero-fade shrink-0 space-y-2.5 border-t border-white/10 p-4" style={{ ["--d" as string]: "420ms" }}>
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/"
              target="_blank"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
            >
              Vedi il sito
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={onCleanup}
              disabled={isCleaning}
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <ImageOff className="h-4 w-4 text-[#19b8c2]" />
              {isCleaning ? "Pulizia..." : "Pulisci immagini"}
            </button>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 py-2 pl-4 pr-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${loadError ? "bg-[#df0000]" : "bg-emerald-400"}`} />
                {loadError ? "Supabase non raggiungibile" : "Supabase connesso"}
              </div>
              <div className="truncate text-sm font-semibold text-white">{userEmail || "Amministratore"}</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#df0000]/90 px-4 text-sm font-semibold text-white transition-colors hover:bg-[#df0000]"
            >
              <LogOut className="h-4 w-4" />
              Esci
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
