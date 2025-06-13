
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Star, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = (email: string) => {
    return email ? email[0].toUpperCase() : "U";
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) return null;

  return (
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
  );
}
