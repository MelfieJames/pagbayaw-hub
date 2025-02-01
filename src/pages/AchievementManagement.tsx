import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Star, Award, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AchievementForm } from "@/components/achievements/AchievementForm";
import { AchievementList } from "@/components/achievements/AchievementList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const AchievementManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setCurrentAchievement(null);
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Achievement</DialogTitle>
                </DialogHeader>
                <AchievementForm 
                  mode="add"
                  onSuccess={handleAddSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>

          <QueryClientProvider client={queryClient}>
            <AchievementList
              onEdit={(achievement) => {
                setCurrentAchievement(achievement);
                setIsEditDialogOpen(true);
              }}
            />
          </QueryClientProvider>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          <AchievementForm
            mode="edit"
            initialData={currentAchievement}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementManagement;
