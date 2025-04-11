import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Award, Package, MessageSquare, Menu, Home, Info, Star, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getInitials = (email: string) => {
    return email ? email[0].toUpperCase() : "U";
  };
  
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
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled 
        ? "bg-white/95 backdrop-blur-sm shadow-sm border-b py-3" 
        : "bg-white/80 backdrop-blur-md py-4"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight transition-opacity hover:opacity-90">
            UNVAS®
          </Link>

          <div className="hidden md:flex space-x-8">
            <NavItems />
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full p-0 h-8 w-8 overflow-hidden">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.email || "")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="py-2 cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/my-ratings")} className="py-2 cursor-pointer">
                      <Star className="h-4 w-4 mr-2" />
                      My Ratings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()} className="py-2 cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-3">
                {!isMobile && (
                  <>
                    <Button 
                      onClick={() => navigate("/auth?mode=signup")} 
                      variant="outline" 
                      className="rounded-full border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      Sign Up
                    </Button>
                    <Button 
                      onClick={() => navigate("/login")} 
                      className="rounded-full bg-primary hover:bg-primary/90 transition-all"
                    >
                      Login
                    </Button>
                  </>
                )}
              </div>
            )}
            
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col space-y-5 mt-8">
                    <NavItems />
                    {user ? (
                      <>
                        <Link to="/profile" className="flex items-center gap-2 hover:text-primary transition-colors">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        <Link to="/my-ratings" className="flex items-center gap-2 hover:text-primary transition-colors">
                          <Star className="h-4 w-4" />
                          <span>My Ratings</span>
                        </Link>
                        <Button 
                          onClick={() => signOut()} 
                          variant="destructive" 
                          className="mt-4"
                        >
                          Logout
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-3 mt-6">
                        <Button onClick={() => navigate("/auth?mode=signup")}>
                          Sign Up
                        </Button>
                        <Button onClick={() => navigate("/login")} variant="outline">
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
