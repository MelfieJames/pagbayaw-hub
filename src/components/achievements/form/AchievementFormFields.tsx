import { Award, FileText, Calendar, Image, Plus } from "lucide-react";
import { AchievementFormInput } from "../AchievementFormInput";
import { ImageUploadSection } from "../ImageUploadSection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  onAddMoreImages?: () => void;
  additionalImages?: Array<{ type: 'url' | 'file', value: string }>;
  onAdditionalImageChange?: (index: number, value: string) => void;
  onAdditionalFileChange?: (index: number, file: File) => void;
  onImageTypeChange?: (index: number, type: 'url' | 'file') => void;
}

export const AchievementFormFields = ({
  formData,
  imageType,
  imagePreview,
  imagePreviews,
  handleInputChange,
  handleMultipleFileChange,
  setImageType,
  onAddMoreImages,
  additionalImages = [],
  onAdditionalImageChange,
  onAdditionalFileChange,
  onImageTypeChange,
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
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Images</span>
            {onAddMoreImages && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddMoreImages}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add More Images
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
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

              {additionalImages.map((img, index) => (
                <div key={index} className="pt-4 border-t">
                  <ImageUploadSection
                    imageType={img.type}
                    imageUrl={img.value}
                    imagePreview={null}
                    onImageTypeChange={(type) => onImageTypeChange?.(index, type)}
                    onUrlChange={(e) => onAdditionalImageChange?.(index, e.target.value)}
                    onFileChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onAdditionalFileChange) {
                        onAdditionalFileChange(index, file);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};