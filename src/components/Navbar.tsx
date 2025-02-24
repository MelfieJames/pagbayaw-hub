
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { CartPopover } from "./products/CartPopover";
import { NotificationsPopover } from "./notifications/NotificationsPopover";
import { useMediaQuery } from "@/hooks/use-mobile";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <nav className="fixed top-0 w-full bg-white border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            Logo
          </Link>

          <div className="hidden md:flex space-x-4">
            <Link to="/achievements" className="hover:text-primary">
              Achievements
            </Link>
            <Link to="/products" className="hover:text-primary">
              Products
            </Link>
            <Link to="/contact" className="hover:text-primary">
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {user ? (
              <>
                {!isMobile && <CartPopover />}
                <NotificationsPopover />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Account</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => navigate("/login")}>Login</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
