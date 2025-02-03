import { supabase } from "@/integrations/supabase/client";
import { Product, ProductFormData } from "@/types/product";

export async function createProduct(data: ProductFormData): Promise<Product> {
  console.log('Creating product with data:', data);
  let imagePath = null;

  if (data.image) {
    if (data.image instanceof File) {
      const fileExt = data.image.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, data.image);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Error uploading image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      imagePath = publicUrl;
    } else {
      imagePath = data.image;
    }
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
    .maybeSingle();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  if (!product) {
    throw new Error('Failed to create product');
  }

  return product;
}

export async function getProducts(): Promise<Product[]> {
  console.log('Fetching products...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log('Products fetched successfully:', data);
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    throw error;
  }
}

export async function deleteProduct(id: number): Promise<void> {
  console.log('Deleting product with ID:', id);
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
  
  console.log('Product deleted successfully');
}

export interface UpdateProductParams {
  id: number;
  data: ProductFormData;
}

export async function updateProduct({ id, data }: UpdateProductParams): Promise<Product> {
  console.log('Updating product:', { id, data });
  let imagePath = null;

  if (data.image) {
    if (data.image instanceof File) {
      const fileExt = data.image.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, data.image);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw new Error('Error uploading image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      imagePath = publicUrl;
    } else {
      imagePath = data.image;
    }
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
    .maybeSingle();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}