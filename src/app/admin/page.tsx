"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "@/components/ui/Link";
import { useRouter } from "next/navigation";
import { useData } from "@/context/DataContext";
import { Course, ServiceItem, Inquiry } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";
import AdminSidebar, { AdminTab } from "@/components/admin/AdminSidebar";
import InquiriesManager from "@/components/admin/InquiriesManager";
import CoursesManager from "@/components/admin/CoursesManager";
import AgendaManager from "@/components/admin/AgendaManager";
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileText,
  GraduationCap,
  FileCheck,
  ShieldAlert,
  Activity,
  Flame,
  HardHat,
  Building,
  Scale,
  Wrench,
  Users,
  PhoneCall,
  Upload,
  HelpCircle,
  Database,
  Download,
  ClipboardCheck,
  BookOpen,
  ArrowRight,
  X,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Layers,
  Award,
  MapPin,
  Tag,
  FolderPlus,
  Menu,
  Inbox,
} from "lucide-react";

// Admin Authentication storage key
const ADMIN_AUTH_KEY = "safety_works_admin_authenticated";

// Icon options for Services
const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  FileCheck,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Flame,
  HardHat,
  Building,
  Scale,
  Wrench,
  Users,
  PhoneCall,
};

// Preset images for rapid course setup
const COURSE_IMAGE_PRESETS = [
  {
    label: "Cantiere & Costruzioni",
    url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Antincendio & Emergenze",
    url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Primo Soccorso Medico",
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Carrelli & Muletti",
    url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Lavori in Quota & DPI 3ª Cat",
    url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Dirigenza & RSPP",
    url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Formazione Lavoratori Generale",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "Ufficio & VDT",
    url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const {
    courses,
    services,
    categories,
    inquiries,
    isSupabaseActive,
    addCourse,
    updateCourse,
    deleteCourse,
    duplicateCourse,
    addCategory,
    updateCategory,
    deleteCategory,
    addService,
    updateService,
    deleteService,
    updateInquiryStatus,
    deleteInquiry,
    resetToDefaults,
  } = useData();

  // Hydration guard: ensures identical render on SSR and client initial mount
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [authEmail, setAuthEmail] = useState("admin@safetyworks.it");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Mount effect to check sessionStorage and localStorage safely after initial hydration
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
      if (auth) {
        setIsAuthenticated(true);
      }
      try {
        const saved = localStorage.getItem("safety_works_agenda_events_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setAgendaEventsCount(parsed.length);
        }
      } catch {}
    }
  }, []);

  // Monitora sessione attiva Supabase
  useEffect(() => {
    if (isSupabaseActive) {
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
        }
      });
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(Boolean(session));
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [isSupabaseActive]);

  // Navigation & Active Tab (Default to inquiries as requested)
  const [activeTab, setActiveTab] = useState<AdminTab>("inquiries");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agendaEventsCount, setAgendaEventsCount] = useState<number>(10);
  const [preselectedInquiry, setPreselectedInquiry] = useState<Inquiry | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tutti");

  // Category management local state
  const [newCatInput, setNewCatInput] = useState("");
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<string | null>(null);
  const [isQuickAddCatOpen, setIsQuickAddCatOpen] = useState(false);
  const [quickNewCat, setQuickNewCat] = useState("");
  const [newCourseTrigger, setNewCourseTrigger] = useState(0);

  // Modals & Drawers
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    type: "course" | "service";
    id: string;
    title: string;
  } | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Service Add/Edit
  const [serviceForm, setServiceForm] = useState<{
    code: string;
    title: string;
    law: string;
    image: string;
    description: string;
    deliverables: string[];
    newDeliverable: string;
    iconName: string;
    badgeColor: "cyan" | "orange" | "red";
    link: string;
  }>({
    code: "",
    title: "",
    law: "D.Lgs. 81/08",
    image: COURSE_IMAGE_PRESETS[1].url,
    description: "",
    deliverables: ["Sopralluogo preliminare e check-up normativo", "Redazione relazione tecnica asseverata"],
    newDeliverable: "",
    iconName: "ShieldAlert",
    badgeColor: "cyan",
    link: "/#contatti",
  });

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Set document title
  useEffect(() => {
    document.title = "Pannello Amministrazione | Safety Work S.r.l.s.";
  }, []);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);

    if (isSupabaseActive) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (error) {
          setAuthError(`Credenziali errate: ${error.message}`);
          setIsLoggingIn(false);
          return;
        }

        if (data.session) {
          setIsAuthenticated(true);
          sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
          showToast("Accesso Amministratore effettuato con successo!");
        }
      } catch (err: any) {
        setAuthError(`Errore di connessione a Supabase: ${err.message || err}`);
      }
    } else {
      // Modalità locale protetta
      if (
        (authEmail.trim().toLowerCase() === "admin@safetyworks.it" &&
          authPassword === "SafetyWork2026!") ||
        (authEmail.trim().toLowerCase() === "admin@safetyworks.it" &&
          authPassword === "admin123")
      ) {
        setIsAuthenticated(true);
        sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
        showToast("Accesso effettuato in modalità sviluppo locale.");
      } else {
        setAuthError("Credenziali non valide. Usa admin@safetyworks.it / SafetyWork2026!");
      }
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    if (isSupabaseActive) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    showToast("Disconnessione effettuata.");
  };

  // Category Management Handlers
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatInput.trim()) return;
    const success = addCategory(newCatInput.trim());
    if (success) {
      showToast(`Categoria "${newCatInput.trim()}" creata con successo!`);
      setNewCatInput("");
    } else {
      alert("La categoria inserita esiste già o non è valida.");
    }
  };

  const handleQuickAddCategory = () => {
    if (!quickNewCat.trim()) return;
    const success = addCategory(quickNewCat.trim());
    if (success) {
      showToast(`Categoria "${quickNewCat.trim()}" creata con successo!`);
      setQuickNewCat("");
      setIsQuickAddCatOpen(false);
    } else {
      alert("La categoria inserita esiste già.");
    }
  };

  const handleSaveEditCategory = () => {
    if (!editingCategory || !editingCategory.newName.trim()) return;
    const success = updateCategory(editingCategory.oldName, editingCategory.newName.trim());
    if (success) {
      showToast(`Categoria rinominata in "${editingCategory.newName.trim()}" e corsi aggiornati!`);
      setEditingCategory(null);
    } else {
      alert("Nome categoria non valido o già esistente.");
    }
  };

  const handleDeleteCategory = (catName: string) => {
    const success = deleteCategory(catName);
    if (success) {
      showToast(`Categoria "${catName}" eliminata.`);
      setDeleteCategoryConfirm(null);
    } else {
      alert("Impossibile eliminare l'unica categoria rimanente.");
    }
  };

  // Open Service Modal for Creation
  const openNewServiceModal = () => {
    setEditingService(null);
    setServiceForm({
      code: `SRV-0${services.length + 1}`,
      title: "",
      law: "Titolo IV D.Lgs. 81/08",
      image: COURSE_IMAGE_PRESETS[1].url,
      description: "",
      deliverables: [
        "Incarico e nomina formale asseverata",
        "Sopralluoghi e redazione verbali di controllo",
        "Assistenza in caso di ispezione ASL / Vigili del Fuoco",
      ],
      newDeliverable: "",
      iconName: "ShieldAlert",
      badgeColor: "cyan",
      link: "/#contatti",
    });
    setIsServiceModalOpen(true);
  };

  // Open Service Modal for Edit
  const openEditServiceModal = (service: ServiceItem) => {
    setEditingService(service);
    setServiceForm({
      code: service.code,
      title: service.title,
      law: service.law,
      image: service.image,
      description: service.description,
      deliverables: [...service.deliverables],
      newDeliverable: "",
      iconName: service.iconName || "ShieldAlert",
      badgeColor: service.badgeColor || "cyan",
      link: service.link || "/#contatti",
    });
    setIsServiceModalOpen(true);
  };

  // Save Service (Create or Update)
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      alert("Inserisci il titolo del servizio.");
      return;
    }

    if (editingService) {
      updateService(editingService.id, {
        code: serviceForm.code,
        title: serviceForm.title,
        law: serviceForm.law,
        image: serviceForm.image,
        description: serviceForm.description,
        deliverables: serviceForm.deliverables,
        iconName: serviceForm.iconName,
        badgeColor: serviceForm.badgeColor,
        link: serviceForm.link,
      });
      showToast(`Servizio "${serviceForm.title}" aggiornato!`);
    } else {
      addService({
        code: serviceForm.code,
        title: serviceForm.title,
        law: serviceForm.law,
        image: serviceForm.image,
        description: serviceForm.description,
        deliverables: serviceForm.deliverables,
        iconName: serviceForm.iconName,
        badgeColor: serviceForm.badgeColor,
        link: serviceForm.link,
      });
      showToast(`Nuovo servizio "${serviceForm.title}" aggiunto al sito!`);
    }

    setIsServiceModalOpen(false);
  };

  // Image Upload for Service
  const handleServiceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("L'immagine è troppo grande (limite: 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setServiceForm((prev) => ({ ...prev, image: event.target!.result as string }));
        showToast("Immagine servizio caricata!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Deliverables management for Service
  const handleAddDeliverable = () => {
    if (!serviceForm.newDeliverable.trim()) return;
    setServiceForm((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, prev.newDeliverable.trim()],
      newDeliverable: "",
    }));
  };

  const handleRemoveDeliverable = (idx: number) => {
    setServiceForm((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }));
  };

  // Delete Action Confirm
  const executeDelete = () => {
    if (!deleteConfirmModal) return;
    if (deleteConfirmModal.type === "course") {
      deleteCourse(deleteConfirmModal.id);
      showToast(`Corso eliminato.`);
    } else {
      deleteService(deleteConfirmModal.id);
      showToast(`Servizio eliminato.`);
    }
    setDeleteConfirmModal(null);
  };

  // Duplicate Course Action
  const handleDuplicateCourse = (id: string) => {
    const dup = duplicateCourse(id);
    if (dup) {
      showToast(`Corso duplicato come bozza con successo!`);
    }
  };

  // Reset to Defaults Action
  const handleResetConfirm = () => {
    resetToDefaults();
    setResetConfirmOpen(false);
    showToast("Catalogo, categorie e servizi ripristinati ai dati iniziali!");
  };

  // Export Data JSON
  const handleExportJson = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      categories,
      courses,
      services,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `safety-works-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup JSON scaricato con successo!");
  };

  // Copy Supabase SQL script
  const supabaseSqlScript = `-- =========================================================================
