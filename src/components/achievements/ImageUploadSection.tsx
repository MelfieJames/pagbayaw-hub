import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ImageUploadSectionProps {
  imageType: 'url' | 'file';
  imageUrl: string;
  imagePreview: string | null;
  onImageTypeChange: (value: 'url' | 'file') => void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageUploadSection = ({
  imageType,
  imageUrl,
  imagePreview,
  onImageTypeChange,
  onUrlChange,
  onFileChange,
}: ImageUploadSectionProps) => {
  return (
    <div className="space-y-4">
      <Label>Image Upload Method</Label>
      <RadioGroup
        defaultValue={imageType}
        onValueChange={(value) => onImageTypeChange(value as 'url' | 'file')}
        className="flex flex-col space-y-1"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="url" id="url" />
          <Label htmlFor="url">Image URL</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="file" id="file" />
          <Label htmlFor="file">Upload File</Label>
        </div>
      </RadioGroup>

      {imageType === 'url' ? (
        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            name="image"
            value={imageUrl}
            onChange={onUrlChange}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="file-upload">Choose Image</Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="cursor-pointer"
          />
        </div>
      )}

      {imagePreview && (
        <div className="mt-4">
          <Label>Preview</Label>
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-2 max-w-[200px] h-auto rounded-md"
          />
        </div>
      )}
    </div>
  );
};