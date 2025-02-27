
import { useState } from "react";
import { supabase } from "@/services/supabase/client";

export const useAchievementImages = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setSelectedFiles(files);

    // Clean up old previews
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleAdditionalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setAdditionalFiles(prev => [...prev, ...files]);

    const previews = files.map(file => URL.createObjectURL(file));
    setAdditionalPreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...imagePreviews];
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setImagePreviews(newPreviews);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newFiles = [...additionalFiles];
    newFiles.splice(index, 1);
    setAdditionalFiles(newFiles);

    const newPreviews = [...additionalPreviews];
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setAdditionalPreviews(newPreviews);
    }
  };

  const uploadImages = async (achievementId: number) => {
    const allFiles = [...selectedFiles, ...additionalFiles];
    
    if (allFiles.length === 0) return [];
    
    console.log(`Starting upload of ${allFiles.length} files for achievement ID ${achievementId}`);
    
    const uploadPromises = allFiles.map(async (file, index) => {
      try {
        // Generate a safe filename
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        console.log(`Uploading file ${index + 1}/${allFiles.length}: ${filePath}`);

        // Upload to Supabase storage
        const { data, error: uploadError } = await supabase.storage
          .from('achievements')
          .upload(filePath, file);

        if (uploadError) {
          console.error(`Error uploading file ${index + 1}:`, uploadError);
          throw uploadError;
        }

        console.log(`File ${index + 1} uploaded successfully, getting public URL`);

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('achievements')
          .getPublicUrl(filePath);

        console.log(`Public URL for file ${index + 1}:`, publicUrl);

        // Create DB entry
        const { error: dbError } = await supabase
          .from('achievement_images')
          .insert({
            achievement_id: achievementId,
            image_url: publicUrl
          });

        if (dbError) {
          console.error(`Error saving file ${index + 1} metadata:`, dbError);
          throw dbError;
        }

        console.log(`File ${index + 1} metadata saved successfully`);

        // For the first image, update the main image of the achievement
        if (index === 0 && selectedFiles.includes(file)) {
          const { error: updateError } = await supabase
            .from('achievements')
            .update({ image: publicUrl })
            .eq('id', achievementId);
            
          if (updateError) {
            console.error(`Error updating main image:`, updateError);
            throw updateError;
          }
          
          console.log(`Main achievement image updated successfully`);
        }

        return publicUrl;
      } catch (error) {
        console.error(`Error processing file ${index + 1}:`, error);
        throw error;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log(`All ${results.length} files uploaded successfully`);
      return results;
    } catch (error) {
      console.error(`Error during image upload:`, error);
      throw error;
    }
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
