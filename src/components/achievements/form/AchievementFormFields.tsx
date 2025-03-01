
import { Award, FileText, Calendar, Image, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage?: (index: number) => void;
}

export const AchievementFormFields = ({
  formData,
  imagePreview,
  handleInputChange,
  handleFileChange,
  onRemoveImage,
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
          onFileChange={handleFileChange}
          onRemoveImage={onRemoveImage}
        />
      </div>
    </div>
  );
};
