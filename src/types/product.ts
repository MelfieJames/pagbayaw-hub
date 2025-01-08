export interface Product {
  id: number;
  image: string | null;
  category: string;
  product_name: string;
  description: string;
  link: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ProductFormData {
  image: File | null;
  category: string;
  product_name: string;
  description: string;
  link: string;
}