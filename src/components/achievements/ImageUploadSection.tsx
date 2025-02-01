import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImageUploadSectionProps {
  imageType: 'url' | 'file';
  imageUrl: string;
  imagePreview: string | null;
  imagePreviews?: string[];
  onImageTypeChange: (value: 'url' | 'file') => void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
}

export const ImageUploadSection = ({
  imageType,
  imageUrl,
  imagePreview,
  imagePreviews = [],
  onImageTypeChange,
  onUrlChange,
  onFileChange,
  multiple = false,
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
          <Label htmlFor="file-upload">Choose Image{multiple ? 's' : ''}</Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="cursor-pointer"
            multiple={multiple}
          />
        </div>
      )}

      {multiple && imagePreviews && imagePreviews.length > 0 ? (
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="grid grid-cols-2 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-auto rounded-md"
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : imagePreview && (
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