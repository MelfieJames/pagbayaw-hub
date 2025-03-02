
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin } from "lucide-react";

interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  venue?: string;
}

interface AchievementDetailsContentProps {
  achievement: Achievement;
  images?: string[]; // Make images optional
}

export const AchievementDetailsContent = ({ achievement, images = [] }: AchievementDetailsContentProps) => {
  return (
    <ScrollArea className="max-h-[80vh] w-full overflow-y-auto pr-4">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-sm">Date</h3>
              <p>{format(new Date(achievement.date), "MMMM dd, yyyy")}</p>
            </div>
          </div>

          {achievement.venue && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold text-sm">Venue</h3>
                <p className="text-gray-700">{achievement.venue}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
