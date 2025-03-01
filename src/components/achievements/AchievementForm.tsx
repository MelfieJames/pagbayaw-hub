
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAchievementForm } from "@/hooks/achievement/useAchievementForm";
import { AchievementFormFields } from "./form/AchievementFormFields";
import { useState } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import ErrorModal from "@/components/ErrorModal";

interface AchievementFormProps {
  onSuccess: () => void;
  initialData?: {
    id?: number;
    achievement_name: string;
    description: string;
    about_text?: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const {
    formData,
    imagePreview,
    handleInputChange,
    handleSubmit: submitForm,
    handleFileChange,
    removeImage,
  } = useAchievementForm({ 
    initialData, 
    mode, 
    onSuccess: async () => {
      toast({
        title: "Success",
        description: `Achievement ${mode === 'add' ? 'added' : 'updated'} successfully`,
      });
      setIsSubmitting(false);
      onSuccess();
      onClose?.();
    }, 
    user,
    onError: (error) => {
      setIsSubmitting(false);
      setErrorMessage(error.message || `Failed to ${mode} achievement`);
      setErrorModalOpen(true);
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode} achievement`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log("Starting submission process...");
      await submitForm(e);
    } catch (error) {
      console.error("Unhandled error in form submission:", error);
      setIsSubmitting(false);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
      setErrorModalOpen(true);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !user?.isAdmin) return;
    setIsSubmitting(true);

    try {
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

      setIsSubmitting(false);
      onSuccess();
      onClose?.();
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      setIsSubmitting(false);
      setErrorMessage(error.message || "Failed to delete achievement");
      setErrorModalOpen(true);
      toast({
        title: "Error",
        description: "Failed to delete achievement",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <ScrollArea className="max-h-[80vh] overflow-y-auto p-6">
        <div className="space-y-4">
          <AchievementFormFields
            values={formData}
            imageFile={null}
            imagePreview={imagePreview}
            errors={{}}
            onChange={handleInputChange}
            onFileChange={handleFileChange}
            onDateChange={(date) => handleInputChange({
              target: { 
                name: 'date', 
                value: date ? date.toISOString().split('T')[0] : ''
              }
            } as any)}
          />

          <DialogFooter className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              {mode === 'edit' && (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <Button 
              type="submit" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : mode === 'add' ? 'Add Achievement' : 'Update Achievement'}
            </Button>
          </DialogFooter>
        </div>
      </ScrollArea>

      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />
    </>
  );
};
