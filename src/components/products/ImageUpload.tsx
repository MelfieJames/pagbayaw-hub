import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  onImageSelected: (file: File | null) => void;
  currentImage?: string | null;
}

export function ImageUpload({ onImageSelected, currentImage }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelected(file);
    } else {
      setPreview(null);
      onImageSelected(null);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image">Product Image</Label>
      <Input
        id="image"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="cursor-pointer"
      />
      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            className="max-w-[200px] h-auto rounded-md"
          />
        </div>
      )}
    </div>
  );
}