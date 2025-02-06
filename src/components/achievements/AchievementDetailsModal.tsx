import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { AchievementDetailsContent } from "./details/AchievementDetailsContent";

interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
}

interface AchievementDetailsModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementDetailsModal = ({ achievement, onClose }: AchievementDetailsModalProps) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      if (achievement?.id) {
        const { data, error } = await supabase
          .from('achievement_images')
          .select('image_url')
          .eq('achievement_id', achievement.id);

        if (!error && data) {
          setImages(data.map(img => img.image_url));
        }
      }
    };

    fetchImages();
  }, [achievement]);

  if (!achievement) return null;

  return (
    <Dialog open={!!achievement} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Achievement Details</DialogTitle>
        </DialogHeader>
        <AchievementDetailsContent achievement={achievement} images={images} />
      </DialogContent>
    </Dialog>
  );
};
