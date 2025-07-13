
import { Link } from "react-router-dom";
import { Award, Package, MessageSquare, Home, Info } from "lucide-react";

export function NavItems() {
  return (
    <>
      <Link
        to="/"
        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-green-900 bg-white/80 shadow-sm hover:bg-green-100 hover:text-green-800 hover:scale-105 focus:bg-green-200 focus:text-green-900 transition-all duration-200 outline-none ring-0"
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </Link>
      <Link
        to="/achievements"
        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-green-900 bg-white/80 shadow-sm hover:bg-green-100 hover:text-green-800 hover:scale-105 focus:bg-green-200 focus:text-green-900 transition-all duration-200 outline-none ring-0"
      >
        <Award className="h-5 w-5" />
        <span>Achievements</span>
      </Link>
      <Link
        to="/products"
        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-green-900 bg-white/80 shadow-sm hover:bg-green-100 hover:text-green-800 hover:scale-105 focus:bg-green-200 focus:text-green-900 transition-all duration-200 outline-none ring-0"
      >
        <Package className="h-5 w-5" />
        <span>Products</span>
      </Link>
      <Link
        to="/about"
        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-green-900 bg-white/80 shadow-sm hover:bg-green-100 hover:text-green-800 hover:scale-105 focus:bg-green-200 focus:text-green-900 transition-all duration-200 outline-none ring-0"
      >
        <Info className="h-5 w-5" />
        <span>About Us</span>
      </Link>
      <Link
        to="/contact"
        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-green-900 bg-white/80 shadow-sm hover:bg-green-100 hover:text-green-800 hover:scale-105 focus:bg-green-200 focus:text-green-900 transition-all duration-200 outline-none ring-0"
      >
        <MessageSquare className="h-5 w-5" />
        <span>Contact Us</span>
      </Link>
    </>
  );
}
