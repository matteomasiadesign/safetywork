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

/** Scorrimento (px) in una direzione prima di cambiare forma: evita sfarfallii per movimenti minimi. */
const DOWN_THRESHOLD = 12;
const UP_THRESHOLD = 8;
/** Sotto questa altezza dalla cima il dock è sempre a dimensione piena. */
const TOP_ZONE = 48;

/**
 * Dock di navigazione in basso (solo mobile): le sezioni principali sempre a portata di pollice.
 * - Scorrendo verso il basso si rimpicciolisce (solo icone), con un breve scroll verso l'alto torna a dimensione piena.
 * - Si nasconde mentre si scrive, per non rubare spazio alla tastiera.
 */
export default function AdminBottomNav({ items, activeTab, onSelect }: AdminBottomNavProps) {
  const [typing, setTyping] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let travelled = 0; // scorrimento accumulato nella direzione corrente (positivo = giù)
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      if (y < TOP_ZONE) {
        travelled = 0;
        setCompact(false);
        return;
      }
      // cambiando direzione si riparte da zero
      travelled = Math.sign(delta) === Math.sign(travelled) ? travelled + delta : delta;
      if (travelled > DOWN_THRESHOLD) setCompact(true);
      else if (travelled < -UP_THRESHOLD) setCompact(false);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

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
      <ul
        className={`mx-auto flex items-stretch justify-between rounded-full bg-[#0b1320]/95 shadow-[0_14px_40px_-12px_rgba(11,19,32,0.7)] ring-1 ring-white/10 backdrop-blur-xl transition-[max-width,padding] duration-300 ease-out ${
          compact ? "max-w-[17.5rem] p-1" : "max-w-md p-1.5"
        }`}
      >
        {dockItems.map((item) => {
          const active = activeTab === item.id;
          const Icon = item.icon;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-current={active ? "page" : undefined}
                aria-label={compact ? item.short : undefined}
                className={`relative flex w-full flex-col items-center justify-center rounded-full transition-[height,background-color,color] duration-300 ease-out ${
                  compact ? "h-11" : "h-[52px]"
                } ${active ? "bg-[#008e97] text-white" : "text-slate-400 active:bg-white/10"}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={`max-w-full overflow-hidden truncate px-1 text-[10px] font-semibold leading-none transition-[max-height,opacity,margin] duration-300 ease-out ${
                    compact ? "mt-0 max-h-0 opacity-0" : "mt-0.5 max-h-3 opacity-100"
                  }`}
                >
                  {item.short}
                </span>
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
