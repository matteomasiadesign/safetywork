import { BookOpen, CalendarDays, Inbox, Layers, PenLine, Tag, type LucideIcon } from "lucide-react";

export type AdminTab = "inquiries" | "agenda" | "courses" | "categories" | "services" | "content";

export interface AdminNavCounts {
  inquiries: number;
  newInquiries: number;
  courses: number;
  categories: number;
  services: number;
  agenda: number;
}

export interface AdminNavItem {
  id: AdminTab;
  /** Nome per sidebar e intestazione. */
  label: string;
  /** Nome breve per il dock e il menu mobile. */
  short: string;
  icon: LucideIcon;
  badge?: string;
  /** Richiede attenzione (es. richieste nuove): badge rosso. */
  urgent?: boolean;
  /** Voce presente nel dock in basso su mobile (le altre stanno nel menu). */
  dock?: boolean;
}

export const TAB_TITLES: Record<AdminTab, string> = {
  inquiries: "Richieste dal Sito",
  agenda: "Agenda & Calendario",
  courses: "Catalogo Corsi",
  categories: "Categorie Formative",
  services: "Servizi HSE",
  content: "Contenuti del Sito",
};

export function buildNavItems(counts: AdminNavCounts): AdminNavItem[] {
  const positive = (n: number) => (n > 0 ? String(n) : undefined);
  return [
    {
      id: "inquiries",
      label: "Richieste dal Sito",
      short: "Richieste",
      icon: Inbox,
      badge: counts.newInquiries > 0 ? `${counts.newInquiries} nuove` : positive(counts.inquiries),
      urgent: counts.newInquiries > 0,
      dock: true,
    },
    { id: "agenda", label: "Agenda & Calendario", short: "Agenda", icon: CalendarDays, badge: positive(counts.agenda), dock: true },
    { id: "courses", label: "Gestione Corsi", short: "Corsi", icon: BookOpen, badge: String(counts.courses), dock: true },
    { id: "categories", label: "Categorie Corsi", short: "Categorie", icon: Tag, badge: String(counts.categories) },
    { id: "services", label: "Gestione Servizi", short: "Servizi", icon: Layers, badge: String(counts.services), dock: true },
    { id: "content", label: "Contenuti del Sito", short: "Contenuti", icon: PenLine, dock: true },
  ];
}
