import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { AchievementTableRow } from "./AchievementTableRow";
import { AchievementDetailsModal } from "./AchievementDetailsModal";

interface Achievement {
  id: number;
  image: string | null;
  video: string | null;
  achievement_name: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
}

interface AchievementListProps {
  onEdit: (achievement: Achievement) => void;
}

export const AchievementList = ({ onEdit }: AchievementListProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const { data: achievements, refetch, isError, error, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      try {
        console.log('Fetching achievements...');
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Achievements fetched:', data);
        return data as Achievement[];
      } catch (err) {
        console.error('Error fetching achievements:', err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p>Loading achievements...</p>
      </div>
    );
  }

  if (isError) {
    console.error('Query error:', error);
    toast({
      title: "Error fetching achievements",
      description: error instanceof Error ? error.message : "Failed to load achievements",
      variant: "destructive"
    });
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error loading achievements. Please try again later.</p>
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Achievement deleted successfully",
      });
      refetch();
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete achievement",
        variant: "destructive"
      });
    }
  };

  const filteredAchievements = achievements?.filter(achievement => 
    achievement.achievement_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (achievement.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (achievement: Achievement, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedAchievement(achievement);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search achievements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievements?.map((achievement) => (
              <AchievementTableRow
                key={achievement.id}
                achievement={achievement}
                onEdit={onEdit}
                onDelete={handleDelete}
                onClick={handleRowClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <AchievementDetailsModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
};
