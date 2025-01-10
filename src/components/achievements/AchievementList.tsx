import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const { data: achievements, refetch } = useQuery({
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
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete achievement",
        variant: "destructive"
      });
    }
  };

  const filteredAchievements = achievements?.filter(achievement => 
    achievement.achievement_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (achievement.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (achievement: Achievement, e: React.MouseEvent) => {
    // Prevent row click when clicking buttons
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
              <TableRow 
                key={achievement.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={(e) => handleRowClick(achievement, e)}
              >
                <TableCell>
                  <img 
                    src={achievement.image || "/placeholder.svg"} 
                    alt={achievement.achievement_name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="font-medium">{achievement.achievement_name}</TableCell>
                <TableCell>{achievement.description}</TableCell>
                <TableCell>{achievement.date}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(achievement)}
                    >
                      <Pencil className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(achievement.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Achievement Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] overflow-y-auto">
            {selectedAchievement && (
              <div className="space-y-4 p-4">
                {selectedAchievement.image && (
                  <div className="flex justify-center">
                    <img
                      src={selectedAchievement.image}
                      alt={selectedAchievement.achievement_name}
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                <div className="grid gap-4">
                  <div>
                    <h3 className="font-semibold text-sm">Achievement Name</h3>
                    <p className="text-lg">{selectedAchievement.achievement_name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Description</h3>
                    <p className="text-gray-700">{selectedAchievement.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Date</h3>
                    <p>{selectedAchievement.date}</p>
                  </div>
                  {selectedAchievement.video && (
                    <div>
                      <h3 className="font-semibold text-sm">Video URL</h3>
                      <a href={selectedAchievement.video} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-500 hover:underline">
                        View Video
                      </a>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm">Created At</h3>
                    <p>{format(new Date(selectedAchievement.created_at), "PPpp")}</p>
                  </div>
                  {selectedAchievement.updated_at && (
                    <div>
                      <h3 className="font-semibold text-sm">Last Updated</h3>
                      <p>{format(new Date(selectedAchievement.updated_at), "PPpp")}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};