
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImageUploadSectionProps {
  imagePreview: string | null;
  imagePreviews?: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
}

export const ImageUploadSection = ({
  imagePreview,
  imagePreviews = [],
  onFileChange,
  multiple = false,
}: ImageUploadSectionProps) => {
  return (
    <div className="space-y-4 pl-7">
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

      {multiple ? (
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
