import React from "react";
import {
  Shield,
  Inbox,
  BookOpen,
  Tag,
  Layers,
  LogOut,
  X,
  UserCheck,
  CalendarDays,
} from "lucide-react";

export type AdminTab = "inquiries" | "agenda" | "courses" | "categories" | "services";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  inquiriesCount: number;
  newInquiriesCount: number;
  coursesCount: number;
  categoriesCount: number;
  servicesCount: number;
  agendaEventsCount?: number;
  isSupabaseActive: boolean;
  onExportJson?: () => void;
  onResetClick?: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  inquiriesCount,
  newInquiriesCount,
  coursesCount,
  categoriesCount,
  servicesCount,
  agendaEventsCount,
  isSupabaseActive,
  onExportJson,
  onResetClick,
  onLogout,
  mobileOpen,
  setMobileOpen,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: "inquiries" as AdminTab,
      label: "Richieste dal Sito",
      badge: newInquiriesCount > 0 ? `${newInquiriesCount} nuove` : inquiriesCount > 0 ? `${inquiriesCount}` : undefined,
      badgeColor: newInquiriesCount > 0 ? "bg-[#df0000] text-white animate-pulse" : "bg-slate-800 text-slate-400 border border-slate-700/60",
      icon: Inbox,
      highlight: newInquiriesCount > 0,
    },
    {
      id: "agenda" as AdminTab,
      label: "Agenda & Calendario",
      badge: agendaEventsCount !== undefined && agendaEventsCount > 0 ? `${agendaEventsCount}` : undefined,
      badgeColor: "bg-[#e6f6f7] text-[#008e97] border border-[#008e97]/30",
      icon: CalendarDays,
    },
    {
      id: "courses" as AdminTab,
      label: "Gestione Corsi",
      badge: `${coursesCount}`,
      badgeColor: "bg-slate-800 text-slate-400 border border-slate-700/60",
      icon: BookOpen,
    },
    {
      id: "categories" as AdminTab,
      label: "Categorie Corsi",
      badge: `${categoriesCount}`,
      badgeColor: "bg-slate-800 text-slate-400 border border-slate-700/60",
      icon: Tag,
    },
    {
      id: "services" as AdminTab,
      label: "Gestione Servizi",
      badge: `${servicesCount}`,
      badgeColor: "bg-slate-800 text-slate-400 border border-slate-700/60",
      icon: Layers,
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 border-r border-slate-800 select-none">
      {/* Streamlined Brand Header with Status */}
      <div className="px-4 py-3.5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#008e97] to-[#006e75] text-white flex items-center justify-center shadow-md shadow-[#008e97]/20 border border-white/10 shrink-0">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-black tracking-tight text-white">
                  SAFETY<span className="text-[#008e97]">WORK</span>
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider text-white bg-[#df0000] px-1 py-0.5 rounded shadow-xs">
                  ADMIN
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isSupabaseActive ? "bg-emerald-400 animate-pulse" : "bg-[#f58220]"
                  }`}
                />
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  {isSupabaseActive ? "Supabase Cloud" : "Database Locale"}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            title="Chiudi menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sections (Clean, Compact, No ugly scrollbar) */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Sezioni Disponibili
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#008e97] text-white shadow-md shadow-[#008e97]/20 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-[#008e97]"
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#df0000] animate-ping shrink-0" />
                )}
              </div>

              {item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-2 ${
                    isActive
                      ? "bg-white text-[#008e97]"
                      : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer: Refined User Profile & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/95 shrink-0">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/40 border border-slate-800/80 hover:border-slate-700/80 transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-[#008e97] shrink-0 shadow-inner">
              <UserCheck className="w-4 h-4 text-[#008e97]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate leading-tight">Admin Master</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">admin@safetyworks.it</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-[#df0000] hover:bg-[#df0000]/10 transition-colors shrink-0"
            title="Disconnetti dalla sessione"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 h-screen sticky top-0 shrink-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs animate-in fade-in"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
