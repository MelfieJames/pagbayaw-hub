
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Bell, 
  Trophy,
  Bot,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      description: "Overview and analytics"
    },
    {
      title: "Products",
      icon: Package,
      href: "/admin/products",
      description: "Manage inventory"
    },
    {
      title: "Orders",
      icon: ShoppingCart,
      href: "/admin/purchases",
      description: "View and manage orders"
    },
    {
      title: "Order Approval",
      icon: ShoppingCart,
      href: "/admin/order-approval",
      description: "Approve pending orders"
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/admin/notifications",
      description: "Send notifications"
    },
    {
      title: "Achievements",
      icon: Trophy,
      href: "/admin/achievements",
      description: "Manage achievements"
    },
    {
      title: "Chatbot",
      icon: Bot,
      href: "/admin/chatbot",
      description: "Configure chatbot"
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <h2 className="text-lg font-semibold text-[#8B7355]">Admin Panel</h2>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden md:flex hover:bg-gray-100"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="md:hidden hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-[#C4A484] text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? `${item.title} - ${item.description}` : undefined}
                  >
                    <item.icon className={cn(
                      "flex-shrink-0 transition-transform duration-200",
                      isCollapsed ? "h-5 w-5" : "h-4 w-4",
                      !isCollapsed && isActive && "scale-110"
                    )} />
                    {!isCollapsed && (
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{item.title}</span>
                        <span className={cn(
                          "text-xs truncate transition-colors duration-200",
                          isActive ? "text-white/80" : "text-gray-500"
                        )}>
                          {item.description}
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!isCollapsed && (
              <div className="text-xs text-gray-500 text-center">
                Admin Dashboard v1.0
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed top-20 left-4 z-40 md:hidden shadow-lg"
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
  );
}
