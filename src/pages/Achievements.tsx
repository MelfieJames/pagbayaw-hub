
import Navbar from "@/components/Navbar";
import { supabase } from "@/services/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { AchievementDetailsContent } from "@/components/achievements/details/AchievementDetailsContent";
import AchievementImageCarousel from "@/components/achievements/details/AchievementImageCarousel";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Achievement {
  id: number;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  image: string | null;
  video: string | null;
  user_id: string | null;
}

const Achievements = () => {
  const { toast } = useToast();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievementImages, setAchievementImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredAchievements = achievements?.filter(achievement =>
    achievement.achievement_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (achievement.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-4xl font-bold text-center mb-8">Our Achievements</h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-12">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements?.map((achievement) => (
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

        <Dialog 
          open={!!selectedAchievement} 
          onOpenChange={() => setSelectedAchievement(null)}
        >
          <DialogContent className="max-w-5xl">
            {selectedAchievement && (
              <div className="grid md:grid-cols-2 gap-6">
                <AchievementImageCarousel 
                  images={achievementImages.length > 0 ? achievementImages : [selectedAchievement.image || "/placeholder.svg"]}
                  title={selectedAchievement.achievement_name}
                />
                <AchievementDetailsContent 
                  achievement={selectedAchievement}
                  images={achievementImages}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Achievements;
