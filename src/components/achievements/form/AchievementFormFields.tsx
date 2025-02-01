import { Award, FileText, Calendar, Image } from "lucide-react";
import { AchievementFormInput } from "../AchievementFormInput";
import { ImageUploadSection } from "../ImageUploadSection";

interface AchievementFormFieldsProps {
  formData: {
    achievement_name: string;
    description: string;
    date: string;
    image: string;
  };
  imageType: 'url' | 'file';
  imagePreview: string | null;
  imagePreviews: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleMultipleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setImageType: (type: 'url' | 'file') => void;
}

export const AchievementFormFields = ({
  formData,
  imageType,
  imagePreview,
  imagePreviews,
  handleInputChange,
  handleMultipleFileChange,
  setImageType,
}: AchievementFormFieldsProps) => {
  return (
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
  );
};