
import Navbar from "@/components/Navbar";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
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

  const { data: achievement, isLoading: isLoadingAchievement } = useQuery({
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

  const { data: achievementImages, isLoading: isLoadingImages } = useQuery({
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
        <div className="pt-20 container mx-auto">
          <h1 className="text-4xl font-bold text-center">Achievement Details</h1>
          <div className="text-center mt-8">Loading achievement details...</div>
        </div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 container mx-auto">
          <h1 className="text-4xl font-bold text-center">Achievement Not Found</h1>
          <div className="text-center mt-8">The achievement you're looking for doesn't exist.</div>
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
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="mb-6"
        >
          Back
        </Button>
        
        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4">
            <img 
              src={achievement.image || "/placeholder.svg"} 
              alt={achievement.achievement_name}
              className="w-full h-auto max-h-[500px] object-contain rounded-md"
            />
            <h1 className="text-3xl font-bold">{achievement.achievement_name}</h1>
            {achievement.description && (
              <div className="bg-purple-50 rounded-md p-4 text-purple-800">
                <div className="font-semibold text-purple-700 mb-2">Completed</div>
                <p>{achievement.description}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-4">
            <div className="bg-white rounded-lg divide-y">
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Organizer</span>
                <span className="font-medium">TARA Kabataan Organization</span>
              </div>
              
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Event Type</span>
                <span className="font-medium">Community Service</span>
              </div>
              
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Category</span>
                <span className="font-medium">Feeding Program</span>
              </div>
              
              <div className="flex justify-between py-3">
                <span className="text-gray-600">Registration</span>
                <span className="font-medium">Closed</span>
              </div>
              
              <div className="flex items-center py-3">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-600">Date</h3>
                  <p className="font-medium">{format(new Date(achievement.date), "MMMM dd, yyyy")}</p>
                </div>
              </div>
              
              {achievement.venue && (
                <div className="flex items-center py-3">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Venue</h3>
                    <p className="font-medium">{achievement.venue}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 bg-green-100 text-green-800 py-3 px-4 rounded-md text-center">
              Event Completed
            </div>
          </div>
        </div>
        
        {achievement.about_text && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">About this event</h2>
            <p className="whitespace-pre-line">{achievement.about_text}</p>
          </div>
        )}
        
        {allImages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">
              Event Gallery {achievement.achievement_name}
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
