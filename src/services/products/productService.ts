
import { supabase } from '../supabase/client';
import { Product, ProductFormData } from '@/types/product';
import { uploadProductImage } from './imageUpload';
import { ProductRow } from '@/types/supabase';

export async function createProduct(data: ProductFormData): Promise<Product> {
  console.log('Creating product with data:', data);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  const imagePath = await uploadProductImage(data.image);

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      product_name: data.product_name,
      category: data.category,
      description: data.description,
      product_price: data.product_price,
      image: imagePath,
      user_id: session.user.id,
      status: data.status,
      featured: data.featured,
      tags: data.tags
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  if (!product) {
    throw new Error('Failed to create product');
  }

  return product as Product;
}

export async function getProducts(): Promise<Product[]> {
  console.log('Fetching products...');
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('No active session found');
    throw new Error('Authentication required');
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  console.log('Products fetched successfully:', data);
  return (data || []) as Product[];
}

export async function deleteProduct(id: number): Promise<void> {
  console.log('Deleting product with ID:', id);
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

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

export async function updateProduct({ id, data }: { id: number; data: ProductFormData }): Promise<Product> {
  console.log('Updating product:', { id, data });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  const { data: existingProduct, error: fetchError } = await supabase
    .from('products')
    .select()
    .eq('id', id)
    .single();

  if (fetchError || !existingProduct) {
    console.error('Error fetching product:', fetchError);
    throw fetchError || new Error('Product not found');
  }

  const imagePath = await uploadProductImage(data.image);

  const updateData = {
    product_name: data.product_name,
    category: data.category,
    description: data.description,
    product_price: data.product_price,
    ...(imagePath && { image: imagePath }),
    user_id: session.user.id,
    updated_at: new Date().toISOString(),
    status: data.status,
    featured: data.featured,
    tags: data.tags
  };

  const { data: updatedProduct, error: updateError } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating product:', updateError);
    throw updateError;
  }

  if (!updatedProduct) {
    throw new Error('Failed to update product');
  }

  return updatedProduct as Product;
}
