import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// HomeOS uses a separate Supabase project for home management data
const supabaseUrl =
  Constants.expoConfig?.extra?.homeosSupabaseUrl ||
  process.env.EXPO_PUBLIC_HOMEOS_SUPABASE_URL ||
  "";

const supabaseAnonKey =
  Constants.expoConfig?.extra?.homeosSupabaseAnonKey ||
  process.env.EXPO_PUBLIC_HOMEOS_SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "HomeOS Supabase credentials not configured. Home features will not work."
  );
}

export const homeosSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // HomeOS shares auth with main Supabase project
    // We'll pass the auth token from the main client
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper to set auth token from main Supabase session
export const setHomeosAuthToken = async (accessToken: string) => {
  await homeosSupabase.auth.setSession({
    access_token: accessToken,
    refresh_token: "", // Not needed since we manage auth in main project
  });
};
