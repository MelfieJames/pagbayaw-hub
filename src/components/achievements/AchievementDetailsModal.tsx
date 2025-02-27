
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { AchievementDetailsContent } from "./details/AchievementDetailsContent";
import AchievementImageCarousel from "./details/AchievementImageCarousel";
import ErrorModal from "@/components/ErrorModal";

interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
  image: string | null; // Added the missing image property
  venue?: string;
}

interface AchievementDetailsModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementDetailsModal = ({ achievement, onClose }: AchievementDetailsModalProps) => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (achievement?.id) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('achievement_images')
            .select('image_url')
            .eq('achievement_id', achievement.id);

          if (error) {
            throw error;
          }

          if (data) {
            setImages(data.map(img => img.image_url));
          }
        } catch (err: any) {
          console.error("Error fetching achievement images:", err);
          setError(err.message || "Failed to load achievement images");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchImages();
  }, [achievement]);

  if (!achievement) return null;

  return (
    <>
      <Dialog open={!!achievement} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Achievement Details</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="text-center py-8">Loading achievement details...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <AchievementImageCarousel 
                images={images.length > 0 ? images : [achievement.image || "/placeholder.svg"]}
                title={achievement.achievement_name}
              />
              <AchievementDetailsContent 
                achievement={achievement}
                images={images}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        title="Error"
        message={error || "An unexpected error occurred"}
      />
    </>
  );
};
