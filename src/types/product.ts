
import { ProductRow } from "./supabase";

export interface Product extends ProductRow {
  id: number;
  image: string | null;
  category: string;
  product_name: string;
  description: string;
  product_price: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  status?: string | null;
  featured?: boolean | null;
  tags?: string[] | null;
}

export interface ProductFormData {
  product_name: string;
  category: string;
  description: string;
  product_price: number;
  image: string | File | null;
  status?: string;
  featured?: boolean;
  tags?: string[];
}

export interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Product | null;
  isLoading?: boolean;
}
