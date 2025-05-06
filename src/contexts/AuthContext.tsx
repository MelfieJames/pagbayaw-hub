import { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session | null;
  user: Session['user'] | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });
  }, []);

  const signIn = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
           emailRedirectTo: `${window.location.origin}/profile`,
        }
      });
      if (error) throw error;
      alert('Check your email for the login link!');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });
  }, [navigate]);

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
