import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bnyagvqylorlastljrey.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJueWFndnF5bG9ybGFzdGxqcmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4OTAwOTIsImV4cCI6MjA3MTQ2NjA5Mn0.-aVy3ZdkLNytfOo1sqMAiCuAMSdXRIahZzqiDAW3rZk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});