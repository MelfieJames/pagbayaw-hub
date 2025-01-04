import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ErrorModal from "@/components/ErrorModal";
import bcrypt from "bcryptjs";

// Simple in-memory storage for registered users
const registeredUsers: { email: string; password: string; name?: string }[] = [];

// Admin credentials
const ADMIN_EMAIL = "admin@unvas.com";
const ADMIN_PASSWORD = "admin123!@#";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Error modal state
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState({
    title: "",
    message: "",
  });

  const showError = (title: string, message: string) => {
    setErrorModalContent({ title, message });
    setIsErrorModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin authentication
    if (email === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        login({ email, isAdmin: true, name: "Admin" });
        toast({
          title: "Admin Login Successful",
          description: "Welcome back, Admin!",
        });
        navigate("/admin");
        return;
      } else {
        showError(
          "Invalid Admin Credentials",
          "The password you entered is incorrect."
        );
        return;
      }
    }
    
    if (isLogin) {
      // Login logic
      const user = registeredUsers.find(u => u.email === email);
      if (!user) {
        showError(
          "Account Not Found",
          "This email is not registered. Please sign up first."
        );
        return;
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        showError(
          "Invalid Credentials",
          "The password you entered is incorrect."
        );
        return;
      }
      
      login({ email, isAdmin: false, name: user.name });
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate("/");
    } else {
      // Sign up logic
      const existingUser = registeredUsers.find(u => u.email === email);
      if (existingUser) {
        showError(
          "Email Already Registered",
          "This email is already registered. Please log in instead."
        );
        return;
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      registeredUsers.push({ email, password: hashedPassword, name });
      toast({
        title: "Sign Up Successful",
        description: "You can now log in with your credentials.",
      });
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            {isLogin ? "Login" : "Sign Up"}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <Button type="submit" className="w-full">
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={errorModalContent.title}
        message={errorModalContent.message}
      />
    </div>
  );
};

export default Login;