export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agenda_events: {
        Row: {
          client_company: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          course_id: string | null
          created_at: string
          custom_type: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_type: string
          id: string
          inquiry_id: string | null
          instructor: string | null
          location: string | null
          max_participants: number | null
          notes: string | null
          start_date: string
          start_time: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          client_company?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          course_id?: string | null
          created_at?: string
          custom_type?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          inquiry_id?: string | null
          instructor?: string | null
          location?: string | null
          max_participants?: number | null
          notes?: string | null
          start_date: string
          start_time?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          client_company?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          course_id?: string | null
          created_at?: string
          custom_type?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          inquiry_id?: string | null
          instructor?: string | null
          location?: string | null
          max_participants?: number | null
          notes?: string | null
          start_date?: string
          start_time?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_events_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category_id: string
          certification_issued: string | null
          content: string
          created_at: string
          duration_hours: number
          id: string
          image_url: string | null
          is_featured: boolean
          is_open_for_enrollment: boolean
          is_published: boolean
          location: string | null
          mode: string
          normative_ref: string
          short_description: string
          slug: string
          target_audience: string | null
          title: string
          updated_at: string
          validity_years: number | null
        }
        Insert: {
          category_id: string
          certification_issued?: string | null
          content?: string
          created_at?: string
          duration_hours?: number
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_open_for_enrollment?: boolean
          is_published?: boolean
          location?: string | null
          mode?: string
          normative_ref?: string
          short_description?: string
          slug: string
          target_audience?: string | null
          title: string
          updated_at?: string
          validity_years?: number | null
        }
        Update: {
          category_id?: string
          certification_issued?: string | null
          content?: string
          created_at?: string
          duration_hours?: number
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_open_for_enrollment?: boolean
          is_published?: boolean
          location?: string | null
          mode?: string
          normative_ref?: string
          short_description?: string
          slug?: string
          target_audience?: string | null
          title?: string
          updated_at?: string
          validity_years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          address: string | null
          ateco_code: string | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          client_type: string | null
          company: string | null
          course_id: string | null
          course_slug: string | null
          course_title: string | null
          created_at: string
          email: string
          first_name: string | null
          fiscal_code: string | null
          id: string
          kind: string
          last_name: string | null
          message: string | null
          name: string
          notes: string | null
          participants_count: number
          pec: string | null
          phone: string | null
          postal_code: string | null
          preferred_mode: string | null
          privacy_accepted_at: string
          privacy_policy_version: string
          sdi_code: string | null
          service_type: string | null
          status: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          ateco_code?: string | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          client_type?: string | null
          company?: string | null
          course_id?: string | null
          course_slug?: string | null
          course_title?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          fiscal_code?: string | null
          id?: string
          kind?: string
          last_name?: string | null
          message?: string | null
          name: string
          notes?: string | null
          participants_count?: number
          pec?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_mode?: string | null
          privacy_accepted_at?: string
          privacy_policy_version?: string
          sdi_code?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          ateco_code?: string | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          client_type?: string | null
          company?: string | null
          course_id?: string | null
          course_slug?: string | null
          course_title?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          fiscal_code?: string | null
          id?: string
          kind?: string
          last_name?: string | null
          message?: string | null
          name?: string
          notes?: string | null
          participants_count?: number
          pec?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_mode?: string | null
          privacy_accepted_at?: string
          privacy_policy_version?: string
          sdi_code?: string | null
          service_type?: string | null
          status?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          badge_color: string
          code: string
          created_at: string
          deliverables: Json
          description: string
          icon_name: string
          id: string
          image_url: string | null
          is_published: boolean
          law: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          badge_color?: string
          code: string
          created_at?: string
          deliverables?: Json
          description?: string
          icon_name?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          law?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          badge_color?: string
          code?: string
          created_at?: string
          deliverables?: Json
          description?: string
          icon_name?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          law?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
