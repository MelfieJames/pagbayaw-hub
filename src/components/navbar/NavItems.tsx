
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 86f416d4579a79be84e58f480bf7648ced745a19
  );
};

export default NavItems;
