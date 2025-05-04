
import { useState } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { OrderApproval } from "@/components/admin/OrderApproval";

export default function OrderApprovalPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-semibold text-[#8B7355]">Order Approval & Management</h2>
        <p className="text-gray-600 mb-6">Manage and update the status of customer orders</p>
        
        <OrderApproval />
      </div>
    </div>
  );
}
