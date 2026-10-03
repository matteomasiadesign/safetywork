/**
 * Stato di apertura ricavato dal testo degli orari scritto dal cliente in admin
 * (es. "Lunedì - Venerdì: 08:30 - 18:30"). Se il testo non è interpretabile restituisce null:
 * in quel caso il sito mostra solo gli orari, senza dichiarare "aperti" o "chiusi".
 */
export interface OpenStatus {
  open: boolean;
  /** "Aperti ora" / "Chiusi ora" */
  label: string;
  /** "fino alle 18:30" / "riapriamo domani alle 08:30" */
  detail: string;
}

const DAY_KEYS = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
const DAY_NAMES = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const formatTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

function parseHours(hours: string): { days: Set<number>; from: number; to: number } | null {
  const text = normalize(hours);
  const time = text.match(/(\d{1,2})[:.](\d{2})\s*(?:-|–|—|a|alle)\s*(\d{1,2})[:.](\d{2})/);
  if (!time) return null;

  const from = Number(time[1]) * 60 + Number(time[2]);
  const to = Number(time[3]) * 60 + Number(time[4]);
  if (!(to > from)) return null;

  const mentioned = Array.from(text.matchAll(/\b(dom|lun|mar|mer|gio|ven|sab)[a-z]*/g)).map((m) => DAY_KEYS.indexOf(m[1]));
  const days = new Set<number>();
  if (mentioned.length === 0) {
    DAY_KEYS.forEach((_, i) => days.add(i));
  } else if (mentioned.length === 1) {
    days.add(mentioned[0]);
  } else {
    // "Lunedì - Venerdì": intervallo dal primo al secondo giorno citato.
    let day = mentioned[0];
    days.add(day);
    while (day !== mentioned[1]) {
      day = (day + 1) % 7;
      days.add(day);
    }
  }
  return { days, from, to };
}

export function getOpenStatus(hours: string, now: Date = new Date()): OpenStatus | null {
  const parsed = parseHours(hours);
  if (!parsed) return null;

  // Giorno e ora "in Italia", qualunque sia il fuso del visitatore.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = WEEKDAY_INDEX[get("weekday")];
  if (weekday === undefined) return null;
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));

  const { days, from, to } = parsed;
  if (days.has(weekday) && minutes >= from && minutes < to) {
    return { open: true, label: "Aperti ora", detail: `fino alle ${formatTime(to)}` };
  }

  if (days.has(weekday) && minutes < from) {
    return { open: false, label: "Chiusi ora", detail: `riapriamo oggi alle ${formatTime(from)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const day = (weekday + i) % 7;
    if (days.has(day)) {
      const when = i === 1 ? "domani" : DAY_NAMES[day];
      return { open: false, label: "Chiusi ora", detail: `riapriamo ${when} alle ${formatTime(from)}` };
    }
  }
  return null;
}
