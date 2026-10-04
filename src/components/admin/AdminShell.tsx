"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import AdminMobileMenu from "@/components/admin/AdminMobileMenu";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
import { TAB_TITLES, buildNavItems, type AdminNavCounts, type AdminTab } from "@/components/admin/adminNav";

export type AdminToast = { message: string; tone: "success" | "error" };

interface AdminShellProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  counts: AdminNavCounts;
  userEmail: string;
  onLogout: () => void;
  loadError: boolean;
  isCleaning: boolean;
  onCleanup: () => void;
  toast: AdminToast | null;
  children: React.ReactNode;
}

/**
 * Struttura del pannello: barra laterale (desktop), isola in alto, menu a tutto schermo e dock in basso (mobile).
 * Su mobile la pagina scorre normalmente sotto l'isola; il contenuto lascia spazio al dock.
 */
export default function AdminShell({
  activeTab,
  onSelectTab,
  counts,
  userEmail,
  onLogout,
  loadError,
  isCleaning,
  onCleanup,
  toast,
  children,
}: AdminShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useMemo(() => buildNavItems(counts), [counts]);

  const select = (tab: AdminTab) => {
    setMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <div className="adm-root flex min-h-dvh bg-slate-100 text-slate-900">
      {toast && (
        <div
          role="status"
          className={`fixed inset-x-3 top-[5rem] z-[80] flex items-center gap-3 rounded-2xl border px-4 py-3 text-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-auto sm:max-w-sm ${
            toast.tone === "error" ? "border-[#df0000] bg-[#9f0000]" : "border-slate-700 bg-slate-900"
          }`}
        >
          {toast.tone === "error" ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#19b8c2]" />
          )}
          <span className="text-sm font-medium sm:text-xs">{toast.message}</span>
        </div>
      )}

      <AdminSidebar items={items} activeTab={activeTab} setActiveTab={select} userEmail={userEmail} onLogout={onLogout} />

      {/* overflow-x-clip (non hidden): hidden farebbe di questo contenitore uno scroll container e romperebbe lo sticky dell'isola */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
        <AdminTopbar
          title={TAB_TITLES[activeTab]}
          newCount={activeTab === "inquiries" ? counts.newInquiries : 0}
          loadError={loadError}
          isCleaning={isCleaning}
          onCleanup={onCleanup}
          onOpenMenu={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[5rem] sm:px-5 lg:px-6 lg:pb-8 lg:pt-[5.25rem]">
          {children}
        </main>
      </div>

      <AdminBottomNav items={items} activeTab={activeTab} onSelect={select} />
      <AdminMobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
        activeTab={activeTab}
        onSelect={select}
        userEmail={userEmail}
        loadError={loadError}
        isCleaning={isCleaning}
        onCleanup={() => {
          setMenuOpen(false);
          onCleanup();
        }}
        onLogout={onLogout}
      />
    </div>
  );
}
