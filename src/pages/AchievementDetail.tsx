
import Navbar from "@/components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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

  if (isLoadingAchievement) {
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

  if (achievementError || !achievement) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600">Error Loading Achievement</h1>
            <p className="mt-4 text-gray-700">
              {achievementError ? (achievementError as Error).message : 
               "The achievement you're looking for doesn't exist."}
            </p>
            <Button 
              variant="default" 
              onClick={() => navigate(-1)}
              className="mt-6"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Process images data
  const galleryImages = achievementImages?.map(img => img.image_url) || [];
  const allImages = [
    achievement.image || "/placeholder.svg",
    ...galleryImages
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 lg:px-8 pb-16">
        <div className="relative mb-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-10 bg-white/80 hover:bg-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
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
              About this Achievement
            </h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{achievement.about_text}</p>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            Achievement Gallery
          </h2>
          
          {isLoadingImages ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading gallery images...</p>
              <div className="mt-3 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-md animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : imagesError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading gallery images. Please try again later.</p>
            </div>
          ) : allImages.length > 0 ? (
            <AchievementImagesGallery 
              images={allImages}
              onImageClick={setSelectedImage}
              selectedImage={selectedImage}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No gallery images available for this achievement.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Achievement Feedback</h2>
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
