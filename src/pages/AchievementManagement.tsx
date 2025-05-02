import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, Pencil } from "lucide-react";
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
import { AdminSidebar } from "@/components/products/AdminSidebar";
import Navbar from "@/components/Navbar";

const queryClient = new QueryClient();

const AchievementManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setCurrentAchievement(null);
    queryClient.invalidateQueries({ queryKey: ["achievements"] });
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["achievements"] });
  };

  // Hide the description field using CSS (if not modifiable directly)
  const AchievementFormWrapper = ({ mode, initialData, onSuccess, onClose }: any) => (
    <div className="achievement-form-wrapper">
      <style>
        {`.achievement-form-wrapper [for="description"],
          .achievement-form-wrapper #description,
          .achievement-form-wrapper textarea[name="description"] {
            display: none !important;
        }`}
      </style>
      <AchievementForm
        mode={mode}
        initialData={initialData}
        onSuccess={onSuccess}
        onClose={onClose}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar */}
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content */}
        <main className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3 text-[#8B7355]">
                <Trophy className="w-7 h-7" />
                <h1 className="text-3xl font-bold">Achievement Management</h1>
              </div>

              {/* Add Button */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#8B7355] hover:bg-[#a48b69] text-white font-medium shadow-md">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Achievement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add New Achievement
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <AchievementFormWrapper
                      mode="add"
                      onSuccess={handleAddSuccess}
                      onClose={() => setIsAddDialogOpen(false)}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Achievement List */}
            <QueryClientProvider client={queryClient}>
              <AchievementList
                onEdit={(achievement) => {
                  setCurrentAchievement(achievement);
                  setIsEditDialogOpen(true);
                }}
              />
            </QueryClientProvider>
          </div>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Achievement
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <AchievementFormWrapper
              mode="edit"
              initialData={currentAchievement}
              onSuccess={handleEditSuccess}
              onClose={() => setIsEditDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AchievementManagement;
