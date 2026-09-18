export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface CourseAttachment {
  title: string;
  url: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  content: string;
  duration_hours: number;
  mode: string;
  validity_years: number;
  normative_ref: string;
  target_audience?: string | null;
  certification_issued?: string | null;
  is_featured: boolean;
  is_open_for_enrollment?: boolean;
  seats_available?: number;
  image_url?: string;
  period?: string;
  location?: string;
  created_at: string;
  updated_at?: string | null;
}

export interface ServiceItem {
  id: string;
  code: string;
  title: string;
  law: string;
  image: string;
  description: string;
  deliverables: string[];
  iconName: string;
  badgeColor: "cyan" | "orange" | "red";
  order?: number;
  display_order?: number;
  link?: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface Inquiry {
  id: string;
  type: "corso" | "contatto" | "preventivo";
  clientType?: "azienda" | "privato";
  name: string;
  email: string;
  phone?: string;
  company?: string;
  courseTitle?: string;
  courseSlug?: string;
  participantsCount?: number | string;
  preferredMode?: string;
  service_type?: string;
  message?: string;
  status: "nuovo" | "contattato" | "preventivo_inviato" | "confermato" | "non_interessato" | "archiviato";
  notes?: string;
  created_at: string;

  // Dati specifico Privato
  firstName?: string;
  lastName?: string;
  fiscalCode?: string;
  birthDate?: string;
  birthPlace?: string;

  // Dati specifico Azienda
  companyName?: string;
  vatNumber?: string;
  atecoCode?: string;
  sdiCode?: string;
  pec?: string;

  // Dati indirizzo comuni
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
  endDate?: string;   // Formato YYYY-MM-DD
  startTime?: string; // Formato HH:mm
  endTime?: string;   // Formato HH:mm
  location?: string;  // es. "Aula Didattica Porto Torres", "In Cantiere", "Videoconferenza"
  instructor?: string; // Docente / Perito / RSPP incaricato
  courseId?: string;  // ID corso correlato (se tipo === "corso")
  maxParticipants?: number;
  status: AgendaEventStatus;
  notes?: string;
  created_at: string;
  // Collegamento a Richiesta dal Sito
  inquiryId?: string;
  clientName?: string;
  clientCompany?: string;
  clientPhone?: string;
  clientEmail?: string;
}

export interface ContactInquiry {
  id?: string;
  type?: string | null;
  client_type?: string | null;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  service_type?: string | null;
  course_title?: string | null;
  course_slug?: string | null;
  participants_count?: number | null;
  preferred_mode?: string | null;
  message?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  fiscal_code?: string | null;
  vat_number?: string | null;
  ateco_code?: string | null;
  sdi_code?: string | null;
  pec?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string;
}

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          short_description: string;
          content: string;
          duration_hours: number;
          mode: string;
          validity_years: number;
          normative_ref: string;
          target_audience: string | null;
          certification_issued: string | null;
          is_featured: boolean;
          is_open_for_enrollment: boolean;
          seats_available: number;
          image_url: string | null;
          period: string | null;
          location: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category: string;
          short_description: string;
          content: string;
          duration_hours?: number;
          mode?: string;
          validity_years?: number;
          normative_ref?: string;
          target_audience?: string | null;
          certification_issued?: string | null;
          is_featured?: boolean;
          is_open_for_enrollment?: boolean;
          seats_available?: number;
          image_url?: string | null;
          period?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string;
          short_description?: string;
          content?: string;
          duration_hours?: number;
          mode?: string;
          validity_years?: number;
          normative_ref?: string;
          target_audience?: string | null;
          certification_issued?: string | null;
          is_featured?: boolean;
          is_open_for_enrollment?: boolean;
          seats_available?: number;
          image_url?: string | null;
          period?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          code: string;
          title: string;
          law: string;
          image: string | null;
          description: string;
          deliverables: Json | null;
          icon_name: string;
          badge_color: string;
          display_order: number;
          link: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          law: string;
          image?: string | null;
          description: string;
          deliverables?: Json | null;
          icon_name?: string;
          badge_color?: string;
          display_order?: number;
          link?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          law?: string;
          image?: string | null;
          description?: string;
          deliverables?: Json | null;
          icon_name?: string;
          badge_color?: string;
          display_order?: number;
          link?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      contact_inquiries: {
        Row: {
          id: string;
          type: string | null;
          client_type: string | null;
          name: string;
          email: string;
          company: string | null;
          phone: string | null;
          service_type: string | null;
          course_title: string | null;
          course_slug: string | null;
          participants_count: number | null;
          preferred_mode: string | null;
          message: string | null;
          first_name: string | null;
          last_name: string | null;
          fiscal_code: string | null;
          vat_number: string | null;
          ateco_code: string | null;
          sdi_code: string | null;
          pec: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          status: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          type?: string | null;
          client_type?: string | null;
          name: string;
          email: string;
          company?: string | null;
          phone?: string | null;
          service_type?: string | null;
          course_title?: string | null;
          course_slug?: string | null;
          participants_count?: number | null;
          preferred_mode?: string | null;
          message?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          fiscal_code?: string | null;
          vat_number?: string | null;
          ateco_code?: string | null;
          sdi_code?: string | null;
          pec?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string | null;
          client_type?: string | null;
          name?: string;
          email?: string;
          company?: string | null;
          phone?: string | null;
          service_type?: string | null;
          course_title?: string | null;
          course_slug?: string | null;
          participants_count?: number | null;
          preferred_mode?: string | null;
          message?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          fiscal_code?: string | null;
          vat_number?: string | null;
          ateco_code?: string | null;
          sdi_code?: string | null;
          pec?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          status?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
