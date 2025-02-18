
import { Database } from "@/services/supabase/types";

export interface Product {
  id: number;
  image: string | null;
  category: string;
  product_name: string;
  description: string;
  product_price: number;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
  status: string | null;
  featured: boolean | null;
  tags: string[] | null;
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

export interface CartItem {
  quantity: number;
  product_id: number;
  products: {
    product_name: string;
    product_price: number;
    image: string | null;
    category: string;
  } | null;
}

export interface WishlistItem {
  product_id: number;
  products: {
    product_name: string;
    product_price: number;
    image: string | null;
  } | null;
}
