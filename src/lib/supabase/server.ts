import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database, Course } from "@/lib/types/database";
import { MOCK_COURSES } from "@/lib/data/mockCourses";
import { isSupabaseConfigured } from "./client";

export function createClientServer() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createServerClient<Database>(
    supabaseUrl || "https://placeholder-domain.supabase.co",
    supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Can happen in Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Can happen in Server Components
          }
        },
      },
    }
  );
}

/**
 * Recupera tutti i corsi disponibili. Se Supabase non è configurato o la tabella è vuota,
 * restituisce automaticamente i corsi mock certificati D.Lgs. 81/08.
 */
export async function getCourses(): Promise<{ courses: Course[]; isFromDb: boolean }> {
  if (!isSupabaseConfigured) {
    return { courses: MOCK_COURSES, isFromDb: false };
  }

  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return { courses: MOCK_COURSES, isFromDb: false };
    }

    return { courses: data as Course[], isFromDb: true };
  } catch {
    return { courses: MOCK_COURSES, isFromDb: false };
  }
}

/**
 * Recupera il dettaglio di un singolo corso tramite slug.
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  if (!isSupabaseConfigured) {
    const mock = MOCK_COURSES.find((c) => c.slug === slug);
    return mock || null;
  }

  try {
    const supabase = createClientServer();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      const mock = MOCK_COURSES.find((c) => c.slug === slug);
      return mock || null;
    }

    return data as Course;
  } catch {
    const mock = MOCK_COURSES.find((c) => c.slug === slug);
    return mock || null;
  }
}

