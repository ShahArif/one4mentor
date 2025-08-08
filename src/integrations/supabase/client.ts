import { createClient } from '@supabase/supabase-js';

// Public Supabase credentials (safe to expose in frontend)
export const SUPABASE_URL = 'https://yheezocifuiihvrvzdvo.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloZWV6b2NpZnVpaWh2cnZ6ZHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzE5NDgsImV4cCI6MjA2ODM0Nzk0OH0.qHHejZmFQjZZKjcwkTqSs8_FOFBRxpjcw5y8BJWMlWY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type { Session, User } from '@supabase/supabase-js';
