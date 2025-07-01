
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Star, Clock, LogOut, Shield } from "lucide-react";
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
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/profile")} className="flex items-center gap-3 py-3 px-4 text-sm">
          <User className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/my-ratings")} className="flex items-center gap-3 py-3 px-4 text-sm">
          <Star className="h-5 w-5 text-yellow-500" />
          <span className="font-medium">My Ratings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/purchase-history")} className="flex items-center gap-3 py-3 px-4 text-sm">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Purchase History</span>
        </DropdownMenuItem>
        {user.isAdmin && (
          <DropdownMenuItem onClick={() => navigate("/admin")} className="flex items-center gap-3 py-3 px-4 text-sm">
            <Shield className="h-5 w-5 text-purple-600" />
            <span className="font-medium">Dashboard</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-3 py-3 px-4 text-sm text-red-600 hover:text-red-700">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
