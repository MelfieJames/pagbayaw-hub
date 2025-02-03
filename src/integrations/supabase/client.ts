import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://msvlqapipscspxukbhyb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdmxxYXBpcHNjc3B4dWtiaHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MDMwODUsImV4cCI6MjA1MTQ3OTA4NX0.-n2HKDfTo-57F8vY0f03-2KUUzxegVYsZ6qOn5RSIe4";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    },
  }
);