
import { supabase } from '../supabase/client';

export async function uploadProductImage(image: File | string): Promise<string | null> {
  if (!image) return null;
  
  if (typeof image === 'string') return image;
  
  const fileExt = image.name.split('.').pop();
  const filePath = `${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(filePath, image);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('Error uploading image');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(filePath);

  return publicUrl;
}
