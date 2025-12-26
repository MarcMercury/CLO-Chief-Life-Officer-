import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, SplashScreen } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import LoginScreen from '@/components/auth/LoginScreen';
import LockScreen from '@/components/auth/LockScreen';

export default function Index() {
  const { user, loading, isLocked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
      
      if (user && !isLocked) {
        router.replace('/(main)');
      }
    }
  }, [user, loading, isLocked]);

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
