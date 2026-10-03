import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/supabase";

/**
 * Client Supabase per il browser (area admin, upload immagini).
 * Se le variabili d'ambiente mancano il sito deve segnalarlo, non ripiegare su dati locali.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Configurazione Supabase mancante: imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
