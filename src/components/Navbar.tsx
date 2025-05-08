
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsPopover } from "./notifications/NotificationsPopover";
import { CartPopover } from "./products/CartPopover";
import { useMediaQuery } from "@/hooks/use-mobile";
import {
  Award,
  Package,
  MessageSquare,
  Menu,
  Home,
  Info,
  Star,
  User,
  Clock,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/about', '/achievements', '/products', '/contact', '/login'];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const getInitials = (email: string) => {
    return email ? email[0].toUpperCase() : "U";
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Only redirect on protected routes
  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      location.pathname === route || location.pathname.startsWith(route + '/')
    );
    
    // Only redirect if not on a public route and user is not authenticated
    if (!user && !isPublicRoute && location.pathname !== "/login") {
      navigate("/login", { 
        state: { redirectAfterLogin: location.pathname, message: "Please log in to access this page" } 
      });
    }
  }, [user, location.pathname, navigate]);

  const NavItems = () => (
    <>
      <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors">
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>
      <Link to="/achievements" className="flex items-center gap-2 hover:text-primary transition-colors">
        <Award className="h-4 w-4" />
        <span>Achievements</span>
      </Link>
      <Link to="/products" className="flex items-center gap-2 hover:text-primary transition-colors">
        <Package className="h-4 w-4" />
        <span>Products</span>
      </Link>
      <Link to="/about" className="flex items-center gap-2 hover:text-primary transition-colors">
        <Info className="h-4 w-4" />
        <span>About Us</span>
      </Link>
      <Link to="/contact" className="flex items-center gap-2 hover:text-primary transition-colors">
        <MessageSquare className="h-4 w-4" />
        <span>Contact Us</span>
      </Link>
    </>
  );

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="p-0 h-8 w-8">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {getInitials(user.email || "")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/my-ratings")}>
                      <Star className="h-4 w-4 mr-2" />
                      My Ratings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/purchase-history")}>
                      <Clock className="h-4 w-4 mr-2" />
                      Purchase History
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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

            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavItems />
                    {user && (
                      <>
                        <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        <Link to="/my-ratings" className="flex items-center gap-2 hover:text-primary transition-colors">
                          <Star className="h-4 w-4" />
                          <span>My Ratings</span>
                        </Link>
                        <Link to="/purchase-history" className="flex items-center gap-2 hover:text-primary transition-colors">
                          <Clock className="h-4 w-4" />
                          <span>Purchase History</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-2 hover:text-red-500 transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                    {!user && (
                      <div className="flex flex-col gap-2 mt-4">
                        <Button onClick={() => navigate("/login")}>
                          Login
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
