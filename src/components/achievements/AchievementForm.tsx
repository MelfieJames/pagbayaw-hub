import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AchievementFormInput } from "./AchievementFormInput";
import { createAchievement, updateAchievement } from "@/utils/achievementOperations";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AchievementFormProps {
  onSuccess: () => void;
  initialData?: {
    id?: number;
    achievement_name: string;
    description: string;
    date: string;
    image: string;
    video: string;
  };
  mode: 'add' | 'edit';
}

export const AchievementForm = ({ onSuccess, initialData, mode }: AchievementFormProps) => {
  const { user } = useAuth();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AchievementFormInput
        label="Achievement Name"
        name="achievement_name"
        value={formData.achievement_name}
        onChange={handleInputChange}
        required
      />
      <AchievementFormInput
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        isTextarea
      />
      <AchievementFormInput
        label="Date"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleInputChange}
        required
      />

      <div className="space-y-4">
        <Label>Image Upload Method</Label>
        <RadioGroup
          defaultValue={imageType}
          onValueChange={(value) => setImageType(value as 'url' | 'file')}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="url" id="url" />
            <Label htmlFor="url">Image URL</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="file" id="file" />
            <Label htmlFor="file">Upload File</Label>
          </div>
        </RadioGroup>

        {imageType === 'url' ? (
          <AchievementFormInput
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
          />
        ) : (
          <div className="space-y-2">
            <Label htmlFor="file-upload">Choose Image</Label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>
        )}

        {imagePreview && (
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

      <AchievementFormInput
        label="Video URL"
        name="video"
        value={formData.video}
        onChange={handleInputChange}
      />

      <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
        {mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
      </Button>
    </form>
  );
};