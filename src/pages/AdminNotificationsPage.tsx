
import { useState } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { TrackingNotificationForm } from "@/components/admin/TrackingNotificationForm";
import { NotificationManagement } from "@/components/admin/NotificationManagement";
import Navbar from "@/components/Navbar";

export default function AdminNotificationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("send");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`flex-1 transition-all p-6 ${isSidebarOpen ? "md:ml-64" : "ml-0"}`}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-[#8B7355] mb-2">Notification Management</h2>
            <p className="text-gray-600 mb-6">Send notifications and manage customer communications</p>
            
            <div className="flex border-b mb-6">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'send' ? 'border-b-2 border-[#8B7355] text-[#8B7355]' : 'text-gray-500'}`}
                onClick={() => setActiveTab('send')}
              >
                Send Tracking Updates
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'manage' ? 'border-b-2 border-[#8B7355] text-[#8B7355]' : 'text-gray-500'}`}
                onClick={() => setActiveTab('manage')}
              >
                Manage Notifications
              </button>
            </div>
            
            {activeTab === 'send' && <TrackingNotificationForm />}
            {activeTab === 'manage' && <NotificationManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}
