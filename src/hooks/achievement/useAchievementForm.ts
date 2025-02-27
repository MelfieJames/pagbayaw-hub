
import { useState } from "react";
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
    removeImage,
    removeAdditionalImage,
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
    console.log("Submitting form", { formData, user });

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
      console.log("Mode:", mode);

      if (mode === 'add') {
        console.log("Creating achievement with data:", formData);
        const result = await createAchievement(formData, user);
        console.log("Create result:", result);
        achievementId = result.id;
      } else if (initialData?.id) {
        console.log("Updating achievement with ID:", initialData.id, "and data:", formData);
        await updateAchievement(initialData.id, formData);
        achievementId = initialData.id;
      } else {
        throw new Error('Invalid operation');
      }

      // Upload images
      console.log("Files to upload:", { 
        selectedFiles: selectedFiles.length, 
        additionalFiles: additionalFiles.length 
      });
      
      if (selectedFiles.length > 0 || additionalFiles.length > 0) {
        try {
          console.log("Uploading images for achievement ID:", achievementId);
          await uploadImages(achievementId);
        } catch (uploadError) {
          console.error("Error uploading images:", uploadError);
          throw new Error(`Achievement added but failed to upload images: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      console.log("Success! Calling onSuccess callback");
      onSuccess();
    } catch (error) {
      console.error("Error in form submission:", error);
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
    handleAdditionalFileChange,
    removeImage,
    removeAdditionalImage
  };
};
