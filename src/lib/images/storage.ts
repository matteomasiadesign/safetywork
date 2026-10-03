/** Bucket Supabase Storage che contiene le immagini di corsi e servizi. */
export const IMAGE_BUCKET = "site-images";

/**
 * Percorso dentro il bucket a partire dall'URL pubblico, oppure null se l'immagine
 * non è nostra (es. un link esterno): quelle non vanno mai toccate in Storage.
 */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !base) return null;

  const prefix = `${base}/storage/v1/object/public/${IMAGE_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;

  const path = decodeURIComponent(url.slice(prefix.length).split("?")[0]);
  return path || null;
}
