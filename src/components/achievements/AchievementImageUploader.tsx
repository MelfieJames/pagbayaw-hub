
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase/client";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";
import { ImageUploadSection } from "./ImageUploadSection";

interface AchievementImageUploaderProps {
  achievementId: number;
  onImagesAdded: () => void;
  existingImages?: { id: number; image_url: string }[];
}

export const AchievementImageUploader = ({
  achievementId,
  onImagesAdded,
  existingImages = []
}: AchievementImageUploaderProps) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setFiles(prev => [...prev, ...selectedFiles]);

    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newPreviews = [...previews];
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setPreviews(newPreviews);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${index}.${fileExt}`;
        const filePath = `achievements/${achievementId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('achievements')
          .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('achievements')
          .getPublicUrl(filePath);

        const { error: dbError } = await supabase
          .from('achievement_images')
          .insert({
            achievement_id: achievementId,
            image_url: publicUrl,
            display_order: existingImages.length + index
          });

        if (dbError) throw dbError;

        return publicUrl;
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Success",
        description: `${files.length} image${files.length !== 1 ? 's' : ''} uploaded successfully`,
      });

      setFiles([]);
      setPreviews([]);
      onImagesAdded();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (id: number) => {
    try {
      const { error } = await supabase
        .from('achievement_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });

      onImagesAdded();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <ImageUploadSection
            imagePreviews={previews}
            onFileChange={handleFileChange}
            multiple={true}
            onRemoveImage={removeFile}
          />

          <Button 
            onClick={uploadFiles} 
            disabled={isUploading || files.length === 0}
            className="mt-4"
          >
            {isUploading ? "Uploading..." : "Upload Images"}
          </Button>
        </div>

        {existingImages.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Existing Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url}
                    alt="Achievement image"
                    className="w-full aspect-square object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteImage(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
