
import { useState } from "react";
import { createAchievement, updateAchievement, AchievementData } from "@/utils/achievementOperations";
import { useAuth } from "@/contexts/AuthContext";

export const useAchievementForm = (achievement?: any, onOpenChange?: (open: boolean) => void) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AchievementData & { video?: string }>({
    achievement_name: achievement?.achievement_name || "",
    description: achievement?.description || "",
    date: achievement?.date || "",
    venue: achievement?.venue || "",
    image: achievement?.image || "",
    about_text: achievement?.about_text || "",
    video: achievement?.video || ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isAdmin) {
      throw new Error("Only admin users can manage achievements");
    }

    setIsSubmitting(true);
    try {
      // Remove video from form data when saving since it's not in the interface
      const { video, ...dataToSave } = formData;
      
      if (achievement?.id) {
        await updateAchievement(achievement.id, dataToSave);
      } else {
        await createAchievement(dataToSave, user);
      }
      
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      achievement_name: "",
      description: "",
      date: "",
      venue: "",
      image: "",
      about_text: "",
      video: ""
    });
  };

  return {
    formData,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
