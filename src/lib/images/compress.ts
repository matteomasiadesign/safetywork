/**
 * Compressione delle foto nel browser, prima del caricamento su Supabase Storage.
 *
 * Obiettivo: file ≤ 150 kB senza degrado visibile. Strategia:
 *  1. si parte dalla risoluzione più alta utile (1600 px sul lato lungo);
 *  2. per ogni risoluzione si cerca per bisezione la qualità WebP più alta che entra nel limite;
 *  3. solo se anche la qualità minima non basta si scende alla risoluzione successiva
 *     (meglio un'immagine un po' più piccola e nitida che una grande e sgranata).
 * Il ridimensionamento avviene a passi dimezzanti con smoothing alto, per evitare l'effetto "scalettato".
 */

/** Limite in byte (150 kB). Il bucket accetta fino a 153.600 byte, quindi c'è un po' di margine. */
export const MAX_IMAGE_BYTES = 150_000;

const MAX_INPUT_BYTES = 30 * 1024 * 1024;
const ACCEPTED_INPUT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const LONG_EDGE_STEPS = [1600, 1400, 1200, 1000, 800];
const QUALITY_MAX = 0.92;
const QUALITY_MIN = 0.6;
const SEARCH_ITERATIONS = 6;

export interface CompressedImage {
  file: File;
  width: number;
  height: number;
  originalBytes: number;
}

type Drawable = ImageBitmap | HTMLCanvasElement;

async function decode(file: File): Promise<ImageBitmap> {
  try {
    // "from-image" applica l'orientamento EXIF (foto scattate col telefono in verticale)
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      throw new Error("Impossibile leggere l'immagine: il file potrebbe essere danneggiato.");
    }
  }
}

function newCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Ridimensiona a passi dimezzanti: molto più nitido di un'unica riduzione drastica. */
function resize(source: Drawable, targetWidth: number, targetHeight: number, background: string | null) {
  let current: Drawable = source;
  let width = source.width;
  let height = source.height;

  while (width / 2 >= targetWidth && height / 2 >= targetHeight) {
    width = Math.round(width / 2);
    height = Math.round(height / 2);
    const step = newCanvas(width, height);
    const ctx = step.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(current, 0, 0, width, height);
    current = step;
  }

  const output = newCanvas(targetWidth, targetHeight);
  const ctx = output.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }
  ctx.drawImage(current, 0, 0, targetWidth, targetHeight);
  return output;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Alcuni browser (Safari più vecchi) non sanno codificare WebP e ripiegano su PNG. */
async function canEncodeWebp(): Promise<boolean> {
  const blob = await toBlob(newCanvas(2, 2), "image/webp", 0.8);
  return blob?.type === "image/webp";
}

/** Qualità più alta (tra QUALITY_MIN e QUALITY_MAX) che entra nel limite, oppure null. */
async function bestQuality(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  const top = await toBlob(canvas, type, QUALITY_MAX);
  if (top && top.size <= MAX_IMAGE_BYTES) return top;

  const bottom = await toBlob(canvas, type, QUALITY_MIN);
  if (!bottom || bottom.size > MAX_IMAGE_BYTES) return null;

  let best: Blob = bottom;
  let low = QUALITY_MIN;
  let high = QUALITY_MAX;
  for (let i = 0; i < SEARCH_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    const blob = await toBlob(canvas, type, mid);
    if (blob && blob.size <= MAX_IMAGE_BYTES) {
      best = blob;
      low = mid;
    } else {
      high = mid;
    }
  }
  return best;
}

function baseName(name: string) {
  const withoutExtension = name.replace(/\.[^.]+$/, "");
  return withoutExtension.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "immagine";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} kB`;
  return `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} MB`;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  if (!ACCEPTED_INPUT_TYPES.includes(file.type)) {
    throw new Error("Formato non supportato: usa JPG, PNG, WebP o AVIF.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("Il file supera i 30 MB: scegli una foto più leggera.");
  }

  const bitmap = await decode(file);
  const longEdge = Math.max(bitmap.width, bitmap.height);

  const useWebp = await canEncodeWebp();
  const mime = useWebp ? "image/webp" : "image/jpeg";
  const extension = useWebp ? "webp" : "jpg";
  // JPEG non ha trasparenza: lo sfondo bianco evita aree nere nelle PNG con alpha.
  const background = useWebp ? null : "#ffffff";

  // Risoluzioni da provare: mai ingrandire, mai oltre 1600 px.
  const edges = Array.from(
    new Set([Math.min(longEdge, LONG_EDGE_STEPS[0]), ...LONG_EDGE_STEPS.filter((edge) => edge < longEdge)])
  ).sort((a, b) => b - a);

  for (const edge of edges) {
    const scale = Math.min(1, edge / longEdge);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = resize(bitmap, width, height, background);
    const blob = await bestQuality(canvas, mime);
    if (blob) {
      bitmap.close?.();
      return {
        file: new File([blob], `${baseName(file.name)}.${extension}`, { type: mime }),
        width,
        height,
        originalBytes: file.size,
      };
    }
  }

  bitmap.close?.();
  throw new Error(
    "Non è stato possibile portare la foto sotto i 150 kB senza degradarla troppo: scegli un'immagine meno dettagliata."
  );
}
