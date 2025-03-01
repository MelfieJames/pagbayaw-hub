
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

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

interface AchievementTableRowProps {
  achievement: Achievement;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: number) => void;
  onClick: (achievement: Achievement, e: React.MouseEvent) => void;
}

export const AchievementTableRow = ({ 
  achievement, 
  onEdit, 
  onDelete, 
  onClick 
}: AchievementTableRowProps) => {
  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={(e) => onClick(achievement, e)}
    >
      <TableCell>
        <img 
          src={achievement.image || "/placeholder.svg"} 
          alt={achievement.achievement_name} 
          className="w-16 h-16 object-cover rounded"
        />
      </TableCell>
      <TableCell className="font-medium">{achievement.achievement_name}</TableCell>
      <TableCell>{new Date(achievement.date).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link to={`/achievements/${achievement.id}`} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="icon"
            >
              <Eye className="w-4 h-4 text-blue-500" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(achievement);
            }}
          >
            <Pencil className="w-4 h-4 text-green-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(achievement.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
