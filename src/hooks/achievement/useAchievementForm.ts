
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createAchievement, updateAchievement, AchievementData } from "@/utils/achievementOperations";
import { CustomUser } from "@/contexts/AuthContext";
import { useAchievementImages } from "./useAchievementImages";

interface UseAchievementFormProps {
  initialData?: AchievementData & { id?: number };
  mode: 'add' | 'edit';
  onSuccess: () => void;
  onError: (error: Error) => void;
  user: CustomUser | null;
}

export const useAchievementForm = ({ initialData, mode, onSuccess, onError, user }: UseAchievementFormProps) => {
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
      onError(new Error("Only admin users can manage achievements"));
      return;
    }

    try {
      // Validate required fields
      if (!formData.achievement_name || !formData.date || !formData.venue) {
        throw new Error("Please fill in all required fields");
      }

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

      // Upload images
      if (selectedFiles.length > 0 || additionalFiles.length > 0) {
        await uploadImages(achievementId);
      }

      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('An unexpected error occurred'));
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
