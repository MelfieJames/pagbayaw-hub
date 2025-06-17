
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { getAchievementImages, addAchievementImage, deleteAchievementImage } from "@/utils/achievementOperations";

export const useAchievementImages = (achievementId?: number) => {
  const [images, setImages] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (achievementId) {
      loadImages();
    }
  }, [achievementId]);

  const loadImages = async () => {
    if (!achievementId) return;
    try {
      const imageData = await getAchievementImages(achievementId);
      setImages(imageData || []);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !achievementId) return;
    
    setIsUploading(true);
    try {
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { data, error: uploadError } = await supabase.storage
          .from('achievements')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('achievements')
          .getPublicUrl(filePath);

        await addAchievementImage(achievementId, publicUrl);
      }
      
      await loadImages();
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = async (imageId: number) => {
    try {
      await deleteAchievementImage(imageId);
      await loadImages();
    } catch (error) {
      console.error("Error removing image:", error);
      throw error;
    }
  };

  return {
    images,
    isUploading,
    handleImageUpload,
    removeImage,
  };
};
