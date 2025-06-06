
import { useState } from "react";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import ChatbotConfiguration from "@/components/admin/ChatbotConfiguration";

export default function AdminChatbotPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "md:ml-16"
        } pt-16`}
      >
        <div className="p-4 md:p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#8B7355]">
              Chatbot Configuration
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Customize your chatbot settings and behavior for the best user experience
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <ChatbotConfiguration />
          </div>
        </div>
      </div>
    </div>
  );
}
