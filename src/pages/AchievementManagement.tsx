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

interface Achievement {
  id: number;
  name: string;
  description: string;
  date: string;
  image: string;
}

const initialAchievements: Achievement[] = [
  {
    id: 1,
    name: "Golden Horizon Award",
    description: "Excellence in Craftsmanship",
    date: "2024-01-15",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Best Design Award",
    description: "Innovation in Jewelry Design",
    date: "2024-02-20",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Customer Choice Award",
    description: "Outstanding Customer Service",
    date: "2024-03-01",
    image: "/placeholder.svg"
  }
];

const AchievementManagement = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);

  const handleView = (id: number) => {
    console.log("Viewing achievement:", id);
  };

  const handleEdit = (id: number) => {
    console.log("Editing achievement:", id);
  };

  const handleDelete = (id: number) => {
    setAchievements(achievements.filter(achievement => achievement.id !== id));
  };

  const handleAddNew = () => {
    console.log("Adding new achievement");
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
            <Button 
              onClick={handleAddNew}
              className="bg-[#8B7355] hover:bg-[#9b815f] text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Achievement
            </Button>
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
                        src={achievement.image} 
                        alt={achievement.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{achievement.name}</TableCell>
                    <TableCell>{achievement.description}</TableCell>
                    <TableCell>{achievement.date}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleView(achievement.id)}
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(achievement.id)}
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
    </div>
  );
};

export default AchievementManagement;