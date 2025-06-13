import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, ShoppingCart, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { CartAnimation } from "@/components/products/CartAnimation";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: cartDetails, refetch: refetchCartDetails } = useQuery({
    queryKey: ['cart-details', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('cart')
        .select('*, products(product_name, product_price, image)')
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching cart details:", error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5000, // 5 seconds
  });

  const cartItemCount = cartDetails ? cartDetails.length : 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const triggerCartAnimation = () => {
    setShowCartAnimation(true);
  };

  useEffect(() => {
    (window as any).triggerCartAnimation = triggerCartAnimation;
    return () => {
      delete (window as any).triggerCartAnimation;
    };
  }, []);

  return (
    <>
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-[#8B7355]">
            E-Comm
          </Link>

          <div className="flex items-center gap-4">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setTheme(theme => (theme === "light" ? "dark" : "light"))
                }
              >
                <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            <Link to="/cart" className="relative">
              <ShoppingCart className="h-5 w-5 text-gray-600 hover:text-gray-800 transition-colors" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground shadow-md">
                  {cartItemCount}
                </Badge>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#8B7355]/10 text-[#8B7355] font-semibold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 absolute right-1 bottom-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/purchase-history")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Purchase History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      <CartAnimation 
        trigger={showCartAnimation}
        onAnimationComplete={() => setShowCartAnimation(false)}
      />
    </>
  );
}
