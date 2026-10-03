"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ExternalLink, ImageOff, Menu, RotateCcw } from "lucide-react";
import Link from "@/components/ui/Link";
import { AdminDataProvider, useAdminData } from "@/context/AdminDataContext";
import { createClient } from "@/lib/supabase/client";
import type { Inquiry } from "@/lib/types/database";
import AdminSidebar, { AdminTab } from "@/components/admin/AdminSidebar";
import InquiriesManager from "@/components/admin/InquiriesManager";
import CoursesManager from "@/components/admin/CoursesManager";
import CategoriesManager from "@/components/admin/CategoriesManager";
import ServicesManager from "@/components/admin/ServicesManager";
import AgendaManager from "@/components/admin/AgendaManager";

type Toast = { message: string; tone: "success" | "error" };

const TAB_TITLES: Record<AdminTab, string> = {
  inquiries: "Richieste dal Sito",
  agenda: "Agenda & Calendario",
  courses: "Catalogo Corsi",
  categories: "Categorie Formative",
  services: "Servizi HSE",
};

function AdminDashboard() {
  const router = useRouter();
  const {
    categories,
    courses,
    services,
    inquiries,
    events,
    isLoading,
    loadError,
    reload,
    addCategory,
    renameCategory,
    deleteCategory,
    saveCourse,
    setCourseFlags,
    deleteCourse,
    duplicateCourse,
    saveService,
    deleteService,
    updateInquiry,
    deleteInquiry,
    saveEvent,
    deleteEvent,
    cleanupOrphanImages,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<AdminTab>("inquiries");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [preselectedInquiry, setPreselectedInquiry] = useState<Inquiry | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email ?? ""))
      .catch(() => undefined);
  }, []);

  const showToast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.tone === "error" ? 6000 : 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleLogout = async () => {
    try {
      await createClient().auth.signOut();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  const handleCleanupImages = async () => {
    setIsCleaning(true);
    try {
      const removed = await cleanupOrphanImages();
      showToast(
        removed === 0
          ? "Nessuna immagine inutilizzata: Storage è già pulito."
          : `Rimosse ${removed} immagini inutilizzate da Storage.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Pulizia non riuscita.", "error");
    } finally {
      setIsCleaning(false);
    }
  };

  const newInquiriesCount = useMemo(() => inquiries.filter((i) => i.status === "nuovo").length, [inquiries]);

  const handleUpdateInquiry = (id: string, status: Inquiry["status"], notes?: string) => {
    updateInquiry(id, { status, notes }).catch((err) =>
      showToast(err instanceof Error ? err.message : "Aggiornamento non riuscito.", "error")
    );
  };

  const handleDeleteInquiry = (id: string) => {
    deleteInquiry(id)
      .then(() => showToast("Richiesta eliminata."))
      .catch((err) => showToast(err instanceof Error ? err.message : "Eliminazione non riuscita.", "error"));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[60] max-w-sm text-white px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            toast.tone === "error" ? "bg-[#9f0000] border-[#df0000]" : "bg-slate-900 border-slate-700"
          }`}
        >
          {toast.tone === "error" ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#008e97]" />
          )}
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inquiriesCount={inquiries.length}
        newInquiriesCount={newInquiriesCount}
        coursesCount={courses.length}
        categoriesCount={categories.length}
        servicesCount={services.length}
        agendaEventsCount={events.length}
        userEmail={userEmail}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Pannello Direzionale</span>
            <span className="text-xs text-slate-300 hidden sm:inline">/</span>
            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
              {TAB_TITLES[activeTab]}
            </h1>
            {activeTab === "inquiries" && newInquiriesCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#df0000] text-white px-2 py-0.5 rounded-full animate-pulse shrink-0">
                {newInquiriesCount} nuove
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${loadError ? "bg-[#df0000]" : "bg-emerald-500"}`} />
              <span>{loadError ? "Supabase non raggiungibile" : "Supabase connesso"}</span>
            </div>

            <button
              type="button"
              onClick={handleCleanupImages}
              disabled={isCleaning}
              className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-[#e6f6f7] hover:text-[#008e97] text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs disabled:opacity-50"
              title="Elimina da Storage le immagini non più usate da nessun corso o servizio"
            >
              <ImageOff className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#008e97]" />
              <span className="hidden lg:inline ml-1.5">{isCleaning ? "Pulizia..." : "Pulisci immagini"}</span>
            </button>

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-[#e6f6f7] hover:text-[#008e97] text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
              title="Visualizza Sito"
            >
              <ExternalLink className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#008e97]" />
              <span className="hidden md:inline ml-1.5">Visualizza Sito</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 transition-colors"
              title="Apri menu sezioni"
              aria-label="Apri menu sezioni"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 border-[3px] border-[#008e97] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500 tracking-wider">Caricamento dati da Supabase...</span>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="max-w-lg mx-auto bg-white rounded-3xl border border-[#df0000]/30 p-8 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#fdf2f2] text-[#df0000] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Impossibile caricare i dati</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{loadError}</p>
              <button
                type="button"
                onClick={() => reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008e97] hover:bg-[#00777f] text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Riprova</span>
              </button>
            </div>
          )}

          {!isLoading && !loadError && (
            <>
              {activeTab === "inquiries" && (
                <InquiriesManager
                  inquiries={inquiries}
                  onUpdateStatus={handleUpdateInquiry}
                  onDeleteInquiry={handleDeleteInquiry}
                  onScheduleInquiry={(inq) => {
                    setPreselectedInquiry(inq);
                    setActiveTab("agenda");
                  }}
                />
              )}

              {activeTab === "agenda" && (
                <AgendaManager
                  events={events}
                  onSaveEvent={saveEvent}
                  onDeleteEvent={deleteEvent}
                  courses={courses}
                  inquiries={inquiries}
                  preselectedInquiry={preselectedInquiry}
                  onClearPreselectedInquiry={() => setPreselectedInquiry(null)}
                  onNavigateToInquiries={() => setActiveTab("inquiries")}
                  showToast={showToast}
                />
              )}

              {activeTab === "courses" && (
                <CoursesManager
                  courses={courses}
                  categories={categories}
                  onSaveCourse={saveCourse}
                  onToggleCourse={setCourseFlags}
                  onDeleteCourse={deleteCourse}
                  onDuplicateCourse={duplicateCourse}
                  onAddCategory={addCategory}
                  onNavigateToCategories={() => setActiveTab("categories")}
                  showToast={showToast}
                />
              )}

              {activeTab === "categories" && (
                <CategoriesManager
                  categories={categories}
                  courses={courses}
                  onAddCategory={addCategory}
                  onRenameCategory={renameCategory}
                  onDeleteCategory={deleteCategory}
                  showToast={showToast}
                />
              )}

              {activeTab === "services" && (
                <ServicesManager
                  services={services}
                  onSaveService={saveService}
                  onDeleteService={deleteService}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminDataProvider>
      <AdminDashboard />
    </AdminDataProvider>
  );
}
