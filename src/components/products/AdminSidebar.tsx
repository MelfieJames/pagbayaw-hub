import { Link, useLocation } from "react-router-dom";
import {
  Award,
  ShoppingBag,
  LogOut,
  Settings,
  LayoutDashboard,
  UserCircle,
  MessageSquare,
  PackageCheck, // ✅ Icon for Purchases Management
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface AdminSidebarProps {
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div
      className={cn(
        "w-72 h-screen shadow-xl bg-[#fdfbf7] border-r flex flex-col transition-all duration-300 z-20",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "fixed md:relative"
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b bg-[#f0e8d9]">
        <UserCircle className="w-10 h-10 text-[#8B7355]" />
        <h1 className="text-2xl font-bold text-[#8B7355] tracking-wide">
          Admin Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 text-[15px]">
        <div>
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2 pl-2">
            Dashboard
          </div>
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive("/admin") &&
              !isActive("/admin/products") &&
              !isActive("/admin/achievements") &&
              !isActive("/admin/settings") &&
              !isActive("/admin/send-notification") &&
              !isActive("/admin/purchases")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </Link>
        </div>

        <div>
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2 pl-2">
            Content Management
          </div>
          <Link
            to="/admin/achievements"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive("/admin/achievements")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <Award className="w-5 h-5" />
            <span>Achievements</span>
          </Link>
          <Link
            to="/admin/products"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive("/admin/products")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Products</span>
          </Link>
        </div>

        <Separator />

        {/* NEW: Order Management */}
        <div>
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2 pl-2">
            Order Management
          </div>
          <Link
            to="/admin/purchases"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive("/admin/purchases")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <PackageCheck className="w-5 h-5" />
            <span>Purchases</span>
          </Link>
        </div>

        <Separator />

        <div>
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2 pl-2">
            Communication
          </div>
          <Link
            to="/admin/send-notification"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive("/admin/send-notification")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Send Notification</span>
          </Link>
        </div>

        <Separator />

        <div>
          <div className="text-xs uppercase text-gray-500 font-semibold mb-2 pl-2">
            Settings
          </div>
          <Link
            to="/admin/settings"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive("/admin/settings")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <Settings className="w-5 h-5" />
            <span>System Settings</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t bg-[#fdfbf7]">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
