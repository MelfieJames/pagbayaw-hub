
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase/client";
import { createAchievement, updateAchievement, AchievementData } from "@/utils/achievementOperations";
import { CustomUser } from "@/contexts/AuthContext";
import { useAchievementImages } from "./useAchievementImages";

interface UseAchievementFormProps {
  initialData?: AchievementData & { id?: number };
  mode: 'add' | 'edit';
  onSuccess: () => void;
  user: CustomUser | null;
}

export const useAchievementForm = ({ initialData, mode, onSuccess, user }: UseAchievementFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AchievementData>({
    achievement_name: initialData?.achievement_name || "",
    description: initialData?.description || "",
    date: initialData?.date || "",
    venue: initialData?.venue || "",
    image: initialData?.image || ""
  });

  const {
    selectedFiles,
    imagePreviews,
    additionalFiles,
    additionalPreviews,
    handleFileChange,
    handleAdditionalFileChange,
    uploadImages
  } = useAchievementImages();

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
      toast({
        title: "Error",
        description: "Only admin users can manage achievements",
        variant: "destructive"
      });
      return;
    }

    try {
      let achievementId: number;

      if (mode === 'add') {
        const result = await createAchievement(formData, user);
        achievementId = result.id;
      } else if (initialData?.id) {
        await updateAchievement(initialData.id, formData);
        achievementId = initialData.id;
      } else {
        throw new Error('Invalid operation');
      }

      await uploadImages(achievementId);

      toast({
        title: "Success",
        description: `Achievement ${mode === 'add' ? 'added' : 'updated'} successfully`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode} achievement`,
        variant: "destructive"
      });
    }
  };

  return {
    formData,
    imagePreviews,
    additionalPreviews,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    handleAdditionalFileChange
  };
};
