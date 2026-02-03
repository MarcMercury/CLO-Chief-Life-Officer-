import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/providers/ThemeProvider';

/**
 * Auth Callback Route
 * 
 * Handles OAuth redirects and email confirmation links.
 * This route processes the auth tokens from the URL and redirects to the app.
 */
export default function AuthCallback() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // For web, the auth tokens are in the URL hash/query params
        if (typeof window !== 'undefined') {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const queryParams = new URLSearchParams(window.location.search);
          
          const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');
          const error = hashParams.get('error') || queryParams.get('error');
          const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
          
          if (error) {
            console.error('Auth error:', error, errorDescription);
            // Redirect to login with error
            router.replace('/');
            return;
          }

          if (accessToken && refreshToken) {
            // Set the session from the tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
            }
          }
        }

        // Small delay to ensure session is set, then redirect to main app
        setTimeout(() => {
          router.replace('/');
        }, 500);
      } catch (err) {
        console.error('Auth callback error:', err);
        router.replace('/');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.self} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  text: {
    fontSize: 16,
  },
});
