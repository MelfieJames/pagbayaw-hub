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
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react"; // Using lucide icons
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
      <div className="flex min-h-screen w-full overflow-hidden pt-16 bg-gray-50">
        {/* Left panel - decorative */}
        <div className="hidden lg:flex w-1/2 bg-cover bg-center relative" style={{ backgroundImage: 'url("/lovable-uploads/unvaspic4.jpg")' }}>
          <div className="bg-black opacity-40 absolute inset-0"></div>
          <div className="absolute bottom-12 left-6 right-6 text-center text-white px-6 py-12 z-10">
            <h2 className="text-3xl font-semibold mb-4">Your trusted partner in eco-friendly products</h2>
            <p className="text-white/80 text-lg">Discover sustainable solutions that respect our environment while enhancing your daily life.</p>
          </div>
        </div>

        {/* Right panel - form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-semibold text-gray-800">UNVAS®</h1>
              <p className="text-gray-500">Welcome to UNVAS®</p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Remove Full Name field */}
                {/* Confirm Password field for sign up */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10"
                    />
                    <Mail className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-10"
                    />
                    <Lock className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
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
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full pl-10"
                      />
                      <Lock className="absolute left-3 top-3 text-gray-500 h-4 w-4" />
                    </div>
                  </div>
                )}

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

              <Button type="submit" className="w-full bg-[#A8D0B9] hover:bg-[#97C0A9] text-white">
                {isLogin ? "Sign in" : "Sign up"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500">
              {isLogin ? "New to UNVAS®?" : "Already have an account?"} {" "}
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
