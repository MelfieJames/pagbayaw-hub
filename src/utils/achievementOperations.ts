import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AchievementData {
  achievement_name: string;
  description: string;
  date: string;
  image: string;
  video: string;
}

export const createAchievement = async (data: AchievementData, user: User | null) => {
  if (!user) throw new Error("User not authenticated");
  
  const { error } = await supabase
    .from('achievements')
    .insert([{
      ...data,
      user_id: user.id // Using the actual UUID from authenticated user
    }]);

  if (error) throw error;
  return { success: true };
};

export const updateAchievement = async (id: number, data: AchievementData) => {
  const { error } = await supabase
    .from('achievements')
    .update(data)
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};