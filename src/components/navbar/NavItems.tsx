
import { Link } from "react-router-dom";
import { Award, Package, MessageSquare, Home, Info } from "lucide-react";

export function NavItems() {
  return (
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
}
