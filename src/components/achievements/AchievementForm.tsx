import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievementForm } from "@/hooks/achievement/useAchievementForm";
import { AchievementFormFields } from "./form/AchievementFormFields";
import { useState } from "react";

interface AchievementFormProps {
  onSuccess: () => void;
  initialData?: {
    id?: number;
    achievement_name: string;
    description: string;
    date: string;
    image: string;
  };
  mode: 'add' | 'edit';
}

export const AchievementForm = ({ onSuccess, initialData, mode }: AchievementFormProps) => {
  const { user } = useAuth();
  const [additionalImageCount, setAdditionalImageCount] = useState(0);
  
  const {
    formData,
    imagePreviews,
    additionalPreviews,
    handleInputChange,
    handleSubmit,
    handleFileChange,
    handleAdditionalFileChange
  } = useAchievementForm({ 
    initialData, 
    mode, 
    onSuccess, 
    user
  });

  const handleAddMoreImages = () => {
    setAdditionalImageCount(prev => prev + 1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AchievementFormFields
        formData={formData}
        imagePreview={imagePreviews[0]}
        imagePreviews={imagePreviews}
        handleInputChange={handleInputChange}
        handleMultipleFileChange={handleFileChange}
        onAddMoreImages={handleAddMoreImages}
        additionalPreviews={additionalPreviews.slice(0, additionalImageCount)}
        onAdditionalFileChange={handleAdditionalFileChange}
      />

      <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
        {mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
      </Button>
    </form>
  );
};