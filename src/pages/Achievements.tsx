
import Navbar from "@/components/Navbar";
import { supabase } from "@/services/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Eye, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100">
        <Navbar />
        <div className="pt-20 container mx-auto flex-grow text-center">
          <h1 className="text-4xl font-semibold text-gray-800">Achievements</h1>
          <div className="mt-8 text-gray-600">Loading achievements...</div>
        </div>
        <Footer />
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-green-100">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 flex-grow">
        {/* Header with Icon */}
        <div className="flex items-center justify-center mb-8 animate-fade-in">
          <Award className="mr-4 text-green-600 h-10 w-10" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-green-500 bg-clip-text text-transparent">Our Achievements</h1>
        </div>

        {/* Search Bar - Fixed positioning */}
        <div className="relative max-w-md mx-auto mb-12">
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all shadow-sm hover:shadow-md bg-white/80 backdrop-blur-sm"
          />
          <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Achievement Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements?.map((achievement, index) => (
            <Card
              key={achievement.id}
              className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-500 rounded-lg bg-white/80 backdrop-blur-sm shadow-md hover:scale-[1.02] border border-green-200 animate-fade-in h-[400px] flex flex-col"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={achievement.image || "/placeholder.svg"}
                  alt={achievement.achievement_name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <CardHeader className="pb-2 px-4 bg-gradient-to-r from-white to-green-50 flex-shrink-0">
                <CardTitle className="text-lg text-gray-800 font-semibold line-clamp-2">{achievement.achievement_name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-5 px-4 bg-gradient-to-r from-white to-green-50 flex-grow flex flex-col justify-between">
                <p className="text-sm text-gray-600 mb-4">
                  {format(new Date(achievement.date), 'MMMM dd, yyyy')}
                </p>
                <Link to={`/achievements/${achievement.id}`} className="mt-auto">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 transition-all transform hover:scale-[1.02]"
                    size="lg"
                  >
                    <Eye className="mr-2 h-4 w-4 text-white" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Achievements;
