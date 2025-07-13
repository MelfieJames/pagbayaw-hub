
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
            {user ? (
              <>
                <CartPopover />
                <NotificationsPopover />
                <UserMenu />
              </>
            ) : (
              <div className="flex gap-2">
                {!isMobile && (
                  <Button onClick={() => navigate("/login")}
                    className="border-green-700 text-green-700 bg-white hover:bg-green-50 hover:text-green-900 hover:shadow-md transition-all duration-200 flex items-center gap-2 px-5 py-2 text-base font-semibold">
                    <LogIn className="w-5 h-5" />
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
