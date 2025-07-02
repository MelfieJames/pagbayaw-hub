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
      achievement_feedback: {
        Row: {
          achievement_id: number
          comment: string
          created_at: string | null
          id: number
          rating: number
          user_id: string | null
        }
        Insert: {
          achievement_id: number
          comment: string
          created_at?: string | null
          id?: number
          rating: number
          user_id?: string | null
        }
        Update: {
          achievement_id?: number
          comment?: string
          created_at?: string | null
          id?: number
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_achievement"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      achievement_images: {
        Row: {
          achievement_id: number | null
          display_order: number | null
          id: number
          image_url: string | null
        }
        Insert: {
          achievement_id?: number | null
          display_order?: number | null
          id?: number
          image_url?: string | null
        }
        Update: {
          achievement_id?: number | null
          display_order?: number | null
          id?: number
          image_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievement_images_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      achievements: {
        Row: {
          about_text: string | null
          achievement_name: string
          created_at: string | null
          date: string
          description: string | null
          id: number
          image: string | null
          updated_at: string | null
          user_id: string | null
          venue: string | null
          video: string | null
        }
        Insert: {
          about_text?: string | null
          achievement_name: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: number
          image?: string | null
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
          video?: string | null
        }
        Update: {
          about_text?: string | null
          achievement_name?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: number
          image?: string | null
          updated_at?: string | null
          user_id?: string | null
          venue?: string | null
          video?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cart: {
        Row: {
          created_at: string | null
          id: number
          product_id: number | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id?: number | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: number | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_config: {
        Row: {
          auto_open: boolean
          auto_open_delay: number
          bot_name: string
          created_at: string
          enabled: boolean
          id: number
          position: string
          system_prompt: string
          theme_color: string
          updated_at: string
          welcome_message: string
        }
        Insert: {
          auto_open?: boolean
          auto_open_delay?: number
          bot_name?: string
          created_at?: string
          enabled?: boolean
          id?: number
          position?: string
          system_prompt?: string
          theme_color?: string
          updated_at?: string
          welcome_message?: string
        }
        Update: {
          auto_open?: boolean
          auto_open_delay?: number
          bot_name?: string
          created_at?: string
          enabled?: boolean
          id?: number
          position?: string
          system_prompt?: string
          theme_color?: string
          updated_at?: string
          welcome_message?: string
        }
        Relationships: []
      }
      chatbot_qa: {
        Row: {
          answer: string
          created_at: string
          display_order: number
          id: number
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          display_order?: number
          id?: number
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          display_order?: number
          id?: number
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string | null
          id: number
          product_id: number | null
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id?: number | null
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: number | null
          quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          expected_delivery_date: string | null
          id: number
          is_read: boolean | null
          message: string
          purchase_id: number | null
          tracking_number: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: number
          is_read?: boolean | null
          message: string
          purchase_id?: number | null
          tracking_number?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: number
          is_read?: boolean | null
          message?: string
          purchase_id?: number | null
          tracking_number?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      order_mngmnt: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          featured: boolean | null
          id: number
          image: string | null
          product_name: string
          product_price: number
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          featured?: boolean | null
          id?: number
          image?: string | null
          product_name: string
          product_price?: number
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          featured?: boolean | null
          id?: number
          image?: string | null
          product_name?: string
          product_price?: number
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          middle_name: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          middle_name?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          middle_name?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string | null
          id: number
          price_at_time: number
          product_id: number | null
          purchase_id: number | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          price_at_time: number
          product_id?: number | null
          purchase_id?: number | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: number
          price_at_time?: number
          product_id?: number | null
          purchase_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string | null
          email: string | null
          id: number
          status: string | null
          total_amount: number
          transaction_details_id: number | null
          updated_at: string | null
          user_address_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: number
          status?: string | null
          total_amount: number
          transaction_details_id?: number | null
          updated_at?: string | null
          user_address_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: number
          status?: string | null
          total_amount?: number
          transaction_details_id?: number | null
          updated_at?: string | null
          user_address_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transaction_details"
            columns: ["transaction_details_id"]
            isOneToOne: false
            referencedRelation: "transaction_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_address_id_fkey"
            columns: ["user_address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: number
          image_url: string | null
          product_id: number | null
          purchase_item_id: number | null
          rating: number
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          product_id?: number | null
          purchase_item_id?: number | null
          rating: number
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          product_id?: number | null
          purchase_item_id?: number | null
          rating?: number
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_purchase_item_id_fkey"
            columns: ["purchase_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_items"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_details: {
        Row: {
          address: string
          created_at: string
          email: string
          first_name: string
          id: number
          last_name: string
          phone_number: string
          profile_picture_path: string | null
          purchase_id: number | null
        }
        Insert: {
          address: string
          created_at?: string
          email: string
          first_name: string
          id?: number
          last_name: string
          phone_number: string
          profile_picture_path?: string | null
          purchase_id?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: number
          last_name?: string
          phone_number?: string
          profile_picture_path?: string | null
          purchase_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_details_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_name: string
          barangay: string
          city: string
          country: string
          created_at: string
          id: number
          is_default: boolean | null
          phone_number: string
          postal_code: string
          purok: string | null
          recipient_name: string
          state_province: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_name: string
          barangay?: string
          city: string
          country: string
          created_at?: string
          id?: never
          is_default?: boolean | null
          phone_number: string
          postal_code: string
          purok?: string | null
          recipient_name: string
          state_province: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_name?: string
          barangay?: string
          city?: string
          country?: string
          created_at?: string
          id?: never
          is_default?: boolean | null
          phone_number?: string
          postal_code?: string
          purok?: string | null
          recipient_name?: string
          state_province?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
