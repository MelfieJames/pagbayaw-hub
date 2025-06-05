
import { useState } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import ChatbotConfiguration from "@/components/admin/ChatbotConfiguration";

export default function AdminChatbotPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#8B7355]">Chatbot Configuration</h1>
          <p className="text-gray-600 mt-1">
            Customize your chatbot settings and behavior
          </p>
        </div>

        <ChatbotConfiguration />
      </div>
    </div>
  );
}
