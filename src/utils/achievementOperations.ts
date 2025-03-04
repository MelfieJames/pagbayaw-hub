import { supabase } from "@/services/supabase/client";
import { User } from "@supabase/supabase-js";

export interface AchievementData {
  achievement_name: string;
  description: string;
  about_text?: string;
  date: string;
  venue: string;
  image: string;
}

export const createAchievement = async (data: AchievementData, user: User | null) => {
  if (!user) throw new Error("User not authenticated");
  
  const { data: achievement, error } = await supabase
    .from('achievements')
    .insert([{
      ...data,
      user_id: user.id
    }])
    .select()
    .single();

  if (error) throw error;
  return achievement;
};

export const updateAchievement = async (id: number, data: AchievementData) => {
  // For simplicity, keep only about_text and remove description field
  const { description, ...dataWithoutDescription } = data;
  
  const { error } = await supabase
    .from('achievements')
    .update({
      ...dataWithoutDescription,
      about_text: data.about_text || data.description // Use description as fallback
    })
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

export const getAchievementImages = async (achievementId: number) => {
  const { data, error } = await supabase
    .from('achievement_images')
    .select('*')
    .eq('achievement_id', achievementId)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
};

export const addAchievementImage = async (achievementId: number, imageUrl: string, displayOrder: number = 0) => {
  const { data, error } = await supabase
    .from('achievement_images')
    .insert({
      achievement_id: achievementId,
      image_url: imageUrl,
      display_order: displayOrder
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAchievementImage = async (imageId: number) => {
  const { error } = await supabase
    .from('achievement_images')
    .delete()
    .eq('id', imageId);

  if (error) throw error;
  return { success: true };
};

// Add new function to delete all achievement images for an achievement
export const deleteAllAchievementImages = async (achievementId: number) => {
  const { error } = await supabase
    .from('achievement_images')
    .delete()
    .eq('achievement_id', achievementId);

  if (error) throw error;
  return { success: true };
};

// Add new function for safe achievement deletion
export const deleteAchievement = async (achievementId: number) => {
  try {
    console.log('Starting to delete achievement with ID:', achievementId);
    
    // First get all associated image records to log them
    const { data: images, error: imagesError } = await supabase
      .from('achievement_images')
      .select('*')
      .eq('achievement_id', achievementId);
      
    if (imagesError) {
      console.error('Error fetching achievement images:', imagesError);
    } else {
      console.log('Found images to delete:', images?.length || 0);
    }
    
    // First delete all associated images
    await deleteAllAchievementImages(achievementId);
    console.log('Successfully deleted all achievement images');
    
    // Also delete any feedback for this achievement
    const { error: feedbackError } = await supabase
      .from('achievement_feedback')
      .delete()
      .eq('achievement_id', achievementId);
      
    if (feedbackError) {
      console.error('Error deleting achievement feedback:', feedbackError);
      throw feedbackError;
    }
    console.log('Successfully deleted achievement feedback');
    
    // Then delete the achievement
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', achievementId);
      
    if (error) {
      console.error('Error deleting achievement:', error);
      throw error;
    }
    
    console.log('Successfully deleted achievement');
    return { success: true };
  } catch (error) {
    console.error('Error in deleteAchievement:', error);
    throw error;
  }
};
