"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Course, ServiceItem, Inquiry } from "@/lib/types/database";
import { INITIAL_COURSES, INITIAL_SERVICES, INITIAL_CATEGORIES, INITIAL_INQUIRIES } from "@/lib/data/initialData";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const COURSES_STORAGE_KEY = "safety_works_courses_v1";
const SERVICES_STORAGE_KEY = "safety_works_services_v1";
const CATEGORIES_STORAGE_KEY = "safety_works_categories_v1";
const INQUIRIES_STORAGE_KEY = "safety_works_inquiries_v1";

interface DataContextType {
  courses: Course[];
  services: ServiceItem[];
  categories: string[];
  inquiries: Inquiry[];
  isLoading: boolean;
  isSupabaseActive: boolean;
  addCourse: (course: Partial<Course> & { title: string; category: string; content: string }) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  duplicateCourse: (id: string) => Course | null;
  addCategory: (name: string) => boolean;
  updateCategory: (oldName: string, newName: string) => boolean;
  deleteCategory: (name: string) => boolean;
  addService: (service: Partial<ServiceItem> & { title: string; description: string }) => ServiceItem;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  addInquiry: (inquiry: Omit<Inquiry, "id" | "created_at"> & { id?: string; created_at?: string }) => Promise<Inquiry>;
  updateInquiryStatus: (id: string, status: Inquiry["status"], notes?: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  resetToDefaults: () => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(COURSES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Error reading courses from localStorage", e);
      }
    }
    return INITIAL_COURSES;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SERVICES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Error reading services from localStorage", e);
      }
    }
    return INITIAL_SERVICES;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Error reading categories from localStorage", e);
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(INQUIRIES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error("Error reading inquiries from localStorage", e);
      }
    }
    return INITIAL_INQUIRIES;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sincronizzazione dati da Supabase
  const refreshData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    try {
      const supabase = createClient();

      // 1. Corsi
      const { data: dbCourses, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!cErr && dbCourses && dbCourses.length > 0) {
        setCourses(dbCourses as Course[]);
        if (typeof window !== "undefined") {
          localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(dbCourses));
        }
      }

      // 2. Servizi
      const { data: dbServices, error: sErr } = await supabase
        .from("services")
        .select("*")
        .order("display_order", { ascending: true });

      if (!sErr && dbServices && dbServices.length > 0) {
        setServices(dbServices as unknown as ServiceItem[]);
        if (typeof window !== "undefined") {
          localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(dbServices));
        }
      }

      // 3. Richieste e Prenotazioni
      const { data: dbInquiries, error: iErr } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!iErr && dbInquiries && dbInquiries.length > 0) {
        const mappedInquiries: Inquiry[] = dbInquiries.map((row: any) => ({
          id: row.id,
          type: (row.type as Inquiry["type"]) || "contatto",
          clientType: (row.client_type as Inquiry["clientType"]) || "privato",
          name: row.name || "",
          email: row.email || "",
          phone: row.phone || "",
          company: row.company || "",
          service_type: row.service_type || "",
          courseTitle: row.course_title || undefined,
          courseSlug: row.course_slug || undefined,
          participantsCount: row.participants_count || 1,
          preferredMode: row.preferred_mode || undefined,
          message: row.message || "",
          status: (row.status as Inquiry["status"]) || "nuovo",
          notes: row.notes || "",
          created_at: row.created_at || new Date().toISOString(),
          firstName: row.first_name || undefined,
          lastName: row.last_name || undefined,
          fiscalCode: row.fiscal_code || undefined,
          vatNumber: row.vat_number || undefined,
          atecoCode: row.ateco_code || undefined,
          sdiCode: row.sdi_code || undefined,
          pec: row.pec || undefined,
          address: row.address || undefined,
          city: row.city || undefined,
          postalCode: row.postal_code || undefined,
        }));

        setInquiries(mappedInquiries);
        if (typeof window !== "undefined") {
          localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(mappedInquiries));
        }
      }
    } catch (err) {
      console.warn("Supabase fetch failed, continuing with local store:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured) {
      refreshData();
    }
  }, [refreshData]);

  // Persistenza locale di sicurezza
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
    }
  }, [courses]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    }
  }, [services]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
    }
  }, [inquiries]);

  // Gestione Categorie
  const addCategory = useCallback((name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return false;
    setCategories((prev) => [...prev, trimmed]);
    return true;
  }, [categories]);

  const updateCategory = useCallback((oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return false;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase())) {
      return false;
    }

    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.category === oldName) {
          const updated = { ...course, category: trimmed, updated_at: new Date().toISOString() };
          if (isSupabaseConfigured) {
            const supabase = createClient();
            supabase
              .from("courses")
              .update(updated as any)
              .eq("id", course.id)
              .then();
          }
          return updated;
        }
        return course;
      })
    );

    return true;
  }, [categories]);

  const deleteCategory = useCallback((name: string): boolean => {
    if (categories.length <= 1) return false;
    setCategories((prev) => prev.filter((c) => c !== name));

    const remaining = categories.filter((c) => c !== name);
    const fallbackCategory = remaining[0] || "Generale";

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.category === name) {
          const updated = { ...course, category: fallbackCategory, updated_at: new Date().toISOString() };
          if (isSupabaseConfigured) {
            const supabase = createClient();
            supabase
              .from("courses")
              .update(updated as any)
              .eq("id", course.id)
              .then();
          }
          return updated;
        }
        return course;
      })
    );

    return true;
  }, [categories]);

  // Gestione Corsi
  const addCourse = useCallback(
    (courseData: Partial<Course> & { title: string; category: string; content: string }): Course => {
      const slug =
        courseData.slug ||
        courseData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");

      const newCourse: Course = {
        id: courseData.id || `course-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        title: courseData.title,
        slug,
        category: courseData.category || (categories[0] || "Formazione Generale"),
        short_description: courseData.short_description || "",
        content: courseData.content || "",
        duration_hours: Number(courseData.duration_hours) || 8,
        mode: courseData.mode || "Aula in presenza",
        validity_years: Number(courseData.validity_years) || 5,
        normative_ref: courseData.normative_ref || "D.Lgs. 81/08",
        target_audience: courseData.target_audience || "Lavoratori e figure della sicurezza",
        certification_issued: courseData.certification_issued || "Attestato valido ai sensi di legge",
        is_featured: Boolean(courseData.is_featured),
        is_open_for_enrollment: Boolean(courseData.is_open_for_enrollment ?? true),
        seats_available: Number(courseData.seats_available) || 6,
        image_url:
          courseData.image_url ||
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
        period: courseData.period || "A breve",
        location: courseData.location || "Porto Torres (SS)",
        created_at: new Date().toISOString(),
      };

      setCourses((prev) => [newCourse, ...prev]);

      if (isSupabaseConfigured) {
        const supabase = createClient();
        supabase
          .from("courses")
          .insert(newCourse as any)
          .then(({ error }: any) => {
            if (error) console.error("Error inserting course in Supabase:", error);
          });
      }

      return newCourse;
    },
    [categories]
  );

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = {
            ...c,
            ...updates,
            updated_at: new Date().toISOString(),
          };

          if (isSupabaseConfigured) {
            const supabase = createClient();
            supabase
              .from("courses")
              .update(updated as any)
              .eq("id", id)
              .then(({ error }: any) => {
                if (error) console.error("Error updating course in Supabase:", error);
              });
          }

          return updated;
        }
        return c;
      })
    );
  }, []);

  const deleteCourse = useCallback((id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));

    if (isSupabaseConfigured) {
      const supabase = createClient();
      supabase
        .from("courses")
        .delete()
        .eq("id", id)
        .then(({ error }: any) => {
          if (error) console.error("Error deleting course in Supabase:", error);
        });
    }
  }, []);

  const duplicateCourse = useCallback(
    (id: string): Course | null => {
      const original = courses.find((c) => c.id === id);
      if (!original) return null;

      const newTitle = `${original.title} (Copia)`;
      const newSlug = `${original.slug}-copia-${Date.now().toString().slice(-4)}`;

      return addCourse({
        ...original,
        id: undefined,
        title: newTitle,
        slug: newSlug,
      });
    },
    [courses, addCourse]
  );

  // Gestione Servizi
  const addService = useCallback(
    (serviceData: Partial<ServiceItem> & { title: string; description: string }): ServiceItem => {
      const newService: ServiceItem = {
        id: serviceData.id || `srv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        code: serviceData.code || `SRV-${(services.length + 1).toString().padStart(2, "0")}`,
        title: serviceData.title,
        law: serviceData.law || "D.Lgs. 81/08",
        image:
          serviceData.image ||
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
        description: serviceData.description,
        deliverables: serviceData.deliverables && serviceData.deliverables.length > 0
          ? serviceData.deliverables
          : ["Audit tecnico preliminare", "Redazione reportistica di conformità"],
        iconName: serviceData.iconName || "ShieldAlert",
        badgeColor: serviceData.badgeColor || "cyan",
        order: serviceData.order ?? services.length + 1,
        display_order: serviceData.display_order ?? serviceData.order ?? services.length + 1,
        link: serviceData.link || "/#contatti",
        created_at: new Date().toISOString(),
      };

      setServices((prev) => [...prev, newService]);

      if (isSupabaseConfigured) {
        const supabase = createClient();
        supabase
          .from("services")
          .insert({
            ...newService,
            icon_name: newService.iconName,
            badge_color: newService.badgeColor,
            display_order: newService.display_order,
          } as any)
          .then(({ error }: any) => {
            if (error) console.error("Error inserting service in Supabase:", error);
          });
      }

      return newService;
    },
    [services.length]
  );

  const updateService = useCallback((id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = {
            ...s,
            ...updates,
            updated_at: new Date().toISOString(),
          };

          if (isSupabaseConfigured) {
            const supabase = createClient();
            supabase
              .from("services")
              .update({
                ...updated,
                icon_name: updated.iconName,
                badge_color: updated.badgeColor,
                display_order: updated.display_order ?? updated.order,
              } as any)
              .eq("id", id)
              .then(({ error }: any) => {
                if (error) console.error("Error updating service in Supabase:", error);
              });
          }

          return updated;
        }
        return s;
      })
    );
  }, []);

  const deleteService = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));

    if (isSupabaseConfigured) {
      const supabase = createClient();
      supabase
        .from("services")
        .delete()
        .eq("id", id)
        .then(({ error }: any) => {
          if (error) console.error("Error deleting service in Supabase:", error);
        });
    }
  }, []);

  // Gestione Richieste e Prenotazioni (Inquiries)
  const addInquiry = useCallback(
    async (inquiryData: Omit<Inquiry, "id" | "created_at"> & { id?: string; created_at?: string }): Promise<Inquiry> => {
      const newInquiry: Inquiry = {
        ...inquiryData,
        id: inquiryData.id || `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: inquiryData.type || "contatto",
        name:
          inquiryData.name ||
          (inquiryData.firstName && inquiryData.lastName
            ? `${inquiryData.firstName} ${inquiryData.lastName}`
            : inquiryData.companyName || inquiryData.company || ""),
        email: inquiryData.email,
        phone: inquiryData.phone || "",
        company: inquiryData.company || inquiryData.companyName || "",
        service_type: inquiryData.courseTitle || inquiryData.service_type || "Richiesta",
        status: inquiryData.status || "nuovo",
        created_at: inquiryData.created_at || new Date().toISOString(),
      };

      setInquiries((prev) => [newInquiry, ...prev]);

      if (isSupabaseConfigured) {
        try {
          const supabase = createClient();
          await supabase.from("contact_inquiries").insert({
            type: newInquiry.type,
            client_type: newInquiry.clientType || (newInquiry.company ? "azienda" : "privato"),
            name: newInquiry.name,
            email: newInquiry.email,
            phone: newInquiry.phone || null,
            company: newInquiry.company || null,
            service_type: newInquiry.service_type || null,
            course_title: newInquiry.courseTitle || null,
            course_slug: newInquiry.courseSlug || null,
            participants_count: Number(newInquiry.participantsCount) || 1,
            preferred_mode: newInquiry.preferredMode || null,
            message: newInquiry.message || null,
            first_name: newInquiry.firstName || null,
            last_name: newInquiry.lastName || null,
            fiscal_code: newInquiry.fiscalCode || null,
            vat_number: newInquiry.vatNumber || null,
            ateco_code: newInquiry.atecoCode || null,
            sdi_code: newInquiry.sdiCode || null,
            pec: newInquiry.pec || null,
            address: newInquiry.address || null,
            city: newInquiry.city || null,
            postal_code: newInquiry.postalCode || null,
            status: newInquiry.status || "nuovo",
            notes: newInquiry.notes || null,
          } as any);
        } catch (error) {
          console.error("Error inserting inquiry in Supabase:", error);
        }
      }

      return newInquiry;
    },
    []
  );

  const updateInquiryStatus = useCallback(
    async (id: string, status: Inquiry["status"], notes?: string) => {
      setInquiries((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              status,
              ...(notes !== undefined ? { notes } : {}),
            };
          }
          return item;
        })
      );

      if (isSupabaseConfigured) {
        try {
          const supabase = createClient();
          await supabase
            .from("contact_inquiries")
            .update({
              status,
              ...(notes !== undefined ? { notes } : {}),
            } as any)
            .eq("id", id);
        } catch (error) {
          console.error("Error updating inquiry in Supabase:", error);
        }
      }
    },
    []
  );

  const deleteInquiry = useCallback(async (id: string) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id));

    if (isSupabaseConfigured) {
      try {
        const supabase = createClient();
        await supabase.from("contact_inquiries").delete().eq("id", id);
      } catch (error) {
        console.error("Error deleting inquiry from Supabase:", error);
      }
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setCourses(INITIAL_COURSES);
    setServices(INITIAL_SERVICES);
    setCategories(INITIAL_CATEGORIES);
    setInquiries(INITIAL_INQUIRIES);
    if (typeof window !== "undefined") {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(INITIAL_COURSES));
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(INITIAL_SERVICES));
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(INITIAL_INQUIRIES));
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        courses,
        services,
        categories,
        inquiries,
        isLoading,
        isSupabaseActive: isSupabaseConfigured,
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
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        resetToDefaults,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
