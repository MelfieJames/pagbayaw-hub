
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Trophy, 
  ShoppingBag, 
  Info, 
  Mail, 
  LogIn, 
  UserPlus, 
  LogOut 
} from "lucide-react";

const NavItems = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { 
      to: "/", 
      label: "Home", 
      icon: Home, 
      auth: false 
    },
    { 
      to: "/achievements", 
      label: "Achievements", 
      icon: Trophy, 
      auth: false 
    },
    { 
      to: "/products", 
      label: "Products", 
      icon: ShoppingBag, 
      auth: false 
    },
    { 
      to: "/about", 
      label: "About Us", 
      icon: Info, 
      auth: false 
    },
    { 
      to: "/contact", 
      label: "Contact Us", 
      icon: Mail, 
      auth: false 
    },
  ];

  return (
    <div className="flex items-center space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`group flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
            isActive(item.to)
              ? "text-green-700 bg-green-50 shadow-md"
              : "text-green-600 hover:text-green-700 hover:bg-green-50/70"
          }`}
        >
          <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:animate-pulse">{item.label}</span>
        </Link>
      ))}
      
      {user ? (
        <button
          onClick={handleLogout}
          className="group flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-red-600 hover:text-red-700 hover:bg-red-50/70 transition-all duration-300 transform hover:scale-105"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:animate-pulse">Logout</span>
        </button>
      ) : (
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="group flex items-center space-x-2 px-6 py-2 rounded-xl font-medium bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
          >
            <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="group-hover:animate-pulse">Login</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default NavItems;
