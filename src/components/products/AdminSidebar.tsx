
import { Link, useLocation } from "react-router-dom";
import { Star, Award, ShoppingBag, LogOut, Users, Shield, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
    <div className={`w-64 bg-[#8B7355] text-white h-screen flex flex-col transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} fixed md:relative z-10`}>
      <div className="p-4 flex items-center gap-2">
        <img 
          src="/lovable-uploads/5c03a00c-16fb-4305-bb33-b3a748c95b67.png" 
          alt="Logo" 
          className="w-10 h-10 rounded-full"
        />
        <h1 className="text-xl font-bold">ADMIN</h1>
      </div>
      
      <nav className="mt-8 flex-1 overflow-y-auto">
        <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 ${isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/admins') && !isActive('/admin/purchases') && !isActive('/admin/products') && !isActive('/admin/achievements') ? 'bg-[#9b815f]' : 'hover:bg-[#9b815f]'} text-white`}>
          <Star className="w-6 h-6" />
          <span>Dashboard</span>
        </Link>
        <Link to="/admin/users" className={`flex items-center gap-3 px-4 py-3 ${isActive('/admin/users') ? 'bg-[#9b815f]' : 'hover:bg-[#9b815f]'} text-white`}>
          <Users className="w-6 h-6" />
          <span>User Management</span>
        </Link>
        <Link to="/admin/admins" className={`flex items-center gap-3 px-4 py-3 ${isActive('/admin/admins') ? 'bg-[#9b815f]' : 'hover:bg-[#9b815f]'} text-white`}>
          <Shield className="w-6 h-6" />
          <span>Admin Management</span>
        </Link>
        <Link to="/admin/purchases" className={`flex items-center gap-3 px-4 py-3 ${isActive('/admin/purchases') ? 'bg-[#9b815f]' : 'hover:bg-[#9b815f]'} text-white`}>
          <DollarSign className="w-6 h-6" />
          <span>Recent Purchases</span>
        </Link>
        <Link to="/admin/achievements" className={`flex items-center gap-3 px-4 py-3 ${isActive('/admin/achievements') ? 'bg-[#9b815f]' : 'hover:bg-[#9b815f]'} text-white`}>
          <Award className="w-6 h-6" />
          <span>Add Achievements</span>
        </Link>
        <Link to="/admin/products" className={`flex items-center gap-3 px-4 py-3 ${isActive('/admin/products') ? 'bg-[#9b815f]' : 'hover:bg-[#9b815f]'} text-white`}>
          <ShoppingBag className="w-6 h-6" />
          <span>Add Products</span>
        </Link>
      </nav>

      <div className="p-4 mt-auto border-t border-[#9b815f]">
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
