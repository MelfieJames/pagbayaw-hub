
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImageUploadSectionProps {
  imagePreview?: string | null;  // Made optional with ? operator
  imagePreviews?: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
  onRemoveImage?: (index: number) => void;
  showFileInput?: boolean;
}

export const ImageUploadSection = ({
  imagePreview,
  imagePreviews = [],
  onFileChange,
  multiple = false,
  onRemoveImage,
  showFileInput = true,
}: ImageUploadSectionProps) => {
  return (
    <div className="space-y-4">
      {showFileInput && (
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

      {multiple ? (
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="flex flex-wrap gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-32 h-32">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                {onRemoveImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                    onClick={() => onRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : imagePreview && (
        <div className="mt-4">
          <Label>Preview</Label>
          <div className="relative inline-block mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-[200px] h-auto rounded-md"
            />
            {onRemoveImage && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                onClick={() => onRemoveImage(0)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
