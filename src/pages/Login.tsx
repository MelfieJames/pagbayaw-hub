
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
import { Mail, Lock, Eye, EyeOff, X, ChevronRight } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resendConfirmationEmail } = useAuth();

  const redirectPath = location.state?.redirectAfterLogin || "/";
  const message = location.state?.message || null;

  const [isConfirmationAlertOpen, setIsConfirmationAlertOpen] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

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
      <div className="flex min-h-screen w-full overflow-hidden pt-24 relative bg-green-50">
        {/* Floating Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="bubble-heartbeat absolute rounded-full bg-gradient-to-br from-white/60 to-green-200/40 backdrop-blur-sm border border-white/30"
              style={{
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Left panel - decorative */}
        <div className="hidden lg:flex w-1/2 relative animate-fade-in-up items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
          <div className="text-center text-green-800 px-6 py-12 z-10 max-w-md">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
              Your trusted partner in eco-friendly products
            </h2>
            <p className="text-green-600 text-lg leading-relaxed">
              Discover sustainable solutions that respect our environment while enhancing your daily life.
            </p>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative z-10">
          <div className="w-full max-w-md space-y-8 animate-fade-in-up animation-delay-2000">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img 
                  src="/lovable-uploads/unvas-logo.jpg" 
                  alt="UNVAS Logo" 
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-green-500/20"
                />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  UNVAS®
                </h1>
              </div>
              <p className="text-gray-600 text-lg">Welcome to the future of sustainable living</p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-700 px-6 py-4 rounded-2xl mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-red-500 rounded-full">
                    <X className="h-4 w-4 text-white" />
                  </div>
                  {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2 animate-fade-in-up animation-delay-3000">
                  <Label htmlFor="email" className="text-green-700 font-semibold">Email Address</Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 group-hover:border-green-300"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 animate-fade-in-up animation-delay-4000">
                  <Label htmlFor="password" className="text-green-700 font-semibold">Password</Label>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-12 py-4 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 group-hover:border-green-300"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition-all duration-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2 animate-fade-in-up animation-delay-5000">
                    <Label htmlFor="confirmPassword" className="text-green-700 font-semibold">Confirm Password</Label>
                    <div className="relative group">
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 group-hover:border-green-300"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center space-x-3 animate-fade-in-up animation-delay-5000">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="rounded-lg data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    />
                    <Label htmlFor="remember" className="text-green-700 font-medium cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-105 hover:shadow-green-500/25 animate-fade-in-up animation-delay-6000"
              >
                <span className="flex items-center justify-center gap-3">
                  {isLogin ? "Sign in" : "Sign up"}
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </form>

            <p className="text-center text-gray-600 animate-fade-in-up animation-delay-7000">
              {isLogin ? "New to UNVAS®?" : "Already have an account?"} {" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-all duration-300"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <AlertDialog open={isConfirmationAlertOpen} onOpenChange={setIsConfirmationAlertOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl text-center">Email Verification Required</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                <div className="flex justify-center my-4">
                  <Mail className="h-16 w-16 text-primary" />
                </div>
                <p className="mb-2">Your email address <strong>{confirmationEmail}</strong> has not been verified yet.</p>
                <p>Please check your inbox for the verification email. If you can't find it, you can request a new one.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col space-y-2">
              <AlertDialogAction 
                onClick={handleResendConfirmation}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Resend Verification Email
              </AlertDialogAction>
              <AlertDialogCancel className="w-full mt-2">Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default LoginPage;
