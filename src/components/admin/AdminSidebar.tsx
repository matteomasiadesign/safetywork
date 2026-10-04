import React from "react";
import { LogOut, UserCheck } from "lucide-react";
import AdminLogo from "@/components/admin/AdminLogo";
import type { AdminNavItem, AdminTab } from "@/components/admin/adminNav";

interface AdminSidebarProps {
  items: AdminNavItem[];
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  userEmail: string;
  onLogout: () => void;
}

/** Barra laterale fissa del pannello (solo da 1024px in su: sotto si usano isola, menu e dock). */
export default function AdminSidebar({ items, activeTab, setActiveTab, userEmail, onLogout }: AdminSidebarProps) {
  return (
    <aside className="sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 shadow-xl select-none lg:flex xl:w-72">
      <div className="shrink-0 border-b border-slate-800/80 px-5 py-4">
        <AdminLogo light />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" aria-label="Sezioni">
        <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Sezioni Disponibili</div>

        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#008e97] font-bold text-white shadow-md shadow-[#008e97]/20"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#008e97]"}`} />
                <span className="truncate">{item.label}</span>
                {item.urgent && !isActive && <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-[#df0000]" />}
              </span>

              {item.badge && (
                <span
                  className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-white text-[#008e97]"
                      : item.urgent
                        ? "animate-pulse bg-[#df0000] text-white"
                        : "border border-slate-700/60 bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-800/80 bg-slate-900/95 p-3">
        <div className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-800/40 p-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-[#008e97] shadow-inner">
              <UserCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold leading-tight text-white">Amministratore</div>
              <div className="mt-0.5 truncate text-[10px] text-slate-400">{userEmail || "—"}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-[#df0000]/10 hover:text-[#df0000]"
            title="Disconnetti dalla sessione"
            aria-label="Disconnetti dalla sessione"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
