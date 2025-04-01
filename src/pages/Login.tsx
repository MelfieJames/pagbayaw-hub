
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/services/supabase/client";
import { handleAdminAuth, handleUserAuth } from "@/services/authService";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resendConfirmationEmail } = useAuth();

  const redirectPath = location.state?.redirectAfterLogin || "/";
  const message = location.state?.message || null;

  const [isConfirmationAlertOpen, setIsConfirmationAlertOpen] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (message) {
      toast(message);
    }
  }, [message]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(redirectPath);
      }
    };
    checkSession();
  }, [navigate, redirectPath]);

  const handleResendConfirmation = async () => {
    const success = await resendConfirmationEmail(confirmationEmail);
    if (success) {
      setIsConfirmationAlertOpen(false);
      toast.success("Confirmation email resent successfully!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      if (email === "admin@unvas.com") {
        const { user, error } = await handleAdminAuth(email, password);

        if (error) {
          console.error("Admin auth error:", error);
          const errorInfo = getAuthErrorMessage(error);
          setErrorMessage(errorInfo.message);
          return;
        }

        if (user) {
          toast.success("Admin Login Successful", {
            description: "Welcome back, Admin!",
          });
          navigate("/admin");
        }
        return;
      }

      const { user, error } = await handleUserAuth(isLogin, email, password);

      if (error) {
        console.error("User auth error:", error);

        if (error.message?.includes("Email not confirmed")) {
          setConfirmationEmail(email);
          setIsConfirmationAlertOpen(true);
          return;
        }

        const errorInfo = getAuthErrorMessage(error);
        setErrorMessage(errorInfo.message);
        return;
      }

      if (user) {
        if (isLogin) {
          toast.success("Login Successful", {
            description: "Welcome back!",
          });
          navigate(redirectPath);
        } else {
          toast.success("Sign Up Successful", {
            description: "Please check your email to confirm your account.",
          });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);

      if (error.message?.includes("Email not confirmed")) {
        setConfirmationEmail(email);
        setIsConfirmationAlertOpen(true);
        return;
      }

      const errorInfo = getAuthErrorMessage(error);
      setErrorMessage(errorInfo.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen w-full overflow-hidden pt-16">
        {/* Left panel - decorative */}
        <div className="hidden w-1/2 bg-[#A8D0B9] lg:flex flex-col items-center justify-center p-12 relative">
          <div className="max-w-md text-center">
            <img 
              src="/lovable-uploads/pic.png" 
              alt="UNVAS Illustration" 
              className="w-48 h-auto mx-auto mb-10"
            />
            <h2 className="text-2xl font-semibold text-white mb-4">Your trusted partner in eco-friendly products</h2>
            <p className="text-white/80">Discover sustainable solutions that respect our environment while enhancing your daily life.</p>
          </div>
        </div>
        
        {/* Right panel - form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-semibold mb-2 text-gray-800">UNVAS</h1>
              <p className="text-gray-500 mb-8">Welcome to UNVAS</p>
            </div>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name"
                      type="text" 
                      placeholder="Enter your full name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                
                {isLogin && (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)} 
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-500">
                      Remember me
                    </Label>
                  </div>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-[#A8D0B9] hover:bg-[#97C0A9]">
                {isLogin ? "Sign in" : "Sign up"}
              </Button>
            </form>
            
            <p className="text-center text-sm text-gray-500">
              {isLogin ? "New to UNVAS?" : "Already have an account?"} {" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
        
        <AlertDialog open={isConfirmationAlertOpen} onOpenChange={setIsConfirmationAlertOpen}>
          <AlertDialogContent className="duration-\[1800ms\]">
            <AlertDialogHeader>
              <AlertDialogTitle>Email Not Confirmed</AlertDialogTitle>
              <AlertDialogDescription>
                Your email address has not been confirmed yet. Please check your inbox for the confirmation email or click below to resend the confirmation email.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResendConfirmation}>
                Resend Confirmation Email
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default LoginPage;
