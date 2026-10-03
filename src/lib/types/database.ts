import type { Tables } from "./supabase";

/**
 * Tipi dell'applicazione. Le righe del database arrivano da ./supabase
 * (generato con `supabase gen types` / MCP), qui si aggiungono solo le
 * forme usate dall'interfaccia.
 */

export type Category = Tables<"categories">;

/** Riferimento alla categoria incluso in ogni corso (join). */
export type CategoryRef = Pick<Category, "id" | "name" | "slug" | "sort_order">;

export type Course = Tables<"courses"> & { category: CategoryRef };

export type ServiceBadgeColor = "cyan" | "orange" | "red";

export type ServiceItem = Omit<Tables<"services">, "deliverables" | "badge_color"> & {
  deliverables: string[];
  badge_color: ServiceBadgeColor;
};

export type InquiryType = "corso" | "contatto" | "preventivo";

export type InquiryStatus =
  | "nuovo"
  | "contattato"
  | "preventivo_inviato"
  | "confermato"
  | "non_interessato"
  | "archiviato";

/** Richiesta dal sito, nella forma usata dal pannello admin. */
export interface Inquiry {
  id: string;
  type: InquiryType;
  clientType?: "azienda" | "privato";
  name: string;
  email: string;
  phone?: string;
  company?: string;
  courseId?: string;
  courseTitle?: string;
  courseSlug?: string;
  participantsCount?: number;
  preferredMode?: string;
  service_type?: string;
  message?: string;
  status: InquiryStatus;
  notes?: string;
  created_at: string;
  privacyAcceptedAt?: string;

  // Dati specifici Privato
  firstName?: string;
  lastName?: string;
  fiscalCode?: string;
  birthDate?: string;
  birthPlace?: string;

  // Dati specifici Azienda
  vatNumber?: string;
  atecoCode?: string;
  sdiCode?: string;
  pec?: string;

  // Indirizzo
  address?: string;
  city?: string;
  postalCode?: string;
}

export type AgendaEventType =
  | "corso"
  | "sopralluogo"
  | "scadenza"
  | "consulenza"
  | "appuntamento"
  | "altro";

export type AgendaEventStatus =
  | "programmato"
  | "confermato"
  | "completato"
  | "annullato";

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  type: AgendaEventType;
  customType?: string; // Tipologia libera personalizzata (se type === 'altro')
  startDate: string; // Formato YYYY-MM-DD
  endDate?: string; // Formato YYYY-MM-DD
  startTime?: string; // Formato HH:mm
  endTime?: string; // Formato HH:mm
  location?: string;
  instructor?: string;
  courseId?: string;
  maxParticipants?: number;
  status: AgendaEventStatus;
  notes?: string;
  created_at: string;
  inquiryId?: string;
  clientName?: string;
  clientCompany?: string;
  clientPhone?: string;
  clientEmail?: string;
}
