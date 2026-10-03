import type { AgendaEvent } from "@/lib/types/database";

/** Esporta gli impegni in formato iCalendar (RFC 5545), importabile in Google Calendar / Outlook / Apple. */

const pad = (n: number) => String(n).padStart(2, "0");

const compactDate = (iso: string) => iso.replace(/-/g, "");
const compactTime = (hhmm: string) => `${hhmm.replace(":", "")}00`;

function utcStamp(date = new Date()): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Giorno successivo (le date "tutto il giorno" hanno la fine esclusiva). */
function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Le righe iCalendar non possono superare 75 byte: le più lunghe vanno "piegate". */
function fold(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // le righe di continuazione iniziano con uno spazio
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const STATUS_MAP: Record<AgendaEvent["status"], string> = {
  programmato: "TENTATIVE",
  confermato: "CONFIRMED",
  completato: "CONFIRMED",
  annullato: "CANCELLED",
};

export function buildIcs(events: AgendaEvent[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Safety Work S.r.l.s.//Agenda Operativa//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  const stamp = utcStamp();

  for (const evt of events) {
    const endDate = evt.endDate || evt.startDate;

    lines.push("BEGIN:VEVENT", `UID:${evt.id}@safetyworks.it`, `DTSTAMP:${stamp}`);

    if (evt.startTime) {
      lines.push(`DTSTART:${compactDate(evt.startDate)}T${compactTime(evt.startTime)}`);
      lines.push(`DTEND:${compactDate(endDate)}T${compactTime(evt.endTime || evt.startTime)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${compactDate(evt.startDate)}`);
      lines.push(`DTEND;VALUE=DATE:${nextDay(endDate)}`);
    }

    lines.push(`SUMMARY:${escapeText(evt.title)}`);
    if (evt.location) lines.push(`LOCATION:${escapeText(evt.location)}`);

    const description = [evt.description, evt.instructor && `Docente: ${evt.instructor}`, evt.notes && `Note: ${evt.notes}`]
      .filter(Boolean)
      .join("\n");
    if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);

    lines.push(`STATUS:${STATUS_MAP[evt.status]}`, "END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
