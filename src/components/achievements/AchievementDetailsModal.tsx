
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
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
  image: string | null;
  venue?: string;
}

interface AchievementDetailsModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementDetailsModal = ({ achievement, onClose }: AchievementDetailsModalProps) => {
  const [error, setError] = useState<string | null>(null);

  if (!achievement) return null;

  return (
    <>
      <Dialog open={!!achievement} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Achievement Details</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            <AchievementImageCarousel 
              images={[achievement.image || "/placeholder.svg"]}
              title={achievement.achievement_name}
            />
            <AchievementDetailsContent 
              achievement={achievement}
              images={[]}
            />
          </div>
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
