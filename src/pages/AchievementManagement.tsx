import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2, Plus, Star, Award, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: number;
  image: string | null;
  video: string | null;
  achievement_name: string;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string | null;
  user_id: number | null;
}

const initialAchievements: Achievement[] = [
  {
    id: 1,
    image: "/placeholder.svg",
    video: null,
    achievement_name: "Golden Horizon Award",
    description: "Excellence in Craftsmanship",
    date: "2024-01-15",
    createdAt: "2024-01-15 10:00:00",
    updatedAt: null,
    user_id: 1
  }
];

const AchievementManagement = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    achievement_name: "",
    description: "",
    date: "",
    image: "",
    video: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newAchievement: Achievement = {
      id: achievements.length + 1,
      ...formData,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      user_id: 1 // This would normally come from the authenticated user
    };

    setAchievements([...achievements, newAchievement]);
    setIsAddDialogOpen(false);
    setFormData({
      achievement_name: "",
      description: "",
      date: "",
      image: "",
      video: ""
    });

    toast({
      title: "Success",
      description: "Achievement added successfully",
    });
  };

  const handleEdit = (achievement: Achievement) => {
    setCurrentAchievement(achievement);
    setFormData({
      achievement_name: achievement.achievement_name,
      description: achievement.description || "",
      date: achievement.date,
      image: achievement.image || "",
      video: achievement.video || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAchievement) return;

    const updatedAchievements = achievements.map(achievement => {
      if (achievement.id === currentAchievement.id) {
        return {
          ...achievement,
          ...formData,
          updatedAt: new Date().toISOString()
        };
      }
      return achievement;
    });

    setAchievements(updatedAchievements);
    setIsEditDialogOpen(false);
    setCurrentAchievement(null);
    
    toast({
      title: "Success",
      description: "Achievement updated successfully",
    });
  };

  const handleDelete = (id: number) => {
    setAchievements(achievements.filter(achievement => achievement.id !== id));
    toast({
      title: "Success",
      description: "Achievement deleted successfully",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#8B7355] text-white">
        <div className="p-4 flex items-center gap-2">
          <img 
            src="/lovable-uploads/5c03a00c-16fb-4305-bb33-b3a748c95b67.png" 
            alt="Logo" 
            className="w-10 h-10 rounded-full"
          />
          <h1 className="text-xl font-bold">ADMIN</h1>
        </div>
        
        <nav className="mt-8">
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <Star className="w-6 h-6" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/achievements" className="flex items-center gap-3 px-4 py-3 bg-[#9b815f] text-white">
            <Award className="w-6 h-6" />
            <span>Add Achievements</span>
          </Link>
          <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <ShoppingBag className="w-6 h-6" />
            <span>Add Products</span>
          </Link>
          <Link to="#" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
            <Star className="w-6 h-6" />
            <span>View Rating</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#8B7355]">Achievements</h1>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-[#8B7355] hover:bg-[#9b815f] text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Achievement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Achievement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Achievement Name</label>
                    <Input
                      name="achievement_name"
                      value={formData.achievement_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Video URL</label>
                    <Input
                      name="video"
                      value={formData.video}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
                    Add Achievement
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
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
                {achievements.map((achievement) => (
                  <TableRow key={achievement.id}>
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
                          onClick={() => console.log("View", achievement.id)}
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(achievement)}
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
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Achievement Name</label>
              <Input
                name="achievement_name"
                value={formData.achievement_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input
                name="image"
                value={formData.image}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Video URL</label>
              <Input
                name="video"
                value={formData.video}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full bg-[#8B7355] hover:bg-[#9b815f]">
              Update Achievement
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementManagement;