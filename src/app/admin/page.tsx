"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { AdminDataProvider, useAdminData } from "@/context/AdminDataContext";
import { createClient } from "@/lib/supabase/client";
import type { Inquiry } from "@/lib/types/database";
import AdminShell, { type AdminToast } from "@/components/admin/AdminShell";
import type { AdminNavCounts, AdminTab } from "@/components/admin/adminNav";
import InquiriesManager from "@/components/admin/InquiriesManager";
import CoursesManager from "@/components/admin/CoursesManager";
import CategoriesManager from "@/components/admin/CategoriesManager";
import ServicesManager from "@/components/admin/ServicesManager";
import AgendaManager from "@/components/admin/AgendaManager";
import ContentEditor from "@/components/admin/ContentEditor";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";
import { CONTENT_DEFAULTS } from "@/lib/content/schema";

function AdminDashboard() {
  const router = useRouter();
  const {
    categories,
    courses,
    services,
    inquiries,
    events,
    siteContent,
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
    reorderCourses,
    saveService,
    deleteService,
    updateInquiry,
    deleteInquiry,
    saveEvent,
    deleteEvent,
    saveSiteContent,
    cleanupOrphanImages,
  } = useAdminData();

  const [activeTab, setActiveTab] = useState<AdminTab>("inquiries");
  const [toast, setToast] = useState<AdminToast | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [preselectedInquiry, setPreselectedInquiry] = useState<Inquiry | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupConfirmOpen, setCleanupConfirmOpen] = useState(false);
  const [contentDirty, setContentDirty] = useState(false);

  // Cambiare sezione apre "una pagina nuova": si riparte dall'alto.
  const goTo = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0 });
  }, []);

  // Cambiando sezione si perderebbero le modifiche non salvate dell'editor contenuti.
  const handleSelectTab = (tab: AdminTab) => {
    if (tab === activeTab) return;
    if (activeTab === "content" && contentDirty) {
      if (!window.confirm("Hai modifiche non salvate nei Contenuti del Sito. Vuoi uscire e perderle?")) return;
      setContentDirty(false);
    }
    goTo(tab);
  };

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserEmail(data.user?.email ?? ""))
      .catch(() => undefined);
  }, []);

  const showToast = useCallback((message: string, tone: AdminToast["tone"] = "success") => {
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
    setCleanupConfirmOpen(false);
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

  const counts = useMemo<AdminNavCounts>(
    () => ({
      inquiries: inquiries.length,
      newInquiries: inquiries.filter((i) => i.status === "nuovo").length,
      courses: courses.length,
      categories: categories.length,
      services: services.length,
      agenda: events.length,
    }),
    [inquiries, courses, categories, services, events]
  );

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
    <AdminShell
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      counts={counts}
      userEmail={userEmail}
      onLogout={handleLogout}
      loadError={Boolean(loadError)}
      isCleaning={isCleaning}
      onCleanup={() => setCleanupConfirmOpen(true)}
      toast={toast}
    >
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#008e97] border-t-transparent" />
          <span className="text-xs font-semibold tracking-wider text-slate-500">Caricamento dati da Supabase...</span>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-[#df0000]/30 bg-white p-6 text-center shadow-xs sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf2f2] text-[#df0000]">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Impossibile caricare i dati</h2>
          <p className="text-xs leading-relaxed text-slate-600">{loadError}</p>
          <button
            type="button"
            onClick={() => reload()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008e97] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#00777f]"
          >
            <RotateCcw className="h-4 w-4" />
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
                goTo("agenda");
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
              onNavigateToInquiries={() => goTo("inquiries")}
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
              onReorderCourses={reorderCourses}
              onAddCategory={addCategory}
              onNavigateToCategories={() => goTo("categories")}
              showToast={showToast}
              fallbackImage={siteContent["courses.fallback_image"] ?? CONTENT_DEFAULTS["courses.fallback_image"]}
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

          {activeTab === "content" && (
            <ContentEditor overrides={siteContent} onSave={saveSiteContent} showToast={showToast} onDirtyChange={setContentDirty} />
          )}

          {activeTab === "services" && (
            <ServicesManager services={services} onSaveService={saveService} onDeleteService={deleteService} showToast={showToast} />
          )}
        </>
      )}

      <ConfirmDialog
        open={cleanupConfirmOpen}
        title="Eliminare le immagini inutilizzate?"
        confirmLabel="Sì, elimina"
        onConfirm={handleCleanupImages}
        onCancel={() => setCleanupConfirmOpen(false)}
      >
        Verranno cancellate da Storage tutte le foto che non sono più usate da nessun corso, servizio o contenuto del sito.
        L&apos;operazione non è reversibile.
      </ConfirmDialog>
    </AdminShell>
  );
}

export default function AdminPage() {
  return (
    <AdminDataProvider>
      <AdminDashboard />
    </AdminDataProvider>
  );
}
