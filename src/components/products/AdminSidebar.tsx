
import { Link, useLocation } from "react-router-dom";
import {
  Award,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  UserCircle,
  Home,
  PackageCheck,
  Bell,
  CheckCircle,
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
        "w-72 h-screen shadow-xl bg-[#fdfbf7] border-r flex flex-col transition-all duration-300 z-20 overflow-y-auto",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "fixed md:relative"
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-4 border-b bg-[#f0e8d9] sticky top-0 z-10">
        <UserCircle className="w-10 h-10 text-[#8B7355]" />
        <h1 className="text-2xl font-bold text-[#8B7355] tracking-wide">
          Admin Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-6 text-[15px] overflow-y-auto">
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
              !isActive("/admin/send-notification") &&
              !isActive("/admin/purchases")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </Link>
          
          <Link
            to="/admin/order-approval"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive("/admin/order-approval")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Order Approval</span>
          </Link>
          
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
              isActive("/")
                ? "bg-[#F5F5DC] text-[#8B7355] font-semibold"
                : "hover:bg-[#f3f3f3] text-gray-700"
            )}
          >
            <Home className="w-5 h-5" />
            <span>View Website</span>
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

        {/* Order Management */}
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
            <Bell className="w-5 h-5" />
            <span>Send Notification</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t bg-[#fdfbf7] sticky bottom-0 z-10">
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
