
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
    <nav className="fixed top-0 left-0 w-full bg-white border-b z-50">
      <div className="w-full px-4">
        <div className="flex items-center justify-between h-16 w-full">
          <Link to="/" className="text-xl font-bold ml-5">
            UNVAS®
          </Link>

          <div className="hidden md:flex space-x-6">
            <NavItems />
          </div>

          <div className="flex items-center space-x-3 pr-8">
            {user ? (
              <>
                <CartPopover />
                <NotificationsPopover />
                <UserMenu />
              </>
            ) : (
              <div className="flex gap-2">
                {!isMobile && (
                  <Button onClick={() => navigate("/login")} className="mr-[10px]">
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
