"use client";

import React, { useEffect, useState } from "react";
import type { AdminNavItem, AdminTab } from "@/components/admin/adminNav";

interface AdminBottomNavProps {
  items: AdminNavItem[];
  activeTab: AdminTab;
  onSelect: (tab: AdminTab) => void;
}

const isTextField = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");

/**
 * Dock di navigazione in basso (solo mobile): le sezioni principali sempre a portata di pollice.
 * Si nasconde mentre si scrive, per non rubare spazio alla tastiera.
 */
export default function AdminBottomNav({ items, activeTab, onSelect }: AdminBottomNavProps) {
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => isTextField(e.target) && setTyping(true);
    const onFocusOut = () => setTyping(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const dockItems = items.filter((item) => item.dock);

  return (
    <nav
      aria-label="Sezioni principali"
      className={`fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 transition-all duration-200 lg:hidden ${
        typing ? "pointer-events-none translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between rounded-full bg-[#0b1320]/95 p-1.5 shadow-[0_14px_40px_-12px_rgba(11,19,32,0.7)] ring-1 ring-white/10 backdrop-blur-xl">
        {dockItems.map((item) => {
          const active = activeTab === item.id;
          const Icon = item.icon;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-full transition-colors ${
                  active ? "bg-[#008e97] text-white" : "text-slate-400 active:bg-white/10"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="max-w-full truncate px-1 text-[10px] font-semibold leading-none">{item.short}</span>
                {item.urgent && (
                  <span className="absolute right-[22%] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b1320] bg-[#df0000]" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
