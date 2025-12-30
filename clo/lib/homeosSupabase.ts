/**
 * HomeOS Supabase Client
 * 
 * Re-exports the main Supabase client for HomeOS/Home features.
 * All home management data is stored in the main CLO Supabase project.
 */

import { supabase } from './supabase';

// Re-export main supabase client as homeosSupabase for backward compatibility
export const homeosSupabase = supabase;

// No-op for backward compatibility - auth is already managed by main client
export const setHomeosAuthToken = async (_accessToken: string) => {
  // Auth is managed by the main supabase client, no action needed
};
