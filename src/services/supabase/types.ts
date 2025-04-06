
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
      achievements: {
        Row: {
          id: number
          achievement_name: string
          description: string
          date: string
          image: string
          created_at: string
          venue?: string
          updated_at?: string
          about_text?: string
          user_id?: string
          video?: string
        }
        Insert: {
          id?: number
          achievement_name: string
          description: string
          date: string
          image: string
          created_at?: string
          venue?: string
          updated_at?: string
          about_text?: string
          user_id?: string
          video?: string
        }
        Update: {
          id?: number
          achievement_name?: string
          description?: string
          date?: string
          image?: string
          created_at?: string
          venue?: string
          updated_at?: string
          about_text?: string
          user_id?: string
          video?: string
        }
      }
      products: {
        Row: {
          id: number
          product_name: string
          description: string
          product_price: number
          image: string
          created_at: string
          category: string
          featured?: boolean
          updated_at?: string
          user_id?: string
          status?: string
          tags?: string[]
        }
        Insert: {
          id?: number
          product_name: string
          description: string
          product_price: number
          image: string
          created_at?: string
          category: string
          featured?: boolean
          updated_at?: string
          user_id?: string
          status?: string
          tags?: string[]
        }
        Update: {
          id?: number
          product_name?: string
          description?: string
          product_price?: number
          image?: string
          created_at?: string
          category?: string
          featured?: boolean
          updated_at?: string
          user_id?: string
          status?: string
          tags?: string[]
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name?: string
          middle_name?: string
          last_name?: string
          phone_number?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string
          middle_name?: string
          last_name?: string
          phone_number?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          middle_name?: string
          last_name?: string
          phone_number?: string
          location?: string
          created_at?: string
          updated_at?: string
        }
      }
      cart: {
        Row: {
          id: number
          user_id: string
          product_id: number
          quantity: number
          created_at?: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          quantity: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          quantity?: number
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: number
          product_id: number
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          product_id: number
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          product_id?: number
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: number
          user_id: string
          total_amount: number
          status: string
          created_at: string
          updated_at?: string
        }
        Insert: {
          id?: number
          user_id: string
          total_amount: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          total_amount?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      purchase_items: {
        Row: {
          id: number
          purchase_id: number
          product_id: number
          quantity: number
          price_at_time: number
          created_at?: string
        }
        Insert: {
          id?: number
          purchase_id: number
          product_id: number
          quantity: number
          price_at_time: number
          created_at?: string
        }
        Update: {
          id?: number
          purchase_id?: number
          product_id?: number
          quantity?: number
          price_at_time?: number
          created_at?: string
        }
      }
      transaction_details: {
        Row: {
          id: number
          purchase_id: number
          first_name: string
          last_name: string
          email: string
          phone_number: string
          address: string
          created_at: string
        }
        Insert: {
          id?: number
          purchase_id: number
          first_name: string
          last_name: string
          email: string
          phone_number: string
          address: string
          created_at?: string
        }
        Update: {
          id?: number
          purchase_id?: number
          first_name?: string
          last_name?: string
          email?: string
          phone_number?: string
          address?: string
          created_at?: string
        }
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
  }
}
