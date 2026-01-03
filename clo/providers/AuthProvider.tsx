import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as LocalAuthentication from 'expo-local-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { AppState, AppStateStatus, Platform } from 'react-native';

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
    // Safety timeout - if session check takes too long, stop loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Session check timeout - forcing loading to complete');
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('[Auth] Error getting session:', error);
        setLoading(false); // Don't block the app on error
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth] State change:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
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
    // Create the redirect URL for the current platform
    const redirectUrl = Platform.OS === 'web' 
      ? `${window.location.origin}/auth/callback`
      : Linking.createURL('auth/callback');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectUrl,
      },
    });
    
    // Create profile if user was created
    if (!error && data?.user) {
      await ensureProfileExists(data.user);
    }
    
    return { error, data };
  };

  const signInWithGoogle = async () => {
    try {
      // Create the redirect URL for the current platform
      const redirectUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : Linking.createURL('auth/callback');
      
      console.log('[Auth] Starting Google OAuth with redirect:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web', // On mobile, we handle the browser ourselves
        },
      });
      
      if (error) {
        console.error('[Auth] OAuth error:', error);
        return { error };
      }
      
      // On mobile, open the OAuth URL in an in-app browser
      if (Platform.OS !== 'web' && data?.url) {
        console.log('[Auth] Opening OAuth URL in browser:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );
        
        console.log('[Auth] Browser result:', result);
        
        if (result.type === 'success' && result.url) {
          // Extract the auth tokens from the callback URL
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1) || url.search.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              console.error('[Auth] Session error:', sessionError);
              return { error: sessionError };
            }
            console.log('[Auth] Session set successfully from OAuth callback');
          }
        } else if (result.type === 'cancel') {
          console.log('[Auth] User cancelled OAuth');
          return { error: null }; // User cancelled, not an error
        }
      }
      
      return { error: null };
    } catch (e) {
      console.error('[Auth] Google sign-in error:', e);
      return { error: { message: 'Failed to sign in with Google' } as AuthError };
    }
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