-- MIGRATION SCRIPT SUPABASE PER SAFETY WORK S.R.L.S.
-- Esegui questo script nel Supabase SQL Editor per generare le tabelle
-- e configurare le policies per il pannello amministratore.
-- =========================================================================

-- 1. Tabella Corsi
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  content TEXT NOT NULL,
  duration_hours NUMERIC DEFAULT 8,
  mode TEXT DEFAULT 'Aula in presenza',
  validity_years NUMERIC DEFAULT 5,
  normative_ref TEXT NOT NULL,
  target_audience TEXT,
  certification_issued TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_open_for_enrollment BOOLEAN DEFAULT true,
  seats_available NUMERIC DEFAULT 6,
  image_url TEXT,
  period TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabella Servizi
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  law TEXT NOT NULL,
  image TEXT,
  description TEXT NOT NULL,
  deliverables JSONB DEFAULT '[]'::jsonb,
  icon_name TEXT DEFAULT 'ShieldAlert',
  badge_color TEXT DEFAULT 'cyan',
  display_order NUMERIC DEFAULT 1,
  link TEXT DEFAULT '/#contatti',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Abilita Row Level Security (RLS)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. Politiche di Lettura Pubblica (Tutti possono visualizzare corsi e servizi)
CREATE POLICY "Allow public read courses" ON public.courses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read services" ON public.services
  FOR SELECT USING (true);

