import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AchievementFormInput } from "./AchievementFormInput";
import { ImageUploadSection } from "./ImageUploadSection";
import { useAchievementForm } from "@/hooks/useAchievementForm";

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
    handleFileChange,
    handleSubmit,
    setImageType,
    handleMultipleFileChange,
    imagePreviews
  } = useAchievementForm({ initialData, mode, onSuccess, user });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AchievementFormInput
        label="Achievement Name"
        name="achievement_name"
        value={formData.achievement_name}
        onChange={handleInputChange}
        required
      />
      <AchievementFormInput
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        isTextarea
      />
      <AchievementFormInput
        label="Date"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleInputChange}
        required
      />

      <ImageUploadSection
        imageType={imageType}
        imageUrl={formData.image}
        imagePreview={imagePreview}
        onImageTypeChange={setImageType}
        onUrlChange={handleInputChange}
        onFileChange={handleMultipleFileChange}
        multiple={true}
        imagePreviews={imagePreviews}
      />

      <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
        {mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
      </Button>
    </form>
  );
};