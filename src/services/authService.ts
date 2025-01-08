import { supabase } from "@/integrations/supabase/client";

export const handleAdminAuth = async (email: string, password: string) => {
  // Try to sign in first for admin
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!signInError && signInData.user) {
    return { user: signInData.user, error: null };
  }

  // If sign in fails and password is correct, try to sign up
  if (password === "admin123!@#") {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    return { user: signUpData.user, error: signUpError };
  }

  return { user: null, error: new Error("Invalid admin credentials") };
};

export const handleUserAuth = async (
  isLogin: boolean,
  email: string,
  password: string
) => {
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
};