import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Achievement {
  id: number;
  image: string | null;
  video: string | null;
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
  if (!achievement) return null;

  return (
    <Dialog open={!!achievement} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Achievement Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] overflow-y-auto">
          <div className="space-y-4 p-4">
            {achievement.image && (
              <div className="flex justify-center">
                <img
                  src={achievement.image}
                  alt={achievement.achievement_name}
                  className="max-w-full h-auto rounded-lg"
                />
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
              {achievement.video && (
                <div>
                  <h3 className="font-semibold text-sm">Video URL</h3>
                  <a href={achievement.video} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-500 hover:underline">
                    View Video
                  </a>
                </div>
              )}
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