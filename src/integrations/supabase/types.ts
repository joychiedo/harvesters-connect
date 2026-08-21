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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      campuses: {
        Row: {
          active: boolean
          country: string
          created_at: string
          id: string
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          country?: string
          created_at?: string
          id?: string
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          country?: string
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      follow_ups: {
        Row: {
          assigned_to: string | null
          contact_date: string | null
          contact_method: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          id: string
          next_action: string | null
          next_follow_up_date: string | null
          notes: string | null
          outcome: string | null
          person_id: string
          status: Database["public"]["Enums"]["follow_up_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_date?: string | null
          contact_method?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          next_action?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          outcome?: string | null
          person_id: string
          status?: Database["public"]["Enums"]["follow_up_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_date?: string | null
          contact_method?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          id?: string
          next_action?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          outcome?: string | null
          person_id?: string
          status?: Database["public"]["Enums"]["follow_up_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_events: {
        Row: {
          archived: boolean
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          location: string | null
          name: string
          target_count: number
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          id?: string
          location?: string | null
          name: string
          target_count?: number
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          target_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          accepted_christ: boolean
          age_group: string | null
          alternate_phone: string | null
          assigned_leader: string | null
          campus_id: string | null
          cell: string | null
          created_at: string
          follow_up_status: Database["public"]["Enums"]["follow_up_status"]
          full_name: string
          gender: string | null
          id: string
          interested_in_church: boolean
          location: string | null
          ministry_interest: string | null
          notes: string | null
          outreach_event_id: string | null
          phone: string | null
          prayer_request: string | null
          preferred_contact_method: string | null
          registered_by: string | null
          registered_by_name: string | null
          registration_date: string
          updated_at: string
          updated_by: string | null
          wants_contact: boolean
          zone: string | null
        }
        Insert: {
          accepted_christ?: boolean
          age_group?: string | null
          alternate_phone?: string | null
          assigned_leader?: string | null
          campus_id?: string | null
          cell?: string | null
          created_at?: string
          follow_up_status?: Database["public"]["Enums"]["follow_up_status"]
          full_name: string
          gender?: string | null
          id?: string
          interested_in_church?: boolean
          location?: string | null
          ministry_interest?: string | null
          notes?: string | null
          outreach_event_id?: string | null
          phone?: string | null
          prayer_request?: string | null
          preferred_contact_method?: string | null
          registered_by?: string | null
          registered_by_name?: string | null
          registration_date?: string
          updated_at?: string
          updated_by?: string | null
          wants_contact?: boolean
          zone?: string | null
        }
        Update: {
          accepted_christ?: boolean
          age_group?: string | null
          alternate_phone?: string | null
          assigned_leader?: string | null
          campus_id?: string | null
          cell?: string | null
          created_at?: string
          follow_up_status?: Database["public"]["Enums"]["follow_up_status"]
          full_name?: string
          gender?: string | null
          id?: string
          interested_in_church?: boolean
          location?: string | null
          ministry_interest?: string | null
          notes?: string | null
          outreach_event_id?: string | null
          phone?: string | null
          prayer_request?: string | null
          preferred_contact_method?: string | null
          registered_by?: string | null
          registered_by_name?: string | null
          registration_date?: string
          updated_at?: string
          updated_by?: string | null
          wants_contact?: boolean
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_outreach_event_id_fkey"
            columns: ["outreach_event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          campus_id: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          campus_id?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          campus_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_campus_fk"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          active: boolean
          campus_id: string | null
          created_at: string
          created_by: string | null
          full_name: string
          id: string
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          campus_id?: string | null
          created_at?: string
          created_by?: string | null
          full_name: string
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          campus_id?: string | null
          created_at?: string
          created_by?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_all_people: { Args: never; Returns: boolean }
      check_duplicate_person: {
        Args: { p_phone: string; p_outreach_event_id: string }
        Returns: {
          id: string
          full_name: string
          phone: string
          location: string | null
          registration_date: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role:
        | "administrator"
        | "zonal_leader"
        | "cell_leader"
        | "followup_leader"
        | "volunteer"
      follow_up_status:
        | "new"
        | "contacted"
        | "follow_up_scheduled"
        | "connected"
        | "unable_to_reach"
        | "not_interested"
        | "completed"
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
    Enums: {
      app_role: [
        "administrator",
        "zonal_leader",
        "cell_leader",
        "followup_leader",
        "volunteer",
      ],
      follow_up_status: [
        "new",
        "contacted",
        "follow_up_scheduled",
        "connected",
        "unable_to_reach",
        "not_interested",
        "completed",
      ],
    },
  },
} as const
