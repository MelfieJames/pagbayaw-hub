import { createClient } from "@supabase/supabase-js";
import { Database } from "@/services/supabase/types";



export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Table row types
export type ProductRow = Tables<'products'>;
export type AchievementRow = Tables<'achievements'>;
export type TransactionDetailsRow = Tables<'transaction_details'>;
export type ProfileRow = Tables<'profiles'>; // ✅ Added this for profile-related logic

// Roles
export type Role = 'admin' | 'user';
