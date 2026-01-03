import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, SplashScreen } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import LoginScreen from '@/components/auth/LoginScreen';
import LockScreen from '@/components/auth/LockScreen';

export default function Index() {
  const { user, loading, isLocked } = useAuth();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
      
      if (user && !isLocked && !isNavigating) {
        setIsNavigating(true);
        // Use setTimeout to ensure state updates are complete
        setTimeout(() => {
          router.replace('/(main)');
        }, 100);
      }
    }
  }, [user, loading, isLocked, isNavigating]);

  // Reset navigation state if user becomes null (logged out)
  useEffect(() => {
    if (!user) {
      setIsNavigating(false);
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (isLocked) {
    return <LockScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  // User exists but navigating to main - show brief loading
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
