
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://msvlqapipscspxukbhyb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdmxxYXBpcHNjc3B4dWtiaHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MDMwODUsImV4cCI6MjA1MTQ3OTA4NX0.-n2HKDfTo-57F8vY0f03-2KUUzxegVYsZ6qOn5RSIe4";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
