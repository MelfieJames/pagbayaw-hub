import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { UserManagement } from "@/components/admin/UserManagement";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function UserManagementPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  
  // Check if current user is admin
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    // admin check logic
    if (!user && !isLoading) {
      toast.error("You must be logged in to access user management");
      navigate("/login", { 
        state: { redirectAfterLogin: "/admin/users", message: "Please log in to access user management" }
      });
      return;
    }

    if (!isLoading && isAdmin === false && user) {
      toast.error("You don't have permission to access user management");
      navigate("/");
    }

    if (!isLoading) {
      setIsCheckingAdmin(false);
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isCheckingAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
          <div className="p-6">
            {/* Only show the user list and delete buttons, no extra notes or instructions */}
            <UserManagement />
          </div>
        </main>
      </div>
    </div>
  );
} 