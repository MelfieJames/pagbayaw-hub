
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/services/supabase/client";
import { User } from "@supabase/supabase-js";

export interface CustomUser extends User {
  isAdmin: boolean;
  name: string;
}

interface AuthContextType {
  user: CustomUser | null;
  login: (user: CustomUser) => void;
  signOut: () => Promise<void>;
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
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, signOut }}>
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
