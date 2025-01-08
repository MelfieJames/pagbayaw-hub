import { Link } from "react-router-dom";
import { Star, Award, ShoppingBag } from "lucide-react";

export function AdminSidebar() {
  return (
    <div className="w-64 bg-[#8B7355] text-white">
      <div className="p-4 flex items-center gap-2">
        <img 
          src="/lovable-uploads/5c03a00c-16fb-4305-bb33-b3a748c95b67.png" 
          alt="Logo" 
          className="w-10 h-10 rounded-full"
        />
        <h1 className="text-xl font-bold">ADMIN</h1>
      </div>
      
      <nav className="mt-8">
        <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
          <Star className="w-6 h-6" />
          <span>Dashboard</span>
        </Link>
        <Link to="/admin/achievements" className="flex items-center gap-3 px-4 py-3 hover:bg-[#9b815f] text-white">
          <Award className="w-6 h-6" />
          <span>Add Achievements</span>
        </Link>
        <Link to="/admin/products" className="flex items-center gap-3 px-4 py-3 bg-[#9b815f] text-white">
          <ShoppingBag className="w-6 h-6" />
          <span>Add Products</span>
        </Link>
      </nav>
    </div>
  );
}