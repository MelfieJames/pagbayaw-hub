
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
        }
        Insert: {
          id?: number
          achievement_name: string
          description: string
          date: string
          image: string
          created_at?: string
        }
        Update: {
          id?: number
          achievement_name?: string
          description?: string
          date?: string
          image?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          image: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          price: number
          image: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          price?: number
          image?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
        }
        Insert: {
          id: string
          email: string
          name?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
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
