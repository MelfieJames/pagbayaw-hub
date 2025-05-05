
import { useState } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import SendNotificationForm from "@/components/admin/SendNotificationForm";

export default function AdminNotificationsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold text-[#8B7355]">Send Notifications</h2>
        <p className="text-gray-600 mb-6">Send tracking updates to customers</p>
        
        <SendNotificationForm />
      </div>
    </div>
  );
}
