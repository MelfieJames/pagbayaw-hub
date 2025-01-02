import { Home, Award, ShoppingBag, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold">
              UNVAS<sup className="text-xs">®</sup>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" icon={<Home />} text="Home" />
            <NavLink to="/achievements" icon={<Award />} text="Achievements" />
            <NavLink to="/products" icon={<ShoppingBag />} text="Products" />
            <NavLink to="/contact" icon={<Mail />} text="Contact Us" />
            <NavLink to="/login" icon={<User />} text="Log In" />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) => (
  <Link
    to={to}
    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
  >
    {icon}
    <span>{text}</span>
  </Link>
);

export default Navbar;