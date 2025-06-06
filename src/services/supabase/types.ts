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
      chatbot_config: {
        Row: {
          id: number
          enabled: boolean
          welcome_message: string
          system_prompt: string
          bot_name: string
          theme_color: string
          position: 'bottom-right' | 'bottom-left'
          auto_open: boolean
          auto_open_delay: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          enabled?: boolean
          welcome_message?: string
          system_prompt?: string
          bot_name?: string
          theme_color?: string
          position?: 'bottom-right' | 'bottom-left'
          auto_open?: boolean
          auto_open_delay?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          enabled?: boolean
          welcome_message?: string
          system_prompt?: string
          bot_name?: string
          theme_color?: string
          position?: 'bottom-right' | 'bottom-left'
          auto_open?: boolean
          auto_open_delay?: number
          created_at?: string
          updated_at?: string
        }
      }
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
          profile_picture?: string
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
          profile_picture?: string
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
          profile_picture?: string
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
          transaction_details_id?: number
        }
        Insert: {
          id?: number
          user_id: string
          total_amount: number
          status?: string
          created_at?: string
          updated_at?: string
          transaction_details_id?: number
        }
        Update: {
          id?: number
          user_id?: string
          total_amount?: number
          status?: string
          created_at?: string
          updated_at?: string
          transaction_details_id?: number
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
      user_addresses: {
        Row: {
          id: number
          user_id: string
          address_name: string
          recipient_name: string
          address_line1: string
          address_line2: string | null
          city: string
          state_province: string
          postal_code: string
          country: string
          phone_number: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          address_name: string
          recipient_name: string
          address_line1: string
          address_line2?: string | null
          city: string
          state_province: string
          postal_code: string
          country: string
          phone_number: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          address_name?: string
          recipient_name?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state_province?: string
          postal_code?: string
          country?: string
          phone_number?: string
          is_default?: boolean
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
