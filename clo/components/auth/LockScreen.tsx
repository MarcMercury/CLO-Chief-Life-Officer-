import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '@/providers/AuthProvider';
import { Text, Heading, Subheading } from '@/components/ui';
import { colors, borderRadius, spacing } from '@/constants/theme';
import haptics from '@/lib/haptics';

export default function LockScreen() {
  const { unlockApp } = useAuth();
  
  // Breathing animation for the lock icon
  const breatheScale = useSharedValue(1);
  const breatheOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Automatically trigger biometric auth when lock screen appears
    handleUnlock();
    
    // Start breathing animation
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    breatheOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
    opacity: breatheOpacity.value,
  }));

  const handleUnlock = async () => {
    haptics.tapHeavy();
    const success = await unlockApp();
    if (success) {
      haptics.success();
    } else {
      haptics.error();
    }
  };

  return (
    <BlurView intensity={80} style={styles.container}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
        <Animated.View style={[styles.iconContainer, iconStyle]}>
          <Text style={styles.icon}>🔐</Text>
        </Animated.View>
        
        <Heading size="2xl" center style={styles.title}>
          Sanctuary Locked
        </Heading>
        <Subheading center style={styles.subtitle}>
          Authenticate to continue
        </Subheading>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleUnlock}
          activeOpacity={0.8}
        >
          <Text weight="medium" style={styles.buttonText}>Unlock</Text>
        </TouchableOpacity>
      </Animated.View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  iconContainer: {
    marginBottom: spacing['2xl'],
  },
  icon: {
    fontSize: 64,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing['4xl'],
  },
  button: {
    backgroundColor: colors.self,
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});
