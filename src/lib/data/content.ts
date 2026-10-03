import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { mergeContent, type SiteContent } from "@/lib/content/schema";

/**
 * Testi e immagini del sito: valori salvati dal cliente sopra ai predefiniti del codice.
 * Come per il catalogo, se Supabase non risponde l'errore sale a app/error.tsx.
 */
export class SiteContentError extends Error {
  constructor(detail?: string) {
    super(`Impossibile caricare i contenuti del sito${detail ? `: ${detail}` : ""}`);
    this.name = "SiteContentError";
  }
}

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const { data, error } = await createPublicClient().from("site_content").select("key, value");
  if (error) throw new SiteContentError(error.message);
  return mergeContent(data ?? []);
});
