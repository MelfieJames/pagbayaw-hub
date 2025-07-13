
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, Star, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NavItems } from "./NavItems";

export function MobileMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
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
  );
}
