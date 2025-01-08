import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ErrorModal from "@/components/ErrorModal";
import { supabase } from "@/integrations/supabase/client";
import LoginForm from "@/components/auth/LoginForm";
import { handleAdminAuth, handleUserAuth } from "@/services/authService";
import { getAuthErrorMessage } from "@/utils/authErrors";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalContent, setErrorModalContent] = useState({
    title: "",
    message: "",
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
        const { user, error } = await handleAdminAuth(email, password);
        
        if (error) {
          const errorInfo = getAuthErrorMessage(error);
          showError(errorInfo.title, errorInfo.message);
          return;
        }

        if (user) {
          navigate("/admin");
        }
        return;
      }
      
      const { user, error } = await handleUserAuth(isLogin, email, password);
      
      if (error) {
        const errorInfo = getAuthErrorMessage(error);
        showError(errorInfo.title, errorInfo.message);
        return;
      }

      if (user) {
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
    </div>
  );
};

export default Login;