
import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

export const supabase = createClient<Database>(
  'https://msvlqapipscspxukbhyb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdmxxYXBpcHNjc3B4dWtiaHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MDMwODUsImV4cCI6MjA1MTQ3OTA4NX0.-n2HKDfTo-57F8vY0f03-2KUUzxegVYsZ6qOn5RSIe4',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    db: {
      schema: 'public'
    }
  }
)