-- 5. Politiche di Scrittura per Utenti Autenticati (Amministratori)
CREATE POLICY "Allow authenticated insert courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update courses" ON public.courses
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete courses" ON public.courses
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update services" ON public.services
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete services" ON public.services
  FOR DELETE TO authenticated USING (true);

-- 6. Configurazione Storage Bucket per Immagini
INSERT INTO storage.buckets (id, name, public)
VALUES ('safety-assets', 'safety-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Storage Assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'safety-assets');

CREATE POLICY "Authenticated Upload Assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'safety-assets');
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlScript);
    setCopiedSql(true);
    showToast("Script SQL copiato negli appunti!");
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = selectedCategory === "Tutti" || c.category === selectedCategory;
      const matchQuery =
        searchQuery === "" ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.normative_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.location && c.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [courses, selectedCategory, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const openEnrollment = courses.filter((c) => c.is_open_for_enrollment).length;
    const totalCategories = categories.length;
    const totalSeats = courses.reduce((acc, curr) => acc + (curr.seats_available || 0), 0);
    const totalServices = services.length;
    return { totalCourses, openEnrollment, totalCategories, totalSeats, totalServices };
  }, [courses, services, categories]);

  const newInquiriesCount = useMemo(() => {
    return inquiries.filter((i) => i.status === "nuovo").length;
  }, [inquiries]);

  // Filtered services for Services tab
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.law.toLowerCase().includes(q)
    );
  }, [services, searchQuery]);

  // --------------------------------------------------------------------------
  // RENDER: HYDRATION GUARD (Renders identical placeholder on server and client)
  // --------------------------------------------------------------------------
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-900 bg-tech-grid-dark flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#008e97] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400 tracking-wider">Caricamento pannello...</span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: LOGIN SCREEN IF NOT AUTHENTICATED
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 bg-tech-grid-dark flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
        <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-[#008e97] via-[#f58220] to-[#df0000]" />

          <div className="p-8 sm:p-10">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#e6f6f7] border border-[#008e97]/30 flex items-center justify-center text-[#008e97] mb-3 shadow-inner">
                <Shield className="w-8 h-8 stroke-[2.2]" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                SAFETY<span className="text-[#008e97]">WORK</span> Admin
              </h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
                Pannello di Gestione Corsi & Servizi
              </p>
            </div>

            {authError && (
              <div className="mb-6 p-3.5 rounded-xl bg-[#fdf2f2] border border-[#df0000]/30 text-[#df0000] text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Amministratore
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="admin@safetyworks.it"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 px-4 bg-[#008e97] hover:bg-[#00777f] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoggingIn ? "Verifica credenziali..." : "Accedi al Pannello"}</span>
                {!isLoggingIn && <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{isSupabaseActive ? "Protetto da Supabase Auth" : "Modalità Locale Attiva"}</span>
              <span className="font-mono">SSL 256-bit</span>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-500 hover:text-[#008e97] transition-colors inline-flex items-center gap-1"
              >
                <span>← Torna al sito pubblico</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: AUTHENTICATED ADMIN DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#008e97]" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar Dashboard */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inquiriesCount={inquiries.length}
        newInquiriesCount={newInquiriesCount}
        coursesCount={courses.length}
        categoriesCount={categories.length}
        servicesCount={services.length}
        agendaEventsCount={agendaEventsCount}
        isSupabaseActive={isSupabaseActive}
        onExportJson={handleExportJson}
        onResetClick={() => setResetConfirmOpen(true)}
        onLogout={handleLogout}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Right Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Workspace Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Apri menu sezioni"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Pannello Direzionale</span>
                <span className="text-xs text-slate-300 hidden sm:inline">/</span>
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                  {activeTab === "inquiries" && "Richieste dal Sito"}
                  {activeTab === "agenda" && "Agenda & Calendario"}
                  {activeTab === "courses" && "Catalogo Corsi"}
                  {activeTab === "categories" && "Categorie Formative"}
                  {activeTab === "services" && "Servizi HSE"}
                </h1>
                {activeTab === "inquiries" && newInquiriesCount > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#df0000] text-white px-2 py-0.5 rounded-full animate-pulse">
                    {newInquiriesCount} nuove
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Top Global Status & Site Link */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span>{isSupabaseActive ? "Supabase Cloud" : "Storage Locale"}</span>
            </div>

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#e6f6f7] hover:text-[#008e97] text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#008e97]" />
              <span className="hidden md:inline">Visualizza Sito</span>
            </Link>
          </div>
        </header>

        {/* Main Workspace Viewport */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto">
          {/* ================================================================= */}
          {/* TAB 0: RICHIESTE DAL SITO & PRENOTAZIONI CORSI */}
          {/* ================================================================= */}
          {activeTab === "inquiries" && (
            <InquiriesManager
              inquiries={inquiries}
              onUpdateStatus={updateInquiryStatus}
              onDeleteInquiry={deleteInquiry}
              onScheduleInquiry={(inq) => {
                setPreselectedInquiry(inq);
                setActiveTab("agenda");
              }}
            />
          )}

          {/* ================================================================= */}
          {/* TAB 0.5: AGENDA & CALENDARIO OPERATIVO (NEW) */}
          {/* ================================================================= */}
          {activeTab === "agenda" && (
            <AgendaManager
              courses={courses}
              inquiries={inquiries}
              preselectedInquiry={preselectedInquiry}
              onClearPreselectedInquiry={() => setPreselectedInquiry(null)}
              onNavigateToInquiries={() => setActiveTab("inquiries")}
              showToast={showToast}
            />
          )}

          {/* ================================================================= */}
          {/* TAB 1: GESTIONE CORSI */}
          {/* ================================================================= */}
          {activeTab === "courses" && (
            <CoursesManager
              courses={courses}
              categories={categories}
              onAddCourse={addCourse}
              onUpdateCourse={updateCourse}
              onDeleteCourse={deleteCourse}
              onDuplicateCourse={handleDuplicateCourse}
              onAddCategory={addCategory}
              onNavigateToCategories={() => setActiveTab("categories")}
              showToast={showToast}
              externalOpenAddModalTrigger={newCourseTrigger}
            />
          )}

        {/* ================================================================= */}
        {/* TAB 2: GESTIONE CATEGORIE (NEW) */}
        {/* ================================================================= */}
        {activeTab === "categories" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. UNIFIED SECTION HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#f58220] shrink-0 shadow-2xs">
                  <Tag className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Categorie Formative
                    </h2>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                      {categories.length} categorie
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Organizza i corsi per ambiti tematici e macro-settori della sicurezza sul lavoro.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                  {courses.length} corsi totali associati
                </span>
              </div>
            </div>

            {/* 2. INTEGRATED CONTROLS & ADD BAR */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
              <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative flex-1 w-full">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="Nome nuova categoria (es. Lavori in Spazi Confinati, HACCP, Patenti Speciali)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all shrink-0"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Aggiungi Categoria</span>
                </button>
              </form>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tutte le Categorie Configurate ({categories.length})
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {courses.length} corsi totali suddivisi
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {categories.map((cat, idx) => {
                  const countCourses = courses.filter((c) => c.category === cat).length;
                  const isEditing = editingCategory?.oldName === cat;

                  return (
                    <div
                      key={cat}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Name or Edit Input */}
                      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 max-w-md">
                            <input
                              type="text"
                              value={editingCategory.newName}
                              onChange={(e) =>
                                setEditingCategory({ ...editingCategory, newName: e.target.value })
                              }
                              className="w-full px-3 py-1.5 bg-white border border-[#008e97] rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditCategory}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Salva nuovo nome"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="p-1.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                              title="Annulla"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-slate-900">{cat}</span>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {countCourses} {countCourses === 1 ? "corso" : "corsi"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-[#008e97] hover:bg-[#e6f6f7] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rinomina</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteCategoryConfirm(cat)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-[#df0000] hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Elimina</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: GESTIONE SERVIZI */}
        {/* ================================================================= */}
        {activeTab === "services" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. UNIFIED SECTION HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#e6f6f7] border border-[#008e97]/20 flex items-center justify-center text-[#008e97] shrink-0 shadow-2xs">
                  <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Servizi Tecnici HSE
                    </h2>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                      {services.length} schede
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestisci le schede di consulenza per DVR, cantieri, RSPP esterno e verifiche periodiche.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={openNewServiceModal}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Servizio</span>
                </button>
              </div>
            </div>

            {/* 2. INTEGRATED CONTROLS & SEARCH BAR */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-600 px-1">
                Schede attive e visibili nella sezione Servizi del sito pubblico
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca per titolo, codice, legge..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#008e97] focus:bg-white transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Nessun servizio trovato</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Verifica i termini di ricerca inseriti oppure aggiungi un nuovo servizio.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((srv) => {
                const IconComp = SERVICE_ICONS[srv.iconName] || ShieldAlert;
                return (
                  <div
                    key={srv.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="relative h-36 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl">
                      <img
                        src={srv.image}
                        alt={srv.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                      <span className="absolute top-3 left-3 font-mono text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                        {srv.code}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                        <span className="text-[11px] font-mono text-slate-200 bg-black/40 px-2 py-0.5 rounded">
                          {srv.law}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                          <IconComp className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-grow">
                      <h4 className="text-base font-bold text-slate-900 mb-2">{srv.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4">{srv.description}</p>

                      <div className="bg-slate-50 p-3 rounded-xl mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Deliverables ({srv.deliverables.length}):
                        </div>
                        <ul className="space-y-1">
                          {srv.deliverables.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="text-[11px] text-slate-700 flex items-center gap-1.5 line-clamp-1">
                              <CheckCircle2 className="w-3 h-3 text-[#008e97] shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                          {srv.deliverables.length > 3 && (
                            <li className="text-[10px] text-slate-400 italic">
                              +{srv.deliverables.length - 3} altri punti inclusi
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          srv.badgeColor === "orange"
                            ? "bg-amber-100 text-amber-800"
                            : srv.badgeColor === "red"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#e6f6f7] text-[#008e97]"
                        }`}
                      >
                        Badge: {srv.badgeColor}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditServiceModal(srv)}
                          className="p-1.5 text-slate-500 hover:text-[#008e97] hover:bg-[#e6f6f7] rounded-lg transition-colors"
                          title="Modifica servizio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmModal({
                              type: "service",
                              id: srv.id,
                              title: srv.title,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-[#df0000] hover:bg-[#fdf2f2] rounded-lg transition-colors"
                          title="Elimina servizio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </main>
    </div>

      {/* ===================================================================== */}
      {/* MODAL / DRAWER: ADD / EDIT SERVICE */}
      {/* ===================================================================== */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#008e97] text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingService ? "Modifica Servizio di Sicurezza" : "Aggiungi Nuovo Servizio"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configura codice, descrizione tecnica, deliverables e icona
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 overflow-y-auto space-y-5 flex-grow">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Codice Servizio *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.code}
                    onChange={(e) => setServiceForm({ ...serviceForm, code: e.target.value })}
                    placeholder="es. SRV-07"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Titolo del Servizio *</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    placeholder="es. Valutazione Rischio Rumore & Vibrazioni Meccaniche"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Riferimento Normativo / Sottotitolo
                  </label>
                  <input
                    type="text"
                    value={serviceForm.law}
                    onChange={(e) => setServiceForm({ ...serviceForm, law: e.target.value })}
                    placeholder="es. Titolo VIII Capo II D.Lgs. 81/08"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Colore Badge Tema</label>
                  <select
                    value={serviceForm.badgeColor}
                    onChange={(e) =>
                      setServiceForm({ ...serviceForm, badgeColor: e.target.value as "cyan" | "orange" | "red" })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="cyan">Ciano Tecnico (#008e97)</option>
                    <option value="orange">Arancione Cantiere (#f58220)</option>
                    <option value="red">Rosso Sicurezza (#df0000)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Icona Rappresentativa
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Object.keys(SERVICE_ICONS).map((iconKey) => {
                    const IconComp = SERVICE_ICONS[iconKey];
                    const isSelected = serviceForm.iconName === iconKey;
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setServiceForm({ ...serviceForm, iconName: iconKey })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? "bg-[#e6f6f7] border-[#008e97] text-[#008e97] font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[9px] truncate max-w-full">{iconKey}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrizione Approfondita del Servizio
                </label>
                <textarea
                  rows={3}
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Spiega gli interventi operativi e i vantaggi per l'azienda committente..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Deliverables Inclusi (Punti elenco forniti al cliente):
                </label>

                <div className="space-y-1.5">
                  {serviceForm.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008e97]" />
                        <span className="text-slate-800">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="text-slate-400 hover:text-[#df0000] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={serviceForm.newDeliverable}
                    onChange={(e) => setServiceForm({ ...serviceForm, newDeliverable: e.target.value })}
                    placeholder="Aggiungi deliverable (es. Rilascio attestazione di conformità asseverata)..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase shrink-0"
                  >
                    Aggiungi
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Immagine di Copertina del Servizio
                  </label>
                  <input
                    type="text"
                    value={serviceForm.image}
                    onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                    placeholder="URL immagine..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 mb-2"
                  />

                  <input
                    type="file"
                    ref={serviceFileInputRef}
                    accept="image/*"
                    onChange={handleServiceImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => serviceFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#008e97]" />
                    <span>Carica dal computer</span>
                  </button>
                </div>

                <div className="h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-200">
                  <img src={serviceForm.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingService ? "Salva Modifiche" : "Pubblica Servizio"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: DELETE CONFIRMATION (COURSE / SERVICE) */}
      {/* ===================================================================== */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf2f2] text-[#df0000] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Conferma Eliminazione
            </h4>
            <p className="text-xs text-slate-600 text-center mb-6">
              Sei sicuro di voler eliminare definitivamente{" "}
              <strong>"{deleteConfirmModal.title}"</strong>? Questa azione rimuoverà l'elemento anche dal sito pubblico.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
              >
                Annulla
              </button>
              <button
                onClick={executeDelete}
                className="px-5 py-2.5 rounded-xl bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                Elimina Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: DELETE CATEGORY CONFIRMATION */}
      {/* ===================================================================== */}
      {deleteCategoryConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf2f2] text-[#df0000] flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Elimina Categoria
            </h4>
            <p className="text-xs text-slate-600 text-center mb-6">
              Sei sicuro di voler eliminare la categoria{" "}
              <strong>"{deleteCategoryConfirm}"</strong>? Eventuali corsi appartenenti a questa categoria verranno automaticamente riassegnati alla categoria predefinita.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteCategoryConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
              >
                Annulla
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteCategoryConfirm)}
                className="px-5 py-2.5 rounded-xl bg-[#df0000] hover:bg-[#b80000] text-white text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                Elimina Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: RESET TO DEFAULTS CONFIRMATION */}
      {/* ===================================================================== */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h4 className="text-base font-bold text-slate-900 text-center mb-1">
              Ripristina Dati Iniziali
            </h4>
            <p className="text-xs text-slate-600 text-center mb-6">
              Attenzione: tutte le modifiche locali apportate a corsi, categorie e servizi verranno sostituite con i dati predefiniti di fabbrica.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
              >
                Annulla
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-xs"
              >
                Ripristina Tutto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
