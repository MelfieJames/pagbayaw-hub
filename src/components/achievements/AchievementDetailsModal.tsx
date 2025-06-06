
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { AchievementDetailsContent } from "./details/AchievementDetailsContent";
import ErrorModal from "@/components/ErrorModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  about_text: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
  image: string | null;
  venue: string;
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
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-white to-green-50 border-2 border-green-100 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-800">Achievement Details</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col justify-start">
              <div className="rounded-lg overflow-hidden border-2 border-green-200 shadow-md transition-all duration-300 hover:shadow-lg">
                <img 
                  src={achievement.image || "/placeholder.svg"} 
                  alt={achievement.achievement_name}
                  className="max-w-full max-h-[400px] object-contain rounded-md mb-4 transition-transform duration-500 hover:scale-105"
                />
              </div>
              <h2 className="text-xl font-bold text-center mt-4 text-green-800">{achievement.achievement_name}</h2>
            </div>
            <div className="achievement-details-wrapper">
              <style>
                {`.achievement-details-wrapper .description-section { display: none !important; }`}
              </style>
              <AchievementDetailsContent 
                achievement={achievement}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Link to={`/achievements/${achievement.id}`}>
              <Button 
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50 transition-all duration-300 transform hover:scale-105"
              >
                View Full Details
              </Button>
            </Link>
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
