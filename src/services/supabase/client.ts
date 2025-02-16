
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

export const supabase = createClient<Database>(
  'https://msvlqapipscspxukbhyb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdmxxYXBpcHNjc3B4dWtiaHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MDMwODUsImV4cCI6MjAzMTQ3OTA4NX0.eKyOtoSdb5AZt1H_QLMOkQ6XGjzvgKTGRVIQtNW9PxM',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
)
