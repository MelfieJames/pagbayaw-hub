
import { Link } from "react-router-dom";
import { Award, Package, MessageSquare, Home, Info } from "lucide-react";

export function NavItems() {
  return (
    <>
      <Link to="/" className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
        <Home className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
        <span className="font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-300">Home</span>
      </Link>
      <Link to="/achievements" className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
        <Award className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
        <span className="font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-300">Achievements</span>
      </Link>
      <Link to="/products" className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
        <Package className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
        <span className="font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-300">Products</span>
      </Link>
      <Link to="/about" className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
        <Info className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
        <span className="font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-300">About Us</span>
      </Link>
      <Link to="/contact" className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
        <MessageSquare className="h-4 w-4 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
        <span className="font-medium text-gray-700 group-hover:text-green-700 transition-colors duration-300">Contact Us</span>
      </Link>
    </>
  );
}
