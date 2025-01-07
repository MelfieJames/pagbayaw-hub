import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AchievementFormInput } from "./AchievementFormInput";
import { createAchievement, updateAchievement } from "@/utils/achievementOperations";

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      if (mode === 'add') {
        await createAchievement(formData, user);
        toast({
          title: "Success",
          description: "Achievement added successfully",
        });
      } else if (initialData?.id) {
        await updateAchievement(initialData.id, formData);
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
      <AchievementFormInput
        label="Image URL"
        name="image"
        value={formData.image}
        onChange={handleInputChange}
      />
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