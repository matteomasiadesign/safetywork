import FloatingContactWidget from "@/components/ui/FloatingContactWidget";
import { getSiteContent } from "@/lib/data/content";
import { CONTENT_DEFAULTS } from "@/lib/content/schema";
import { companyContacts } from "@/lib/content/format";

/**
 * Pulsante flottante con il telefono aziendale letto da Supabase.
 * Vive nel layout radice: se la lettura fallisce NON deve far cadere l'intero sito
 * (comprese le pagine di errore), quindi qui si ripiega sui recapiti originali.
 */
export default async function SiteFloatingContact() {
  let content = CONTENT_DEFAULTS as Awaited<ReturnType<typeof getSiteContent>>;
  try {
    content = await getSiteContent();
  } catch (err) {
    console.error(err);
  }
  return <FloatingContactWidget contacts={companyContacts(content)} />;
}
