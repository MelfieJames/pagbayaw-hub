
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsPopover } from "./notifications/NotificationsPopover";
import { CartPopover } from "./products/CartPopover";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useEffect } from "react";
import { NavItems } from "./navbar/NavItems";
import { UserMenu } from "./navbar/UserMenu";
import { MobileMenu } from "./navbar/MobileMenu";
import logo from '/public/lovable-uploads/unvas-logo.jpg';
import { LogIn } from "lucide-react";

const PUBLIC_ROUTES = ['/', '/about', '/achievements', '/products', '/contact', '/login'];

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
    );
    
    if (!user && !isPublicRoute && location.pathname !== "/login") {
      navigate("/login", { 
        state: { redirectAfterLogin: location.pathname, message: "Please log in to access this page" } 
      });
    }
  }, [user, location.pathname, navigate]);

  return (
<<<<<<< HEAD
    <nav className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 animate-fade-in">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo and UNVAS text on the left */}
          <Link to="/" className="flex items-center group transition-transform duration-200 hover:scale-105 hover:opacity-90">
            <img
              src={logo}
              alt="UNVAS Logo"
              className="h-10 w-10 rounded-full shadow-md mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl"
              style={{ objectFit: 'cover' }}
            />
            <span className="text-2xl font-bold text-[#6b8e68] tracking-wide ml-1 group-hover:text-green-800 transition-colors duration-200">UNVAS®</span>
          </Link>

          {/* Nav items in the center with fixed gap */}
          <div className="hidden md:flex items-center gap-10 mx-auto">
            <NavItems />
          </div>

          {/* User/cart/notification/login on the right */}
          <div className="flex items-center space-x-5 pr-4">
=======
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl border-b border-green-100 z-50 shadow-lg">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-20 w-full">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/lovable-uploads/unvas-logo.jpg" 
                alt="UNVAS Logo" 
                className="h-12 w-12 rounded-full object-cover ring-2 ring-green-500/20 group-hover:ring-green-500/40 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent group-hover:from-green-500 group-hover:to-green-700 transition-all duration-300">
              UNVAS®
            </span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <NavItems />
          </div>

          <div className="flex items-center space-x-4 pr-2">
>>>>>>> 86f416d4579a79be84e58f480bf7648ced745a19
            {user ? (
              <>
                <div className="flex items-center space-x-3">
                  <CartPopover />
                  <NotificationsPopover />
                  <UserMenu />
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                {!isMobile && (
<<<<<<< HEAD
                  <Button onClick={() => navigate("/login")}
                    className="border-green-700 text-green-700 bg-white hover:bg-green-50 hover:text-green-900 hover:shadow-md transition-all duration-200 flex items-center gap-2 px-5 py-2 text-base font-semibold">
                    <LogIn className="w-5 h-5" />
=======
                  <Button 
                    onClick={() => navigate("/login")} 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-glow"
                  >
>>>>>>> 86f416d4579a79be84e58f480bf7648ced745a19
                    Login
                  </Button>
                )}
              </div>
            )}
            {isMobile && <MobileMenu />}
          </div>
        </div>
      </div>
    </nav>
  );
}
