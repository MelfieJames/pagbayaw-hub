import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: number;
  image: string | null;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
}

interface AchievementImage {
  id: number;
  achievement_id: number;
  image_url: string;
}

interface AchievementDetailsModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementDetailsModal = ({ achievement, onClose }: AchievementDetailsModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={!!achievement} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Achievement Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] overflow-y-auto">
          <div className="space-y-4 p-4">
            {images.length > 0 && (
              <div className="relative">
                <div className="flex justify-center items-center">
                  <img
                    src={images[currentImageIndex]}
                    alt={`${achievement.achievement_name} - Image ${currentImageIndex + 1}`}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
                {images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 bg-black/20 hover:bg-black/40"
                      onClick={previousImage}
                    >
                      <ChevronLeft className="h-6 w-6 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-2 bg-black/20 hover:bg-black/40"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-6 w-6 text-white" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold text-sm">Achievement Name</h3>
                <p className="text-lg">{achievement.achievement_name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Description</h3>
                <p className="text-gray-700">{achievement.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Date</h3>
                <p>{achievement.date}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm">Created At</h3>
                <p>{format(new Date(achievement.created_at), "PPpp")}</p>
              </div>
              {achievement.updated_at && (
                <div>
                  <h3 className="font-semibold text-sm">Last Updated</h3>
                  <p>{format(new Date(achievement.updated_at), "PPpp")}</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};