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
  date: string;
  created_at: string;
  updated_at: string | null;
  image: string | null;
  video: string | null;
  user_id: string | null;
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
      <div className="min-h-screen flex flex-col">
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 flex-grow">
        {/* Header with Icon */}
        <div className="flex items-center justify-center mb-8">
          <Award className="mr-4 text-green-600 h-10 w-10" />
          <h1 className="text-4xl font-bold text-gray-800">Our Achievements</h1>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-12">
          <Input
            placeholder=""
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 py-3 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
          />
          <Search className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
        </div>

        {/* Achievement Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements?.map((achievement) => (
            <Card
              key={achievement.id}
              className="overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 rounded-lg bg-white shadow-md hover:scale-105"
            >
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={achievement.image || "/placeholder.svg"}
                  alt={achievement.achievement_name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              <CardHeader className="pb-2 px-4">
                <CardTitle className="text-xl text-gray-800 font-semibold">{achievement.achievement_name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-5 px-4">
                <p className="text-sm text-gray-600 mb-4">
                  {format(new Date(achievement.date), 'MMMM dd, yyyy')}
                </p>
                <Link to={`/achievements/${achievement.id}`}>
                  <Button
                    className="w-full mt-3"
                    variant="outline"
                    color="green"
                    size="lg"
                  >
                    <Eye className="mr-2 h-4 w-4 text-green-500" />
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
