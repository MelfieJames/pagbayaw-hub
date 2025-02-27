
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievementForm } from "@/hooks/achievement/useAchievementForm";
import { AchievementFormFields } from "./form/AchievementFormFields";
import { useState } from "react";
import { DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AchievementFormProps {
  onSuccess: () => void;
  initialData?: {
    id?: number;
    achievement_name: string;
    description: string;
    date: string;
    venue: string;
    image: string;
  };
  mode: 'add' | 'edit';
  onClose?: () => void;
}

export const AchievementForm = ({ onSuccess, initialData, mode, onClose }: AchievementFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [additionalImageCount, setAdditionalImageCount] = useState(1); // Start with one additional image slot
  
  const {
    formData,
    imagePreviews,
    additionalPreviews,
    handleInputChange,
    handleSubmit,
    handleFileChange,
    handleAdditionalFileChange
  } = useAchievementForm({ 
    initialData, 
    mode, 
    onSuccess: async () => {
      toast({
        title: "Success",
        description: `Achievement ${mode === 'add' ? 'added' : 'updated'} successfully`,
      });
      onSuccess();
      onClose?.();
    }, 
    user,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode} achievement`,
        variant: "destructive"
      });
    }
  });

  const handleAddMoreImages = () => {
    setAdditionalImageCount(prev => prev + 1);
    // Trigger file input click for the new image slot
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.onchange = (e) => {
      // Handle the native event properly
      if (e.target && e.target instanceof HTMLInputElement && e.target.files) {
        // Create a synthetic React change event
        const syntheticEvent = {
          target: e.target,
          currentTarget: e.currentTarget,
          preventDefault: () => {},
          stopPropagation: () => {},
          isPropagationStopped: () => false,
          isDefaultPrevented: () => false,
          persist: () => {},
          nativeEvent: e
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleAdditionalFileChange(syntheticEvent);
      }
    };
    fileInput.click();
  };

  const handleDelete = async () => {
    if (!initialData?.id || !user?.isAdmin) return;

    try {
      // Delete associated images first
      const { data: imageData } = await supabase
        .from('achievement_images')
        .select('image_url')
        .eq('achievement_id', initialData.id);

      if (imageData) {
        for (const item of imageData) {
          const path = item.image_url.split('/').pop();
          if (path) {
            await supabase.storage
              .from('achievements')
              .remove([path]);
          }
        }
      }

      // Delete achievement images records
      await supabase
        .from('achievement_images')
        .delete()
        .eq('achievement_id', initialData.id);

      // Delete the achievement
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', initialData.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Achievement deleted successfully",
      });

      onSuccess();
      onClose?.();
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      toast({
        title: "Error",
        description: "Failed to delete achievement",
        variant: "destructive"
      });
    }
  };

  return (
    <ScrollArea className="max-h-[80vh] overflow-y-auto p-6">
      <div className="space-y-4">
        <AchievementFormFields
          formData={formData}
          imagePreview={imagePreviews[0]}
          imagePreviews={imagePreviews}
          handleInputChange={handleInputChange}
          handleMultipleFileChange={handleFileChange}
          onAddMoreImages={handleAddMoreImages}
          additionalPreviews={additionalPreviews.slice(0, additionalImageCount)}
          handleAdditionalFileChange={handleAdditionalFileChange}
        />

        <DialogFooter className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            {mode === 'edit' && (
              <Button
                variant="destructive"
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
          <Button type="submit" onClick={handleSubmit}>
            {mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
          </Button>
        </DialogFooter>
      </div>
    </ScrollArea>
  );
};
