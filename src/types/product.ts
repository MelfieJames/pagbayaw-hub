export interface Product {
  id: number;
  image: string | null;
  category: string;
  product_name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ProductFormData {
  product_name: string;
  category: string;
  description: string;
  image: File | null;
}

export interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: Product | null;
  isLoading?: boolean;
}