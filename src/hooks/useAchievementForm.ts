import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AchievementFormData {
  achievement_name: string;
  description: string;
  date: string;
  image: string;
  video: string;
}

interface UseAchievementFormProps {
  initialData?: AchievementFormData & { id?: number };
  mode: 'add' | 'edit';
  onSuccess: () => void;
  user: User | null;
}

export const useAchievementForm = ({ initialData, mode, onSuccess, user }: UseAchievementFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    achievement_name: initialData?.achievement_name || "",
    description: initialData?.description || "",
    date: initialData?.date || "",
    image: initialData?.image || "",
    video: initialData?.video || ""
  });
  const [imageType, setImageType] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'image' && imageType === 'url') {
      setImagePreview(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      let imageUrl = formData.image;

      if (imageType === 'file' && selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('achievements')
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw new Error('Error uploading image');
        }

        const { data: { publicUrl } } = supabase.storage
          .from('achievements')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const dataToSubmit = {
        ...formData,
        image: imageUrl
      };

      if (mode === 'add') {
        await createAchievement(dataToSubmit, user);
        toast({
          title: "Success",
          description: "Achievement added successfully",
        });
      } else if (initialData?.id) {
        await updateAchievement(initialData.id, dataToSubmit);
        toast({
          title: "Success",
          description: "Achievement updated successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save achievement",
        variant: "destructive"
      });
    }
  };

  return {
    formData,
    imageType,
    selectedFile,
    imagePreview,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    setImageType
  };
};