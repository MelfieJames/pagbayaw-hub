import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AchievementImageCarousel } from "./AchievementImageCarousel";
import { Award, Calendar, FileText } from "lucide-react";

interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
}

interface AchievementDetailsContentProps {
  achievement: Achievement;
  images: string[];
}

export const AchievementDetailsContent = ({ achievement, images }: AchievementDetailsContentProps) => {
  return (
    <ScrollArea className="max-h-[70vh] overflow-y-auto">
      <div className="space-y-4 p-4">
        {images.length > 0 && (
          <AchievementImageCarousel images={images} title={achievement.achievement_name} />
        )}
        <div className="grid gap-4">
          <div className="flex items-start gap-2">
            <Award className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <h3 className="font-semibold text-sm">Achievement Name</h3>
              <p className="text-lg">{achievement.achievement_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <h3 className="font-semibold text-sm">Description</h3>
              <p className="text-gray-700">{achievement.description}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <h3 className="font-semibold text-sm">Date</h3>
              <p>{achievement.date}</p>
            </div>
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
  );
};