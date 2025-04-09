
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import AdminDashboardMainContent from "@/components/admin/AdminDashboardMainContent";

export default function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
        />
        <main className={`flex-1 transition-all ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
          <AdminDashboardMainContent />
        </main>
      </div>
    </div>
  );
}
