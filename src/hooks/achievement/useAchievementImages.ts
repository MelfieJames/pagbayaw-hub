
import { useState } from "react";
import { supabase } from "@/services/supabase/client";

export const useAchievementImages = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleAdditionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAdditionalFiles(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setAdditionalPreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const removeAdditionalImage = (index: number) => {
    const newFiles = [...additionalFiles];
    newFiles.splice(index, 1);
    setAdditionalFiles(newFiles);

    const newPreviews = [...additionalPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setAdditionalPreviews(newPreviews);
  };

  const uploadImages = async (achievementId: number) => {
    const allFiles = [...selectedFiles, ...additionalFiles];
    
    if (allFiles.length === 0) return [];
    
    const uploadPromises = allFiles.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('achievements')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('achievements')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('achievement_images')
        .insert({
          achievement_id: achievementId,
          image_url: publicUrl
        });

      if (dbError) throw dbError;

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  return {
    selectedFiles,
    imagePreviews,
    additionalFiles,
    additionalPreviews,
    handleFileChange,
    handleAdditionalFileChange,
    removeImage,
    removeAdditionalImage,
    uploadImages,
  };
};
