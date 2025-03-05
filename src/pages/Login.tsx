
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ErrorModal from "@/components/ErrorModal";
import { supabase } from "@/services/supabase/client";
import LoginForm from "@/components/auth/LoginForm";
import { handleAdminAuth, handleUserAuth } from "@/services/authService";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { resendConfirmationEmail } = useAuth();

  const redirectPath = location.state?.redirectAfterLogin || "/";
  const message = location.state?.message || null;

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmationAlertOpen, setIsConfirmationAlertOpen] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [errorModalContent, setErrorModalContent] = useState({
    title: "",
    message: "",
  });

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

  const showError = (title: string, message: string) => {
    setErrorModalContent({ title, message });
    setIsErrorModalOpen(true);
  };

  const handleResendConfirmation = async () => {
    const success = await resendConfirmationEmail(confirmationEmail);
    if (success) {
      setIsConfirmationAlertOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { email, password });
    
    try {
      if (email === "admin@unvas.com") {
        const { user, error } = await handleAdminAuth(email, password);
        
        if (error) {
          console.error('Admin auth error:', error);
          const errorInfo = getAuthErrorMessage(error);
          showError(errorInfo.title, errorInfo.message);
          return;
        }

        if (user) {
          uiToast({
            title: "Admin Login Successful",
            description: "Welcome back, Admin!",
          });
          navigate("/admin");
        }
        return;
      }
      
      const { user, error } = await handleUserAuth(isLogin, email, password);
      
      if (error) {
        console.error('User auth error:', error);
        if (error.message?.includes("Email not confirmed")) {
          setConfirmationEmail(email);
          setIsConfirmationAlertOpen(true);
          return;
        }
        
        const errorInfo = getAuthErrorMessage(error);
        showError(errorInfo.title, errorInfo.message);
        return;
      }

      if (user) {
        if (isLogin) {
          uiToast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          navigate(redirectPath);
        } else {
          uiToast({
            title: "Sign Up Successful",
            description: "Please check your email to confirm your account.",
          });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      if (error.message?.includes("Email not confirmed")) {
        setConfirmationEmail(email);
        setIsConfirmationAlertOpen(true);
        return;
      }
      
      const errorInfo = getAuthErrorMessage(error);
      showError(errorInfo.title, errorInfo.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4">
        <LoginForm
          isLogin={isLogin}
          email={email}
          password={password}
          name={name}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onNameChange={setName}
          onSubmit={handleSubmit}
          onToggleMode={() => setIsLogin(!isLogin)}
        />
      </div>

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        title={errorModalContent.title}
        message={errorModalContent.message}
      />

      <AlertDialog open={isConfirmationAlertOpen} onOpenChange={setIsConfirmationAlertOpen}>
        <AlertDialogContent>
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
  );
};

export default Login;
