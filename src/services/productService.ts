
import { supabase } from "@/services/supabase/client";
import { Product, ProductFormData } from "@/types/product";

export async function createProduct(data: ProductFormData): Promise<Product> {
  console.log('Creating product with data:', data);
  let imagePath = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

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

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        product_name: data.product_name,
        category: data.category,
        description: data.description,
        product_price: data.product_price,
        image: imagePath,
        user_id: session.user.id
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
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    throw error;
  }
}

export async function getProducts(): Promise<Product[]> {
  console.log('Fetching products...');
  try {
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

    if (!data) {
      console.log('No products found, returning empty array');
      return [];
    }

    console.log('Products fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    throw error;
  }
}

export async function deleteProduct(id: number): Promise<void> {
  console.log('Deleting product with ID:', id);
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // With cascading deletes now in place, we can just delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    
    console.log('Product deleted successfully');
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    throw error;
  }
}

export interface UpdateProductParams {
  id: number;
  data: ProductFormData;
}

export async function updateProduct({ id, data }: UpdateProductParams): Promise<Product> {
  console.log('Updating product:', { id, data });
  let imagePath = null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select()
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching product:', fetchError);
      throw fetchError;
    }

    if (!existingProduct) {
      console.error('Product not found with ID:', id);
      throw new Error('Product not found');
    }

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

    const updateData = {
      product_name: data.product_name,
      category: data.category,
      description: data.description,
      product_price: data.product_price,
      ...(imagePath && { image: imagePath }),
      user_id: session.user.id,
      updated_at: new Date().toISOString()
    };

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error('Error updating product:', updateError);
      throw updateError;
    }

    if (!updatedProduct) {
      throw new Error('Failed to update product');
    }

    return updatedProduct;
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    throw error;
  }
}

export async function getProductReviews(productId: number) {
  console.log('Fetching reviews for product:', productId);
  
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(email, id)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
    
    console.log('Reviews fetched successfully:', data);
    return data || [];
  } catch (error) {
    console.error('Error in getProductReviews:', error);
    throw error;
  }
}

export async function createReview({ productId, rating, comment, userId }: { 
  productId: number, 
  rating: number, 
  comment: string, 
  userId: string 
}) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        rating,
        comment,
        user_id: userId
      })
      .select();
      
    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createReview:', error);
    throw error;
  }
}

export async function updateReview({ 
  reviewId, 
  rating, 
  comment 
}: { 
  reviewId: number, 
  rating: number, 
  comment: string 
}) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select();
      
    if (error) {
      console.error('Error updating review:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateReview:', error);
    throw error;
  }
}

export async function deleteReview(reviewId: number) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
      
    if (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteReview:', error);
    throw error;
  }
}
