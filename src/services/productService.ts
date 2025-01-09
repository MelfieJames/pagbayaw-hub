import { supabase } from "@/integrations/supabase/client";
import { Product, ProductFormData } from "@/types/product";

export async function createProduct(data: ProductFormData): Promise<Product> {
  let imagePath = null;

  if (data.image) {
    const fileExt = data.image.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, data.image);

    if (uploadError) {
      throw new Error('Error uploading image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    imagePath = publicUrl;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product, error } = await supabase
    .from('products')
    .insert([{
      product_name: data.product_name,
      category: data.category,
      description: data.description,
      product_price: data.product_price,
      image: imagePath,
      user_id: user?.id
    }])
    .select()
    .single();

  if (error) throw error;
  return product;
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export interface UpdateProductParams {
  id: number;
  data: ProductFormData;
}

export async function updateProduct({ id, data }: UpdateProductParams): Promise<Product> {
  let imagePath = null;

  if (data.image) {
    const fileExt = data.image.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, data.image);

    if (uploadError) {
      throw new Error('Error uploading image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    imagePath = publicUrl;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const updateData = {
    product_name: data.product_name,
    category: data.category,
    description: data.description,
    product_price: data.product_price,
    ...(imagePath && { image: imagePath }),
    user_id: user?.id
  };

  const { data: product, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return product;
}