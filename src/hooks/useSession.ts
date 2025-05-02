// src/hooks/useSession.ts

import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase/client";
import { Session } from "@supabase/supabase-js";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        setSession(data.session);
      }
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
