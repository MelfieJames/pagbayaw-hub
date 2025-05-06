
import { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase/client';
import { useNavigate } from 'react-router-dom';

// Extended user type with isAdmin property
export interface CustomUser extends Session['user'] {
  isAdmin?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: CustomUser | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<boolean>;
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
  const [user, setUser] = useState<CustomUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setSession(session);
      if (session?.user) {
        // Check if user is admin
        const { data } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        // Set the extended user with isAdmin property
        const extendedUser: CustomUser = {
          ...session.user,
          isAdmin: !!data
        };
        
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (session?.user) {
        // Check if user is admin
        const { data } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        // Set the extended user with isAdmin property
        const extendedUser: CustomUser = {
          ...session.user,
          isAdmin: !!data
        };
        
        setUser(extendedUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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
      // Clear user and session on signout
      setUser(null);
      setSession(null);
      // Navigate to login page
      navigate('/login');
    } catch (error: any) {
      alert(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add the resendConfirmationEmail function
  const resendConfirmationEmail = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        console.error('Error resending confirmation email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error resending confirmation:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    signIn,
    signOut,
    resendConfirmationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
