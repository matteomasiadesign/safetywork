import type { CourseEdition } from "@/lib/types/database";

/**
 * Modalità, date e sedi dei corsi.
 * L'azienda fa da intermediario con gli enti erogatori: si pubblica COME (modalità), DOVE (sede) e
 * QUANDO (date) si svolge il corso, non quanti posti restano.
 */

export type CourseMode = "presenza" | "online" | "misto";

export const MODE_OPTIONS: { value: CourseMode; label: string; hint: string }[] = [
  { value: "presenza", label: "In presenza", hint: "Si svolge in aula, in una sede precisa." },
  { value: "online", label: "Online", hint: "Si svolge a distanza: nessuna sede." },
  { value: "misto", label: "Misto", hint: "Una parte in presenza (con sede) e una parte online." },
];

/** Riconduce anche i vecchi valori liberi ("Aula in presenza", "E-learning (FAD)"...) ai tre ufficiali. */
export function normalizeMode(raw: string | null | undefined): CourseMode {
  const value = (raw ?? "").toLowerCase();
  if (value === "presenza" || value === "online" || value === "misto") return value;
  if (value.includes("misto") || value.includes("blended") || (value.includes("aula") && value.includes("video"))) return "misto";
  if (value.includes("e-learning") || value.includes("fad") || value.includes("video") || value.includes("online")) return "online";
  return "presenza";
}

export function modeLabel(raw: string | null | undefined): string {
  return MODE_OPTIONS.find((m) => m.value === normalizeMode(raw))!.label;
}

/** Un corso online non ha sede; negli altri casi la sede va indicata. */
export function modeNeedsLocation(raw: string | null | undefined): boolean {
  return normalizeMode(raw) !== "online";
}

/** Data di oggi in Italia (YYYY-MM-DD): un corso resta "in programma" fino al suo ultimo giorno. */
export function todayInItaly(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Rome" });
}

const lastDay = (edition: Pick<CourseEdition, "start_date" | "end_date">) => edition.end_date ?? edition.start_date;

export const isUpcoming = (edition: Pick<CourseEdition, "start_date" | "end_date">, today = todayInItaly()) =>
  lastDay(edition) >= today;

export function sortEditions<T extends Pick<CourseEdition, "start_date" | "end_date">>(editions: T[] | null | undefined): T[] {
  return [...(editions ?? [])].sort(
    (a, b) => a.start_date.localeCompare(b.start_date) || lastDay(a).localeCompare(lastDay(b))
  );
}

/** Edizioni non ancora concluse, dalla più vicina. */
export function upcomingEditions<T extends Pick<CourseEdition, "start_date" | "end_date">>(
  editions: T[] | null | undefined,
  today = todayInItaly()
): T[] {
  return sortEditions(editions).filter((e) => isUpcoming(e, today));
}

const parse = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
};

const MONTHS_LONG = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const MONTHS_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

/** "12 novembre 2026", "12–13 novembre 2026", "30 ottobre – 2 novembre 2026". Con short i mesi sono abbreviati. */
export function formatEditionDates(
  edition: Pick<CourseEdition, "start_date" | "end_date">,
  options: { short?: boolean } = {}
): string {
  const months = options.short ? MONTHS_SHORT : MONTHS_LONG;
  const start = parse(edition.start_date);
  const monthOf = (d: { month: number }) => months[d.month - 1];

  if (!edition.end_date || edition.end_date === edition.start_date) {
    return `${start.day} ${monthOf(start)} ${start.year}`;
  }

  const end = parse(edition.end_date);
  if (start.year === end.year && start.month === end.month) {
    return `${start.day}–${end.day} ${monthOf(end)} ${end.year}`;
  }
  if (start.year === end.year) {
    return `${start.day} ${monthOf(start)} – ${end.day} ${monthOf(end)} ${end.year}`;
  }
  return `${start.day} ${monthOf(start)} ${start.year} – ${end.day} ${monthOf(end)} ${end.year}`;
}

/** Giorno e mese abbreviato di inizio edizione, es. { day: "14", month: "ott" }. */
export function editionDayMonth(edition: Pick<CourseEdition, "start_date">): { day: string; month: string } {
  const { day, month } = parse(edition.start_date);
  return { day: String(day), month: MONTHS_SHORT[month - 1] };
}

/** Testo che identifica una data anche fuori dal sito, es. "12–13 novembre 2026 · Sassari". */
export function editionLabel(
  edition: Pick<CourseEdition, "start_date" | "end_date" | "location">,
  mode: string | null | undefined
): string {
  const dates = formatEditionDates(edition);
  const normalized = normalizeMode(mode);
  if (normalized === "online") return `${dates} · Online`;
  if (!edition.location) return dates;
  return normalized === "misto" ? `${dates} · ${edition.location} (+ parte online)` : `${dates} · ${edition.location}`;
}

/** Sedi (senza doppioni) delle edizioni in programma: servono alla ricerca per città. */
export function upcomingLocations(editions: CourseEdition[] | null | undefined): string[] {
  const seen = new Set<string>();
  upcomingEditions(editions).forEach((e) => e.location && seen.add(e.location));
  return Array.from(seen);
}
