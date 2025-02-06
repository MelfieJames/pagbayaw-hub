import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase/client";
import { createAchievement, updateAchievement } from "@/utils/achievementOperations";
import { CustomUser } from "@/contexts/AuthContext";

interface AchievementFormData {
  achievement_name: string;
  description: string;
  date: string;
  image: string;
}

interface UseAchievementFormProps {
  initialData?: AchievementFormData & { id?: number };
  mode: 'add' | 'edit';
  onSuccess: () => void;
  user: CustomUser | null;
  additionalImages: Array<{ type: 'url' | 'file', value: string }>;
}

export const useAchievementForm = ({ initialData, mode, onSuccess, user, additionalImages }: UseAchievementFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    achievement_name: initialData?.achievement_name || "",
    description: initialData?.description || "",
    date: initialData?.date || "",
    image: initialData?.image || ""
  });
  const [imageType, setImageType] = useState<'url' | 'file'>('url');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'image' && imageType === 'url') {
      setImagePreviews([value]);
    }
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleAdditionalImageChange = (index: number, value: string) => {
    const updatedImages = [...additionalImages];
    updatedImages[index] = { ...updatedImages[index], value };
  };

  const handleAdditionalFileChange = (index: number, file: File) => {
    const updatedImages = [...additionalImages];
    updatedImages[index] = { ...updatedImages[index], value: URL.createObjectURL(file) };
  };

  const uploadImages = async (achievementId: number) => {
    const uploadPromises = selectedFiles.map(async (file) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.isAdmin) {
      toast({
        title: "Error",
        description: "Only admin users can manage achievements",
        variant: "destructive"
      });
      return;
    }

    try {
      let achievementId: number;

      if (mode === 'add') {
        const result = await createAchievement(formData, user);
        achievementId = result.id;
      } else if (initialData?.id) {
        await updateAchievement(initialData.id, formData);
        achievementId = initialData.id;
      } else {
        throw new Error('Invalid operation');
      }

      if (selectedFiles.length > 0) {
        await uploadImages(achievementId);
      }

      // Upload additional images
      for (const img of additionalImages) {
        if (img.type === 'url' && img.value) {
          await supabase
            .from('achievement_images')
            .insert({
              achievement_id: achievementId,
              image_url: img.value
            });
        }
      }

      toast({
        title: "Success",
        description: `Achievement ${mode === 'add' ? 'added' : 'updated'} successfully`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode} achievement`,
        variant: "destructive"
      });
    }
  };

  return {
    formData,
    imageType,
    imagePreview: imagePreviews[0],
    imagePreviews,
    handleInputChange,
    handleFileChange: handleMultipleFileChange,
    handleSubmit,
    setImageType,
    handleMultipleFileChange,
    handleAdditionalImageChange,
    handleAdditionalFileChange
  };
};
