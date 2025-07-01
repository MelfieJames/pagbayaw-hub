
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import AdminDashboardMainContent from "@/components/admin/AdminDashboardMainContent";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
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
    // Immediate redirect if not logged in
    if (!user && !isLoading) {
      toast.error("You must be logged in to access the admin dashboard");
      navigate("/login", { 
        state: { redirectAfterLogin: "/admin", message: "Please log in to access the admin dashboard" }
      });
      return;
    }

    // Wait for admin check to complete
    if (!isLoading && isAdmin === false && user) {
      toast.error("You don't have permission to access the admin dashboard");
      navigate("/");
    }

    if (!isLoading) {
      setIsCheckingAdmin(false);
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isCheckingAdmin || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
        <main className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "md:ml-16"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-amber-800 mb-2">Admin Dashboard</h1>
              <p className="text-amber-700">Manage your business operations and monitor performance</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border-2 border-amber-200">
              <AdminDashboardMainContent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
