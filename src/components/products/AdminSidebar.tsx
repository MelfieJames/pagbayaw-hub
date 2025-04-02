
import { Link, useLocation } from "react-router-dom";
import { Award, ShoppingBag, LogOut, Users, Shield, DollarSign, LayoutDashboard, Settings, UserCog, User } from "lucide-react";
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
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`w-64 shadow-md border-r text-gray-800 h-screen flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:relative z-10`}>
      <div className="p-4 flex items-center gap-2 border-b">
        <img 
          src="/lovable-uploads/5c03a00c-16fb-4305-bb33-b3a748c95b67.png" 
          alt="Logo" 
          className="w-10 h-10 rounded-full"
        />
        <h1 className="text-xl font-bold text-[#8B7355]">ADMIN PANEL</h1>
      </div>
      
      <nav className="mt-6 flex-1 overflow-y-auto px-3">
        <div className="text-xs uppercase text-gray-500 font-semibold mb-2 pl-2">Dashboard</div>
        <Link to="/admin" className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-700 transition-colors",
          isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/admins') && !isActive('/admin/products') && !isActive('/admin/achievements') ? 
            'bg-[#F5F5DC] text-[#8B7355] font-medium' : 
            'hover:bg-gray-100'
        )}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Overview</span>
        </Link>
        
        <div className="text-xs uppercase text-gray-500 font-semibold mt-6 mb-2 pl-2">User Management</div>
        <Link to="/admin/users" className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-700 transition-colors",
          isActive('/admin/users') ? 'bg-[#F5F5DC] text-[#8B7355] font-medium' : 'hover:bg-gray-100'
        )}>
          <User className="w-5 h-5" />
          <span>User Management</span>
        </Link>
        <Link to="/admin/admins" className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-700 transition-colors", 
          isActive('/admin/admins') ? 'bg-[#F5F5DC] text-[#8B7355] font-medium' : 'hover:bg-gray-100'
        )}>
          <UserCog className="w-5 h-5" />
          <span>Admin Management</span>
        </Link>
        
        <div className="text-xs uppercase text-gray-500 font-semibold mt-6 mb-2 pl-2">Content Management</div>
        <Link to="/admin/achievements" className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-700 transition-colors",
          isActive('/admin/achievements') ? 'bg-[#F5F5DC] text-[#8B7355] font-medium' : 'hover:bg-gray-100'
        )}>
          <Award className="w-5 h-5" />
          <span>Achievements</span>
        </Link>
        <Link to="/admin/products" className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-700 transition-colors",
          isActive('/admin/products') ? 'bg-[#F5F5DC] text-[#8B7355] font-medium' : 'hover:bg-gray-100'
        )}>
          <ShoppingBag className="w-5 h-5" />
          <span>Products</span>
        </Link>

        <Separator className="my-6" />
        
        <div className="text-xs uppercase text-gray-500 font-semibold mt-2 mb-2 pl-2">Settings</div>
        <Link to="/admin/settings" className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-gray-700 transition-colors",
          isActive('/admin/settings') ? 'bg-[#F5F5DC] text-[#8B7355] font-medium' : 'hover:bg-gray-100'
        )}>
          <Settings className="w-5 h-5" />
          <span>System Settings</span>
        </Link>
      </nav>

      <div className="p-4 mt-auto border-t">
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
