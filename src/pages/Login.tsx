import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ErrorModal from "@/components/ErrorModal";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();
  }, [navigate]);

  const showError = (title: string, message: string) => {
    setErrorModalContent({ title, message });
    setIsErrorModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (email === "admin@unvas.com") {
        // Try to sign in first for admin
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // If sign in fails, try to sign up
          if (password === "admin123!@#") {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
            });

            if (signUpError) {
              if (signUpError.message.includes("User already registered")) {
                showError(
                  "Authentication Error",
                  "Invalid admin credentials. Please check your password."
                );
              } else {
                throw signUpError;
              }
            } else if (signUpData.user) {
              navigate("/admin");
            }
          } else {
            showError(
              "Invalid Admin Credentials",
              "The password you entered is incorrect."
            );
          }
        } else if (signInData.user) {
          navigate("/admin");
        }
        return;
      }
      
      let authResponse;
      if (isLogin) {
        authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        authResponse = await supabase.auth.signUp({
          email,
          password,
        });
      }

      const { data, error } = authResponse;
      if (error) throw error;

      if (data.user) {
        if (isLogin) {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          navigate("/");
        } else {
          toast({
            title: "Sign Up Successful",
            description: "You can now log in with your credentials.",
          });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      showError(
        "Authentication Error",
        error.message || "An error occurred during authentication"
      );
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