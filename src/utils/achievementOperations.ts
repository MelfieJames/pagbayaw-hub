
import { supabase } from "@/services/supabase/client";
import { User } from "@supabase/supabase-js";

export interface AchievementData {
  achievement_name: string;
  description: string;
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
  const { error } = await supabase
    .from('achievements')
    .update(data)
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};
