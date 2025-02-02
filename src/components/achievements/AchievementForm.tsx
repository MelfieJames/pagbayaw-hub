import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievementForm } from "@/hooks/useAchievementForm";
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
  const [additionalImages, setAdditionalImages] = useState<Array<{ type: 'url' | 'file', value: string }>>([]);
  
  const {
    formData,
    imageType,
    imagePreview,
    handleInputChange,
    handleSubmit,
    setImageType,
    handleMultipleFileChange,
    imagePreviews,
    handleAdditionalImageChange,
    handleAdditionalFileChange
  } = useAchievementForm({ 
    initialData, 
    mode, 
    onSuccess, 
    user, 
    additionalImages 
  });

  const handleAddMoreImages = () => {
    setAdditionalImages(prev => [...prev, { type: 'url', value: '' }]);
  };

  const handleImageTypeChange = (index: number, type: 'url' | 'file') => {
    setAdditionalImages(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], type, value: '' };
      return updated;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AchievementFormFields
        formData={formData}
        imageType={imageType}
        imagePreview={imagePreview}
        imagePreviews={imagePreviews}
        handleInputChange={handleInputChange}
        handleMultipleFileChange={handleMultipleFileChange}
        setImageType={setImageType}
        onAddMoreImages={handleAddMoreImages}
        additionalImages={additionalImages}
        onAdditionalImageChange={handleAdditionalImageChange}
        onAdditionalFileChange={handleAdditionalFileChange}
        onImageTypeChange={handleImageTypeChange}
      />

      <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
        {mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
      </Button>
    </form>
  );
};