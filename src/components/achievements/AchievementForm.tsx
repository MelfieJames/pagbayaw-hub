import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create achievements",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        user_id: user.id // Using the actual UUID from the authenticated user
      };

      if (mode === 'add') {
        const { error } = await supabase
          .from('achievements')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Achievement added successfully",
        });
      } else {
        const { error } = await supabase
          .from('achievements')
          .update(dataToSave)
          .eq('id', initialData?.id);

        if (error) throw error;

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
      <div>
        <label className="text-sm font-medium">Achievement Name</label>
        <Input
          name="achievement_name"
          value={formData.achievement_name}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Date</label>
        <Input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Image URL</label>
        <Input
          name="image"
          value={formData.image}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Video URL</label>
        <Input
          name="video"
          value={formData.video}
          onChange={handleInputChange}
        />
      </div>
      <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
        {mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
      </Button>
    </form>
  );
};