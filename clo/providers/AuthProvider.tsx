import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as LocalAuthentication from 'expo-local-authentication';
import { AppState, AppStateStatus } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLocked: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  unlockApp: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCK_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Biometric lock when app goes to background
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check if app was backgrounded for too long
        const timeInBackground = Date.now() - lastActiveTime;
        if (timeInBackground > LOCK_TIMEOUT_MS && user) {
          setIsLocked(true);
        }
        setLastActiveTime(Date.now());
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        setLastActiveTime(Date.now());
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [user, lastActiveTime]);

  // Ensure profile exists when user changes
  useEffect(() => {
    if (user) {
      ensureProfileExists(user);
    }
  }, [user]);

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Ensure profile exists on sign in
    if (!error && data?.user) {
      await ensureProfileExists(data.user);
    }
    
    return { error };
  };

  // Ensure profile exists for authenticated user
  const ensureProfileExists = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle to avoid error if not found

      if (existingProfile) return; // Profile already exists

      // Create profile from user metadata (only use columns that exist in table)
      const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fullName,
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Failed to create profile:', error);
      } else {
        console.log('Profile created successfully for user:', user.id);
      }
    } catch (e) {
      console.error('Error ensuring profile exists:', e);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback`
          : 'clo://auth/callback',
      },
    });
    
    // Create profile if user was created
    if (!error && data?.user) {
      await ensureProfileExists(data.user);
    }
    
    return { error, data };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' 
          ? window.location.origin
          : 'clo://auth/callback',
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsLocked(false);
  };

  const unlockApp = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // If biometrics not available, unlock immediately
        setIsLocked(false);
        return true;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock your Sanctuary',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      // Fail gracefully - unlock the app
      setIsLocked(false);
      return true;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isLocked,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    unlockApp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
