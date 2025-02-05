
import { supabase } from "@/services/supabase/client";

export const handleAdminAuth = async (email: string, password: string) => {
  console.log('Attempting admin login...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Auth error:', error);
      throw error;
    }

    console.log('Login successful:', data);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Login failed:', error);
    return { user: null, error };
  }
};

export const handleUserAuth = async (
  isLogin: boolean,
  email: string,
  password: string
) => {
  console.log(`Attempting ${isLogin ? 'login' : 'signup'}...`);

  try {
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { user: data.user, error };
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { user: data.user, error };
    }
  } catch (error) {
    console.error('Auth operation failed:', error);
    return { user: null, error };
  }
};
