
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/services/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export interface CustomUser extends User {
  isAdmin: boolean;
  name: string;
}

interface AuthContextType {
  user: CustomUser | null;
  login: (user: CustomUser) => void;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check active session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const email = session.user.email;
          const isAdmin = email === "admin@unvas.com";
          setUser({
            ...session.user,
            isAdmin,
            name: isAdmin ? "Admin" : email?.split('@')[0] || "User"
          });
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email;
        const isAdmin = email === "admin@unvas.com";
        setUser({
          ...session.user,
          isAdmin,
          name: isAdmin ? "Admin" : email?.split('@')[0] || "User"
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (userData: CustomUser) => {
    setUser(userData);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      // Don't automatically redirect after logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const resendConfirmationEmail = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        console.error('Error resending confirmation email:', error);
        toast.error("Failed to resend confirmation email");
        return false;
      }
      
      toast.success("Confirmation email resent. Please check your inbox.");
      return true;
    } catch (error) {
      console.error('Error resending confirmation email:', error);
      toast.error("Failed to resend confirmation email");
      return false;
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, signOut, resendConfirmationEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
