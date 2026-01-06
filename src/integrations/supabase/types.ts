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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          demo_session_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          created_at?: string
          demo_session_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          created_at?: string
          demo_session_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_demo_session_id_fkey"
            columns: ["demo_session_id"]
            isOneToOne: false
            referencedRelation: "demo_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_sessions: {
        Row: {
          company: string
          created_at: string
          email: string
          expires_at: string
          id: string
          name: string
          proxy_call_count: number
          role: Database["public"]["Enums"]["demo_role"]
          use_case: string | null
        }
        Insert: {
          company: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          name: string
          proxy_call_count?: number
          role?: Database["public"]["Enums"]["demo_role"]
          use_case?: string | null
        }
        Update: {
          company?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          name?: string
          proxy_call_count?: number
          role?: Database["public"]["Enums"]["demo_role"]
          use_case?: string | null
        }
        Relationships: []
      }
      llm_decisions: {
        Row: {
          cost_estimate: number
          created_at: string
          decision: Database["public"]["Enums"]["decision_type"]
          evaluation_time_ms: number
          id: string
          llm_request_id: string
          reasons: Json
        }
        Insert: {
          cost_estimate?: number
          created_at?: string
          decision: Database["public"]["Enums"]["decision_type"]
          evaluation_time_ms?: number
          id?: string
          llm_request_id: string
          reasons?: Json
        }
        Update: {
          cost_estimate?: number
          created_at?: string
          decision?: Database["public"]["Enums"]["decision_type"]
          evaluation_time_ms?: number
          id?: string
          llm_request_id?: string
          reasons?: Json
        }
        Relationships: [
          {
            foreignKeyName: "llm_decisions_llm_request_id_fkey"
            columns: ["llm_request_id"]
            isOneToOne: true
            referencedRelation: "llm_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_requests: {
        Row: {
          created_at: string
          demo_session_id: string
          id: string
          model: string
          prompt: string
          tokens_requested: number
        }
        Insert: {
          created_at?: string
          demo_session_id: string
          id?: string
          model: string
          prompt: string
          tokens_requested: number
        }
        Update: {
          created_at?: string
          demo_session_id?: string
          id?: string
          model?: string
          prompt?: string
          tokens_requested?: number
        }
        Relationships: [
          {
            foreignKeyName: "llm_requests_demo_session_id_fkey"
            columns: ["demo_session_id"]
            isOneToOne: false
            referencedRelation: "demo_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          id: string
          name: string
          policy_type: Database["public"]["Enums"]["policy_type"]
          priority: number
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          policy_type: Database["public"]["Enums"]["policy_type"]
          priority?: number
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          policy_type?: Database["public"]["Enums"]["policy_type"]
          priority?: number
          updated_at?: string
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
      decision_type: "ALLOW" | "BLOCK"
      demo_role: "CTO" | "PLATFORM" | "ENGINEER" | "FOUNDER" | "OTHER"
      policy_type:
        | "MODEL_RESTRICTION"
        | "TOKEN_LIMIT"
        | "PII_BLOCK"
        | "PROMPT_KEYWORD_BLOCK"
        | "COST_LIMIT"
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
      decision_type: ["ALLOW", "BLOCK"],
      demo_role: ["CTO", "PLATFORM", "ENGINEER", "FOUNDER", "OTHER"],
      policy_type: [
        "MODEL_RESTRICTION",
        "TOKEN_LIMIT",
        "PII_BLOCK",
        "PROMPT_KEYWORD_BLOCK",
        "COST_LIMIT",
      ],
    },
  },
} as const
