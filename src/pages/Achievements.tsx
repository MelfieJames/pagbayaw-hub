import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { 
  Search, 
  Eye, 
  Award, 
  Calendar, 
  Clock, 
  Trophy,
  Medal, 
  CheckCircle2,
  Sparkles
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";

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

const AchievementIcon = ({ index }: { index: number }) => {
  const icons = [
    <Trophy className="h-6 w-6 text-amber-600" />,
    <Medal className="h-6 w-6 text-amber-500" />,
    <Award className="h-6 w-6 text-emerald-600" />,
    <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
    <Sparkles className="h-6 w-6 text-amber-500" />
  ];
  
  return icons[index % icons.length];
};

const Achievements = () => {
  const { toast } = useToast();
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

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load achievements. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-amber-50 py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center mb-6">
              <Award className="text-emerald-600 h-12 w-12 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Our Achievements</h1>
            </div>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Discover the milestones we've reached and the recognition we've received along our journey.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mt-8">
              <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
              <Input
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 border-emerald-200 focus-visible:ring-emerald-400 rounded-full"
              />
            </div>
          </div>
        </div>
        
        {/* Achievement Cards */}
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse mx-auto w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-emerald-400" />
              </div>
              <p className="text-lg text-gray-600">Loading achievements...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAchievements?.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-gray-600">No achievements found matching your search.</p>
                </div>
              ) : (
                filteredAchievements?.map((achievement, index) => (
                  <Card
                    key={achievement.id}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 border-emerald-100 group"
                  >
                    <div className="relative overflow-hidden">
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md z-10">
                        <AchievementIcon index={index} />
                      </div>
                      <img
                        src={achievement.image || "/placeholder.svg"}
                        alt={achievement.achievement_name}
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                        {achievement.achievement_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-5">
                      <div className="flex items-center mb-4 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                        <span>{format(new Date(achievement.date), 'MMMM dd, yyyy')}</span>
                      </div>
                      
                      {achievement.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                          {achievement.description}
                        </p>
                      )}
                      
                      <Link to={`/achievements/${achievement.id}`}>
                        <Button 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Achievements;
