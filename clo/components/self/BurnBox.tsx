/**
 * BurnBox Component
 * 
 * Write something negative, then "burn" it away.
 * Features fire animation on destruction.
 */

import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface BurnBoxProps {
  onBurn?: () => void;
}

export function BurnBox({ onBurn }: BurnBoxProps) {
  const [text, setText] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const fireHeight = useSharedValue(0);

  const resetState = useCallback(() => {
    setText('');
    setIsBurning(false);
    setShowSuccess(true);
    
    // Hide success message after delay
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  }, []);

  const handleBurn = useCallback(() => {
    if (!text.trim() || isBurning) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsBurning(true);
    
    // Animate fire rising
    fireHeight.value = withTiming(100, { duration: 800, easing: Easing.out(Easing.exp) });
    
    // Animate paper burning
    scale.value = withSequence(
      withSpring(1.02),
      withTiming(0.8, { duration: 600 }),
      withTiming(0, { duration: 400 })
    );
    
    opacity.value = withTiming(0, { duration: 1000 }, () => {
      // Reset values
      scale.value = 1;
      opacity.value = 1;
      fireHeight.value = 0;
      runOnJS(resetState)();
      runOnJS(onBurn || (() => {}))();
    });
  }, [text, isBurning, scale, opacity, fireHeight, resetState, onBurn]);

  const paperStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const fireStyle = useAnimatedStyle(() => ({
    height: `${fireHeight.value}%`,
  }));

  if (showSuccess) {
    return (
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={styles.successContainer}
      >
        <Text style={styles.successEmoji}>🔥</Text>
        <Text style={styles.successText}>Released & gone forever</Text>
        <Text style={styles.successSubtext}>Take a deep breath</Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What do you need to let go of?</Text>
      <Text style={styles.subtitle}>Write it down, then burn it away</Text>

      <View style={styles.burnArea}>
        {/* Fire effect at bottom */}
        <Animated.View style={[styles.fireContainer, fireStyle]}>
          <Text style={styles.fireEmoji}>🔥🔥🔥🔥🔥</Text>
        </Animated.View>

        {/* Paper/Text input */}
        <Animated.View style={[styles.paper, paperStyle]}>
          <TextInput
            style={styles.input}
            placeholder="Type what's bothering you..."
            placeholderTextColor={colors.textTertiary}
            multiline
            value={text}
            onChangeText={setText}
            editable={!isBurning}
          />
        </Animated.View>
      </View>

      <TouchableOpacity
        style={[
          styles.burnButton,
          (!text.trim() || isBurning) && styles.burnButtonDisabled,
        ]}
        onPress={handleBurn}
        disabled={!text.trim() || isBurning}
      >
        <Text style={styles.burnButtonEmoji}>🔥</Text>
        <Text style={styles.burnButtonText}>
          {isBurning ? 'Burning...' : 'Burn It'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        This is permanently deleted and never stored
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  burnArea: {
    position: 'relative',
    height: 120,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderRadius: borderRadius.md,
  },
  fireContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEF3C7',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  fireEmoji: {
    fontSize: 20,
  },
  paper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  burnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#EF4444',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  burnButtonDisabled: {
    opacity: 0.5,
  },
  burnButtonEmoji: {
    fontSize: 18,
  },
  burnButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  successSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
