import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AchievementFormInput } from "./AchievementFormInput";
import { ImageUploadSection } from "./ImageUploadSection";
import { useAchievementForm } from "@/hooks/useAchievementForm";
import { Award, FileText, Calendar, Image } from "lucide-react";

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
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <AchievementFormInput
            label="Achievement Name"
            name="achievement_name"
            value={formData.achievement_name}
            onChange={handleInputChange}
            required
            icon={<Award className="h-5 w-5 text-gray-500" />}
          />
          <AchievementFormInput
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            isTextarea
            icon={<FileText className="h-5 w-5 text-gray-500" />}
          />
        </div>
        
        <div className="space-y-4">
          <AchievementFormInput
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            icon={<Calendar className="h-5 w-5 text-gray-500" />}
          />

          <div className="relative">
            <div className="absolute left-0 top-0">
              <Image className="h-5 w-5 text-gray-500" />
            </div>
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
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
        {mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
      </Button>
    </form>
  );
};