import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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
import { borderRadius, spacing } from '@/constants/theme';
import haptics from '@/lib/haptics';

// Brand colors
const COLORS = {
  navy: '#3D4A5C',
  terracotta: '#C17A5E', 
  sage: '#8B9A7D',
  cream: '#F5F5F0',
};

// CLO Logo component for lock screen
function CLOLogo({ size = 100 }: { size?: number }) {
  const circleRadius = size * 0.28;
  const centerX = size / 2;
  const centerY = size / 2;
  const offset = size * 0.18;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4A5568" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#2D3748" stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id="terracottaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#C17A5E" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#D4927A" stopOpacity="0.85" />
        </LinearGradient>
        <LinearGradient id="sageGrad" x1="100%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#7A8B6F" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#9BAA8E" stopOpacity="0.85" />
        </LinearGradient>
      </Defs>
      <Circle cx={centerX} cy={centerY - offset} r={circleRadius} fill="url(#navyGrad)" />
      <Circle cx={centerX - offset * 0.9} cy={centerY + offset * 0.6} r={circleRadius} fill="url(#terracottaGrad)" />
      <Circle cx={centerX + offset * 0.9} cy={centerY + offset * 0.6} r={circleRadius} fill="url(#sageGrad)" />
    </Svg>
  );
}

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
          <CLOLogo size={100} />
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
    backgroundColor: 'rgba(245, 245, 240, 0.98)',
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
    color: COLORS.navy,
  },
  subtitle: {
    marginBottom: spacing['4xl'],
    color: COLORS.sage,
  },
  button: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: spacing['4xl'],
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.cream,
    fontSize: 16,
  },
});
