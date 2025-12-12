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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      investors: {
        Row: {
          check_size: string | null
          created_at: string
          email: string | null
          firm: string | null
          follow_up_date: string | null
          id: string
          linkedin: string | null
          name: string
          notes: string | null
          project_id: string
          stage: string | null
          status: string | null
          thesis: string | null
          updated_at: string
        }
        Insert: {
          check_size?: string | null
          created_at?: string
          email?: string | null
          firm?: string | null
          follow_up_date?: string | null
          id?: string
          linkedin?: string | null
          name: string
          notes?: string | null
          project_id: string
          stage?: string | null
          status?: string | null
          thesis?: string | null
          updated_at?: string
        }
        Update: {
          check_size?: string | null
          created_at?: string
          email?: string | null
          firm?: string | null
          follow_up_date?: string | null
          id?: string
          linkedin?: string | null
          name?: string
          notes?: string | null
          project_id?: string
          stage?: string | null
          status?: string | null
          thesis?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pitch_assets: {
        Row: {
          asset_type: string
          content: string
          created_at: string
          id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          content: string
          created_at?: string
          id?: string
          project_id: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pitch_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          background: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          raising_stage: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          background?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          raising_stage?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          background?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          raising_stage?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          ask_amount: string | null
          business_model: string | null
          category: string
          competition: string | null
          created_at: string
          differentiation: string | null
          go_to_market: string | null
          id: string
          one_liner: string
          pitch_tone: string | null
          problem_statement: string
          solution_description: string
          stage: string
          startup_name: string
          target_users: string
          team_size: string | null
          traction_growth: string | null
          traction_revenue: string | null
          traction_users: string | null
          updated_at: string
          use_of_funds: string | null
          user_id: string
          website: string | null
          why_now: string | null
        }
        Insert: {
          ask_amount?: string | null
          business_model?: string | null
          category: string
          competition?: string | null
          created_at?: string
          differentiation?: string | null
          go_to_market?: string | null
          id?: string
          one_liner: string
          pitch_tone?: string | null
          problem_statement: string
          solution_description: string
          stage: string
          startup_name: string
          target_users: string
          team_size?: string | null
          traction_growth?: string | null
          traction_revenue?: string | null
          traction_users?: string | null
          updated_at?: string
          use_of_funds?: string | null
          user_id: string
          website?: string | null
          why_now?: string | null
        }
        Update: {
          ask_amount?: string | null
          business_model?: string | null
          category?: string
          competition?: string | null
          created_at?: string
          differentiation?: string | null
          go_to_market?: string | null
          id?: string
          one_liner?: string
          pitch_tone?: string | null
          problem_statement?: string
          solution_description?: string
          stage?: string
          startup_name?: string
          target_users?: string
          team_size?: string | null
          traction_growth?: string | null
          traction_revenue?: string | null
          traction_users?: string | null
          updated_at?: string
          use_of_funds?: string | null
          user_id?: string
          website?: string | null
          why_now?: string | null
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
