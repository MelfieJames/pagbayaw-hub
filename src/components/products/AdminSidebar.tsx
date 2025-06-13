
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Bell,
  MessageSquare,
  Trophy,
  Menu,
  X,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Star, label: "Reviews", href: "/admin/reviews" },
    { icon: Bell, label: "Notifications", href: "/admin/notifications" },
    { icon: MessageSquare, label: "Chatbot", href: "/admin/chatbot" },
    { icon: Trophy, label: "Achievements", href: "/admin/achievements" },
  ];

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

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
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-50",
        sidebarWidth,
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-[#8B7355]">Admin Panel</h2>
            )}
            
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-6 w-6"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 group",
                  location.pathname === item.href
                    ? "bg-[#8B7355] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#8B7355]",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
