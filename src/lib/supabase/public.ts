import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";

/** Tag di cache dei contenuti pubblici: l'admin lo invalida a ogni modifica. */
export const CATALOG_CACHE_TAG = "catalog";

/** Secondi dopo i quali Next.js rilegge comunque i dati da Supabase. */
export const CATALOG_REVALIDATE_SECONDS = 60;

/**
 * Client Supabase senza sessione, per leggere i contenuti pubblicati lato server.
 * Non usa i cookie, quindi le pagine restano statiche/ISR.
 */
export function createPublicClient(options: { cached?: boolean } = {}) {
  const { cached = true } = options;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Configurazione Supabase mancante: imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // Le letture dei contenuti pubblici usano la cache di Next (con tag); le scritture no.
    global: cached
      ? {
          fetch: (input, init) =>
            fetch(input, {
              ...init,
              next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_CACHE_TAG] },
            }),
        }
      : {},
  });
}
