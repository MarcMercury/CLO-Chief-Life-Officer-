import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { Platform } from 'react-native';

// Get environment variables with fallback error messages
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Log for debugging in development
if (__DEV__) {
  console.log('[Supabase] URL configured:', !!supabaseUrl);
  console.log('[Supabase] Anon key configured:', !!supabaseAnonKey);
}

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('EXPO_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  
  console.error(`[Supabase] Missing environment variables: ${missing.join(', ')}`);
  console.error('[Supabase] Make sure EAS secrets are configured for production builds.');
  console.error('[Supabase] Run: eas env:list --environment production');
  
  throw new Error(`Missing Supabase environment variables: ${missing.join(', ')}. Configure via EAS env or .env file.`);
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Enable URL session detection on web for OAuth callbacks
    detectSessionInUrl: Platform.OS === 'web',
  },
});
