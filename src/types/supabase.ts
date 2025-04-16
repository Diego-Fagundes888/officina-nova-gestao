export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          client_name: string
          vehicle_model: string
          vehicle_year: string
          vehicle_plate: string
          service_type: string
          date: string
          time: string
          notes: string | null
          created_at: string
          status: string
        }
        Insert: {
          id?: string
          client_name: string
          vehicle_model: string
          vehicle_year: string
          vehicle_plate: string
          service_type: string
          date: string
          time: string
          notes?: string | null
          created_at?: string
          status?: string
        }
        Update: {
          id?: string
          client_name?: string
          vehicle_model?: string
          vehicle_year?: string
          vehicle_plate?: string
          service_type?: string
          date?: string
          time?: string
          notes?: string | null
          created_at?: string
          status?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          description: string
          amount: number
          date: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          date: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          date?: string
          category?: string
          created_at?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          id: string
          name: string
          purchase_price: number
          selling_price: number
          stock: number
          min_stock: number
        }
        Insert: {
          id?: string
          name: string
          purchase_price: number
          selling_price: number
          stock: number
          min_stock: number
        }
        Update: {
          id?: string
          name?: string
          purchase_price?: number
          selling_price?: number
          stock?: number
          min_stock?: number
        }
        Relationships: []
      }
      service_order_parts: {
        Row: {
          id: string
          service_order_id: string | null
          name: string
          price: number
          quantity: number
          inventory_item_id: string | null
        }
        Insert: {
          id?: string
          service_order_id?: string | null
          name: string
          price: number
          quantity: number
          inventory_item_id?: string | null
        }
        Update: {
          id?: string
          service_order_id?: string | null
          name?: string
          price?: number
          quantity?: number
          inventory_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_order_parts_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          }
        ]
      }
      service_orders: {
        Row: {
          id: string
          client_name: string
          vehicle_model: string
          vehicle_year: string
          vehicle_plate: string
          service_type: string
          labor_cost: number
          total: number
          status: string
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          client_name: string
          vehicle_model: string
          vehicle_year: string
          vehicle_plate: string
          service_type: string
          labor_cost: number
          total: number
          status: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          client_name?: string
          vehicle_model?: string
          vehicle_year?: string
          vehicle_plate?: string
          service_type?: string
          labor_cost?: number
          total?: number
          status?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      vehicle_services: {
        Row: {
          id: string
          vehicle_id: string
          service_type: string
          description: string | null
          notes: string | null
          service_date: string
          price: number | null
          mechanic_name: string | null
          created_at: string
          client_name: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          service_type: string
          description?: string | null
          notes?: string | null
          service_date: string
          price?: number | null
          mechanic_name?: string | null
          created_at?: string
          client_name: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          service_type?: string
          description?: string | null
          notes?: string | null
          service_date?: string
          price?: number | null
          mechanic_name?: string | null
          created_at?: string
          client_name?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          id: string
          plate: string
          model: string
          year: string
          created_at: string
        }
        Insert: {
          id?: string
          plate: string
          model: string
          year: string
          created_at?: string
        }
        Update: {
          id?: string
          plate?: string
          model?: string
          year?: string
          created_at?: string
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
