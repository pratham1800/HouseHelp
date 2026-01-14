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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      booking_payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          id: string
          payment_type: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          booking_id: string
          created_at?: string
          id?: string
          payment_type?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          id?: string
          payment_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string
          assigned_worker_id: string | null
          call_scheduled_at: string | null
          call_status: string | null
          created_at: string
          email: string
          full_name: string
          house_size: string
          id: string
          phone: string
          preferred_time: string
          service_id: string
          service_title: string
          special_requirements: string | null
          start_date: string
          status: string
          sub_services: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          assigned_worker_id?: string | null
          call_scheduled_at?: string | null
          call_status?: string | null
          created_at?: string
          email: string
          full_name: string
          house_size: string
          id?: string
          phone: string
          preferred_time: string
          service_id: string
          service_title: string
          special_requirements?: string | null
          start_date: string
          status?: string
          sub_services?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          assigned_worker_id?: string | null
          call_scheduled_at?: string | null
          call_status?: string | null
          created_at?: string
          email?: string
          full_name?: string
          house_size?: string
          id?: string
          phone?: string
          preferred_time?: string
          service_id?: string
          service_title?: string
          special_requirements?: string | null
          start_date?: string
          status?: string
          sub_services?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_worker_id_fkey"
            columns: ["assigned_worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      hired_workers: {
        Row: {
          agreed_salary: number
          created_at: string
          hired_date: string
          id: string
          notes: string | null
          owner_id: string
          salary_frequency: string
          status: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          agreed_salary: number
          created_at?: string
          hired_date?: string
          id?: string
          notes?: string | null
          owner_id: string
          salary_frequency?: string
          status?: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          agreed_salary?: number
          created_at?: string
          hired_date?: string
          id?: string
          notes?: string | null
          owner_id?: string
          salary_frequency?: string
          status?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hired_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_name: string
          plan_price: number
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_name: string
          plan_price: number
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_name?: string
          plan_price?: number
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_call_limits: {
        Row: {
          calls_used: number
          created_at: string
          id: string
          max_calls: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calls_used?: number
          created_at?: string
          id?: string
          max_calls?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calls_used?: number
          created_at?: string
          id?: string
          max_calls?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_attendance: {
        Row: {
          clock_in: string | null
          clock_out: string | null
          created_at: string
          date: string
          hired_worker_id: string
          id: string
          leave_type: string | null
          notes: string | null
          status: string
        }
        Insert: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date: string
          hired_worker_id: string
          id?: string
          leave_type?: string | null
          notes?: string | null
          status?: string
        }
        Update: {
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date?: string
          hired_worker_id?: string
          id?: string
          leave_type?: string | null
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_attendance_hired_worker_id_fkey"
            columns: ["hired_worker_id"]
            isOneToOne: false
            referencedRelation: "hired_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_auth: {
        Row: {
          created_at: string
          id: string
          user_id: string
          worker_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          worker_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_auth_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: true
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_awards: {
        Row: {
          award_type: string
          bonus_amount: number | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          month: string | null
          title: string
          worker_id: string
        }
        Insert: {
          award_type: string
          bonus_amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          month?: string | null
          title: string
          worker_id: string
        }
        Update: {
          award_type?: string
          bonus_amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          month?: string | null
          title?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_awards_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_ratings: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          owner_id: string
          rating: number
          review: string | null
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          owner_id: string
          rating: number
          review?: string | null
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          owner_id?: string
          rating?: number
          review?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_ratings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          age: number | null
          assigned_customer_id: string | null
          created_at: string
          gender: string | null
          has_whatsapp: boolean | null
          id: string
          id_proof_url: string | null
          languages_spoken: string[] | null
          match_score: number | null
          name: string
          notes: string | null
          phone: string
          preferred_areas: string[] | null
          residential_address: string | null
          scheduled_call_date: string | null
          status: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          work_type: string
          working_hours: string | null
          years_experience: number | null
        }
        Insert: {
          age?: number | null
          assigned_customer_id?: string | null
          created_at?: string
          gender?: string | null
          has_whatsapp?: boolean | null
          id?: string
          id_proof_url?: string | null
          languages_spoken?: string[] | null
          match_score?: number | null
          name: string
          notes?: string | null
          phone: string
          preferred_areas?: string[] | null
          residential_address?: string | null
          scheduled_call_date?: string | null
          status?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          work_type: string
          working_hours?: string | null
          years_experience?: number | null
        }
        Update: {
          age?: number | null
          assigned_customer_id?: string | null
          created_at?: string
          gender?: string | null
          has_whatsapp?: boolean | null
          id?: string
          id_proof_url?: string | null
          languages_spoken?: string[] | null
          match_score?: number | null
          name?: string
          notes?: string | null
          phone?: string
          preferred_areas?: string[] | null
          residential_address?: string | null
          scheduled_call_date?: string | null
          status?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          work_type?: string
          working_hours?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
