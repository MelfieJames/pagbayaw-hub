import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsPopover } from "./notifications/NotificationsPopover";
import { CartPopover } from "./products/CartPopover";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Award, Package, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const getInitials = (email: string) => {
    return email ? email[0].toUpperCase() : "U";
  };

  return (
    <nav className="fixed top-0 w-full bg-white border-b z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold">
            UNVAS®
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link to="/achievements" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Award className="h-4 w-4" />
              <span>Achievements</span>
            </Link>
            <Link to="/products" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </Link>
            <Link to="/contact" className="flex items-center gap-2 hover:text-primary transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span>Contact</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
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
