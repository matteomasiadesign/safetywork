import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/lib/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project") &&
  !supabaseAnonKey.includes("placeholder") &&
  !supabaseAnonKey.includes("your-anon-key")
);

export function createClient() {
  if (!isSupabaseConfigured) {
    // Return a dummy client or standard client to prevent runtime exceptions
    return createBrowserClient(
      supabaseUrl || "https://placeholder-domain.supabase.co",
      supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

