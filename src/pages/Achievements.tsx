
import Navbar from "@/components/Navbar";
import { supabase } from "@/services/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { AchievementDetailsContent } from "@/components/achievements/details/AchievementDetailsContent";

interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  image: string | null;
}

const Achievements = () => {
  const { toast } = useToast();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievementImages, setAchievementImages] = useState<string[]>([]);

  const { data: achievements, isLoading, error } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Achievement[];
    }
  });

  const handleAchievementClick = async (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    
    const { data: imageData, error } = await supabase
      .from('achievement_images')
      .select('image_url')
      .eq('achievement_id', achievement.id);

    if (!error && imageData) {
      setAchievementImages(imageData.map(img => img.image_url || '').filter(Boolean));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 container mx-auto">
          <h1 className="text-4xl font-bold text-center">Achievements</h1>
          <div className="text-center mt-8">Loading achievements...</div>
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load achievements. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Our Achievements</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements?.map((achievement) => (
            <Card
              key={achievement.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleAchievementClick(achievement)}
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={achievement.image || "/placeholder.svg"}
                  alt={achievement.achievement_name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>{achievement.achievement_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">{achievement.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {format(new Date(achievement.date), 'PP')}
                </p>
              </CardContent>
            </Card>
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
