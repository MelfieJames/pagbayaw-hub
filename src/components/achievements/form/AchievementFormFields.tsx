
import { Award, FileText, Calendar, Image, Plus, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUploadSection } from "../ImageUploadSection";

interface AchievementFormFieldsProps {
  formData: {
    achievement_name: string;
    description: string;
    date: string;
    venue: string;
    image: string;
  };
  imagePreview: string | null;
  imagePreviews: string[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleMultipleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddMoreImages?: () => void;
  additionalPreviews?: string[];
  handleAdditionalFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: (index: number) => void;
  onRemoveAdditionalImage?: (index: number) => void;
}

export const AchievementFormFields = ({
  formData,
  imagePreview,
  imagePreviews,
  handleInputChange,
  handleMultipleFileChange,
  onAddMoreImages,
  additionalPreviews = [],
  handleAdditionalFileChange,
  onRemoveImage,
  onRemoveAdditionalImage,
}: AchievementFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          Achievement Name
        </Label>
        <Input
          name="achievement_name"
          value={formData.achievement_name}
          onChange={handleInputChange}
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Date
        </Label>
        <Input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Venue
        </Label>
        <Input
          name="venue"
          value={formData.venue}
          onChange={handleInputChange}
          className="mt-2"
          required
        />
      </div>

      <div>
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          About this Achievement
        </Label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="mt-2 min-h-[200px]"
          required
        />
      </div>

      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Image className="h-4 w-4" />
          Title Picture
        </Label>
        <ImageUploadSection
          imagePreview={imagePreview}
          onFileChange={handleMultipleFileChange}
          onRemoveImage={onRemoveImage}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Additional Pictures
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddMoreImages}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add More Pictures
          </Button>
        </div>

        {additionalPreviews.length > 0 && (
          <ImageUploadSection
            imagePreviews={additionalPreviews}
            onFileChange={handleAdditionalFileChange}
            multiple={true}
            onRemoveImage={onRemoveAdditionalImage}
            showFileInput={false}
          />
        )}
      </div>
    </div>
  );
};
