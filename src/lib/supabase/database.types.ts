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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      additional_costs: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          paid: boolean
          purchase_id: string
          type: Database["public"]["Enums"]["additional_cost_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          paid?: boolean
          purchase_id: string
          type: Database["public"]["Enums"]["additional_cost_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid?: boolean
          purchase_id?: string
          type?: Database["public"]["Enums"]["additional_cost_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "additional_costs_purchase_id_user_id_fkey"
            columns: ["purchase_id", "user_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      batches: {
        Row: {
          batch_date: string | null
          batch_number: string
          country: Database["public"]["Enums"]["country"]
          created_at: string
          id: string
          last_updated_at: string
          notes: string | null
          source_id: string
          status: Database["public"]["Enums"]["tracking_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_date?: string | null
          batch_number: string
          country: Database["public"]["Enums"]["country"]
          created_at?: string
          id?: string
          last_updated_at?: string
          notes?: string | null
          source_id: string
          status?: Database["public"]["Enums"]["tracking_status"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          batch_date?: string | null
          batch_number?: string
          country?: Database["public"]["Enums"]["country"]
          created_at?: string
          id?: string
          last_updated_at?: string
          notes?: string | null
          source_id?: string
          status?: Database["public"]["Enums"]["tracking_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_source_id_user_id_fkey"
            columns: ["source_id", "user_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      purchases: {
        Row: {
          archived_at: string | null
          artist_group: string | null
          batch_id: string | null
          country: Database["public"]["Enums"]["country"] | null
          created_at: string
          id: string
          image_url: string | null
          item_name: string
          last_updated_at: string | null
          notes: string | null
          os_date: string | null
          os_notes: string | null
          os_paid_amount: number | null
          os_price: number | null
          ownership_status: Database["public"]["Enums"]["ownership_status"]
          paid_amount: number
          price: number
          purchase_date: string
          purchase_origin: Database["public"]["Enums"]["purchase_origin"]
          source_id: string
          tracking_status: Database["public"]["Enums"]["tracking_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          artist_group?: string | null
          batch_id?: string | null
          country?: Database["public"]["Enums"]["country"] | null
          created_at?: string
          id?: string
          image_url?: string | null
          item_name: string
          last_updated_at?: string | null
          notes?: string | null
          os_date?: string | null
          os_notes?: string | null
          os_paid_amount?: number | null
          os_price?: number | null
          ownership_status?: Database["public"]["Enums"]["ownership_status"]
          paid_amount?: number
          price: number
          purchase_date: string
          purchase_origin?: Database["public"]["Enums"]["purchase_origin"]
          source_id: string
          tracking_status?:
            | Database["public"]["Enums"]["tracking_status"]
            | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          archived_at?: string | null
          artist_group?: string | null
          batch_id?: string | null
          country?: Database["public"]["Enums"]["country"] | null
          created_at?: string
          id?: string
          image_url?: string | null
          item_name?: string
          last_updated_at?: string | null
          notes?: string | null
          os_date?: string | null
          os_notes?: string | null
          os_paid_amount?: number | null
          os_price?: number | null
          ownership_status?: Database["public"]["Enums"]["ownership_status"]
          paid_amount?: number
          price?: number
          purchase_date?: string
          purchase_origin?: Database["public"]["Enums"]["purchase_origin"]
          source_id?: string
          tracking_status?:
            | Database["public"]["Enums"]["tracking_status"]
            | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_batch_id_source_id_user_id_fkey"
            columns: ["batch_id", "source_id", "user_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id", "source_id", "user_id"]
          },
          {
            foreignKeyName: "purchases_source_id_user_id_fkey"
            columns: ["source_id", "user_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          id: string
          name: string
          platform: string
          type: Database["public"]["Enums"]["source_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          platform: string
          type: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          platform?: string
          type?: Database["public"]["Enums"]["source_type"]
          updated_at?: string
          user_id?: string
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
      additional_cost_type: "TAX" | "PACKING" | "DOMESTIC_SHIPPING" | "OTHER"
      country:
        | "CHINA"
        | "KOREA"
        | "JAPAN"
        | "THAILAND"
        | "SINGAPORE"
        | "INDONESIA"
      ownership_status: "ACTIVE" | "GIVEN_OS"
      purchase_origin: "NEW" | "TAKEN_OS"
      source_type: "GROUP_ORDER" | "DIRECT_SELLER"
      tracking_status:
        | "PURCHASED"
        | "WAREHOUSE"
        | "IN_TRANSIT"
        | "INDONESIA"
        | "ADMIN_RECEIVED"
        | "DELIVERED"
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      additional_cost_type: ["TAX", "PACKING", "DOMESTIC_SHIPPING", "OTHER"],
      country: [
        "CHINA",
        "KOREA",
        "JAPAN",
        "THAILAND",
        "SINGAPORE",
        "INDONESIA",
      ],
      ownership_status: ["ACTIVE", "GIVEN_OS"],
      purchase_origin: ["NEW", "TAKEN_OS"],
      source_type: ["GROUP_ORDER", "DIRECT_SELLER"],
      tracking_status: [
        "PURCHASED",
        "WAREHOUSE",
        "IN_TRANSIT",
        "INDONESIA",
        "ADMIN_RECEIVED",
        "DELIVERED",
      ],
    },
  },
} as const
