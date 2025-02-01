import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievementForm } from "@/hooks/useAchievementForm";
import { AchievementFormFields } from "./form/AchievementFormFields";

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
  const {
    formData,
    imageType,
    imagePreview,
    handleInputChange,
    handleSubmit,
    setImageType,
    handleMultipleFileChange,
    imagePreviews
  } = useAchievementForm({ initialData, mode, onSuccess, user });

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
      />

      <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
        {mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
      </Button>
    </form>
  );
};