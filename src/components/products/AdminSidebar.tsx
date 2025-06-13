
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Bell,
  MessageSquare,
  Trophy,
  Menu,
  X,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Star, label: "Reviews", href: "/admin/reviews" },
    { icon: Bell, label: "Notifications", href: "/admin/notifications" },
    { icon: MessageSquare, label: "Chatbot", href: "/admin/chatbot" },
    { icon: Trophy, label: "Achievements", href: "/admin/achievements" },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#8B7355] mb-6">Admin Panel</h2>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                  location.pathname === item.href
                    ? "bg-[#8B7355] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#8B7355]"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
