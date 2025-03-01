
import { useState } from "react";
import { createAchievement, updateAchievement, AchievementData } from "@/utils/achievementOperations";
import { CustomUser } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";

interface UseAchievementFormProps {
  initialData?: AchievementData & { id?: number };
  mode: 'add' | 'edit';
  onSuccess: (achievementId?: number) => void;
  onError: (error: Error) => void;
  user: CustomUser | null;
}

export const useAchievementForm = ({ initialData, mode, onSuccess, onError, user }: UseAchievementFormProps) => {
  const [formData, setFormData] = useState<AchievementData>({
    achievement_name: initialData?.achievement_name || "",
    description: initialData?.description || "",
    date: initialData?.date || "",
    venue: initialData?.venue || "",
    image: initialData?.image || "",
    about_text: initialData?.about_text || ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setSelectedFile(file);

    // Clean up old preview
    if (imagePreview && !initialData?.image) {
      URL.revokeObjectURL(imagePreview);
    }
    
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const removeImage = () => {
    setSelectedFile(null);
    
    if (imagePreview && !initialData?.image) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImagePreview(null);
    
    if (initialData?.image) {
      setFormData(prev => ({
        ...prev,
        image: ""
      }));
    }
  };

  const uploadImage = async (achievementId: number): Promise<string | null> => {
    if (!selectedFile) return null;
    
    console.log(`Starting upload of image for achievement ID ${achievementId}`);
    
    try {
      // Generate a safe filename
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log(`Uploading file: ${filePath}`);

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('achievements')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error(`Error uploading file:`, uploadError);
        throw uploadError;
      }

      console.log(`File uploaded successfully, getting public URL`);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('achievements')
        .getPublicUrl(filePath);

      console.log(`Public URL for file:`, publicUrl);

      return publicUrl;
    } catch (error) {
      console.error(`Error processing file:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form", { formData, user });

    if (!user?.isAdmin) {
      onError(new Error("Only admin users can manage achievements"));
      return;
    }

    try {
      // Validate required fields
      if (!formData.achievement_name || !formData.date || !formData.venue) {
        throw new Error("Please fill in all required fields");
      }

      let achievementId: number;
      let imageUrl = formData.image;
      console.log("Mode:", mode);

      // Upload image if selected
      if (selectedFile) {
        if (mode === 'edit' && initialData?.id) {
          // For edit mode, upload image first
          imageUrl = await uploadImage(initialData.id) || imageUrl;
          
          // Update achievement with new image
          const updatedData = { ...formData, image: imageUrl };
          await updateAchievement(initialData.id, updatedData);
          achievementId = initialData.id;
        } else {
          // For add mode, create achievement first, then upload image
          const result = await createAchievement(formData, user);
          achievementId = result.id;
          
          // Upload image and update achievement with image URL
          imageUrl = await uploadImage(achievementId) || imageUrl;
          if (imageUrl) {
            await updateAchievement(achievementId, { ...formData, image: imageUrl });
          }
        }
      } else {
        // No new image selected, just update or create achievement with existing data
        if (mode === 'edit' && initialData?.id) {
          await updateAchievement(initialData.id, formData);
          achievementId = initialData.id;
        } else {
          const result = await createAchievement(formData, user);
          achievementId = result.id;
        }
      }

      console.log("Success! Calling onSuccess callback");
      onSuccess(achievementId);
    } catch (error) {
      console.error("Error in form submission:", error);
      onError(error instanceof Error ? error : new Error('An unexpected error occurred'));
    }
  };

  return {
    formData,
    imagePreview,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    removeImage
  };
};
