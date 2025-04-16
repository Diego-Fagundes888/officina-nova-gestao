export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          client_name: string
          created_at: string
          date: string
          id: string
          notes: string | null
          notify_customer: boolean | null
          service_type: string
          status: string | null
          time: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_year: string
        }
        Insert: {
          client_name: string
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          notify_customer?: boolean | null
          service_type: string
          status?: string | null
          time: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_year: string
        }
        Update: {
          client_name?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          notify_customer?: boolean | null
          service_type?: string
          status?: string | null
          time?: string
          vehicle_model?: string
          vehicle_plate?: string
          vehicle_year?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          date: string
          description: string
          id: string
        }
        Insert: {
          amount?: number
          category: string
          date?: string
          description: string
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          date?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          created_at: string
          id: string
          min_stock: number
          name: string
          purchase_price: number
          selling_price: number
          stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          min_stock?: number
          name: string
          purchase_price?: number
          selling_price?: number
          stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          min_stock?: number
          name?: string
          purchase_price?: number
          selling_price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      service_order_parts: {
        Row: {
          id: string
          inventory_item_id: string | null
          name: string
          price: number
          quantity: number
          service_order_id: string
        }
        Insert: {
          id?: string
          inventory_item_id?: string | null
          name: string
          price?: number
          quantity?: number
          service_order_id: string
        }
        Update: {
          id?: string
          inventory_item_id?: string | null
          name?: string
          price?: number
          quantity?: number
          service_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_parts_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_parts_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          client_name: string
          completed_at: string | null
          created_at: string
          id: string
          labor_cost: number
          service_type: string
          status: string
          total: number
          updated_at: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_year: string
        }
        Insert: {
          client_name: string
          completed_at?: string | null
          created_at?: string
          id?: string
          labor_cost?: number
          service_type: string
          status: string
          total?: number
          updated_at?: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_year: string
        }
        Update: {
          client_name?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          labor_cost?: number
          service_type?: string
          status?: string
          total?: number
          updated_at?: string
          vehicle_model?: string
          vehicle_plate?: string
          vehicle_year?: string
        }
        Relationships: []
      }
      status_history: {
        Row: {
          appointment_id: string
          changed_at: string
          changed_by: string | null
          id: string
          new_status: string
          previous_status: string | null
        }
        Insert: {
          appointment_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status: string
          previous_status?: string | null
        }
        Update: {
          appointment_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: string
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          mechanic_name: string | null
          notes: string | null
          price: number | null
          service_date: string
          service_type: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          mechanic_name?: string | null
          notes?: string | null
          price?: number | null
          service_date?: string
          service_type: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          mechanic_name?: string | null
          notes?: string | null
          price?: number | null
          service_date?: string
          service_type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_services_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          model: string
          plate: string
          year: string
        }
        Insert: {
          created_at?: string
          id?: string
          model: string
          plate: string
          year: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string
          plate?: string
          year?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
