import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { AchievementDetailsContent } from "@/components/achievements/details/AchievementDetailsContent";

interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
}

const Achievements = () => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievementImages, setAchievementImages] = useState<string[]>([]);

  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleAchievementClick = async (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    
    const { data: imageData, error } = await supabase
      .from('achievement_images')
      .select('image_url')
      .eq('achievement_id', achievement.id);

    if (!error && imageData) {
      setAchievementImages(imageData.map(img => img.image_url));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Achievements</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements?.map((achievement) => (
            <div
              key={achievement.id}
              onClick={() => handleAchievementClick(achievement)}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={achievement.image || "/placeholder.svg"}
                  alt={achievement.achievement_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{achievement.achievement_name}</h3>
                <p className="text-gray-600 line-clamp-2">{achievement.description}</p>
                <p className="text-sm text-gray-500 mt-2">{achievement.date}</p>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            {selectedAchievement && (
              <AchievementDetailsContent 
                achievement={selectedAchievement}
                images={achievementImages}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Achievements;