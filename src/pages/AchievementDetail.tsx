
import Navbar from "@/components/Navbar";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AchievementImagesGallery } from "@/components/achievements/details/AchievementImagesGallery";
import { AchievementFeedback } from "@/components/achievements/details/AchievementFeedback";
import { getAchievementImages } from "@/utils/achievementOperations";

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

interface AchievementImage {
  id: number;
  achievement_id: number;
  image_url: string;
  display_order: number;
}

const AchievementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: achievement, isLoading: isLoadingAchievement, error: achievementError } = useQuery({
    queryKey: ['achievement', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Achievement;
    },
    enabled: !!id
  });

  const { data: achievementImages, isLoading: isLoadingImages, error: imagesError } = useQuery({
    queryKey: ['achievement-images', id],
    queryFn: async () => {
      if (!id) return [];
      return await getAchievementImages(parseInt(id));
    },
    enabled: !!id
  });

  if (isLoadingAchievement || isLoadingImages) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-60 bg-gray-200 rounded-md w-full"></div>
              <div className="h-10 bg-gray-200 rounded-md w-3/4"></div>
              <div className="h-40 bg-gray-200 rounded-md w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (achievementError || imagesError || !achievement) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600">Error Loading Achievement</h1>
            <p className="mt-4 text-gray-700">
              {achievementError ? (achievementError as Error).message : 
               imagesError ? (imagesError as Error).message : 
               "The achievement you're looking for doesn't exist."}
            </p>
            <Button 
              variant="default" 
              onClick={() => window.history.back()}
              className="mt-6"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const allImages = [
    achievement.image || "/placeholder.svg",
    ...(achievementImages?.map(img => img.image_url) || [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 pb-16">
        <div className="relative mb-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="absolute top-0 left-0 z-10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <img 
                src={achievement.image || "/placeholder.svg"} 
                alt={achievement.achievement_name}
                className="w-full h-auto max-h-[500px] object-contain"
              />
            </div>
            
            <div className="p-6">
              <h1 className="text-3xl font-bold">{achievement.achievement_name}</h1>
              
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="font-medium">{format(new Date(achievement.date), "MMMM dd, yyyy")}</span>
                </div>
                
                {achievement.venue && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium">{achievement.venue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {achievement.about_text && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">
              About this event
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{achievement.about_text}</p>
            </div>
          </div>
        )}
        
        {allImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">
              Event Gallery
            </h2>
            <AchievementImagesGallery 
              images={allImages}
              onImageClick={setSelectedImage}
              selectedImage={selectedImage}
            />
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Event Feedback</h2>
          <AchievementFeedback 
            achievementId={achievement.id}
            isAuthenticated={!!user}
          />
        </div>
      </div>
    </div>
  );
};

export default AchievementDetail;
