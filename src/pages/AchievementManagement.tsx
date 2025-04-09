
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['achievements'] });
  };

  // This is a wrapper for AchievementForm that will hide the description field
  const AchievementFormWrapper = ({ mode, initialData, onSuccess, onClose }: any) => {
    // We'll use CSS to hide the description field since we can't modify the actual component
    return (
      <div className="achievement-form-wrapper">
        <style jsx>{`
          .achievement-form-wrapper :global([for="description"]),
          .achievement-form-wrapper :global(#description),
          .achievement-form-wrapper :global(textarea[name="description"]) {
            display: none !important;
          }
        `}</style>
        <AchievementForm
          mode={mode}
          initialData={initialData}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
        
        <main className={`flex-1 transition-all ${isSidebarOpen ? "md:ml-64" : "ml-0"} p-6`}>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-[#8B7355]">Achievement Management</h1>
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
            <DialogTitle>Edit Achievement</DialogTitle>
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
