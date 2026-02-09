/**
 * FocusTimer Component
 * 
 * A simple 25-minute Pomodoro-style countdown timer.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds

interface FocusTimerProps {
  onComplete?: () => void;
}

export function FocusTimer({ onComplete }: FocusTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const scale = useSharedValue(1);

  const justCompletedRef = useRef(false);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            justCompletedRef.current = true;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Handle completion side-effects outside the state updater
  useEffect(() => {
    if (timeRemaining === 0 && justCompletedRef.current) {
      justCompletedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRunning(false);
      setIsComplete(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete?.();
    }
  }, [timeRemaining, onComplete]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    
    if (isComplete) {
      // Reset timer
      setTimeRemaining(FOCUS_DURATION);
      setIsComplete(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  }, [isRunning, isComplete, scale]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeRemaining(FOCUS_DURATION);
    setIsRunning(false);
    setIsComplete(false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progress = ((FOCUS_DURATION - timeRemaining) / FOCUS_DURATION) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.timerRow}>
        {/* Timer display */}
        <Animated.View style={[styles.timerCircle, animatedStyle]}>
          <TouchableOpacity 
            style={styles.timerTouchable}
            onPress={handleStartPause}
            activeOpacity={0.8}
          >
            {/* Progress arc */}
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>
              {isComplete ? '🎉 Done!' : isRunning ? 'Tap to pause' : 'Tap to start'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlBtn, isRunning && styles.controlBtnActive]}
            onPress={handleStartPause}
          >
            <Text style={styles.controlIcon}>
              {isComplete ? '🔄' : isRunning ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlBtn}
            onPress={handleReset}
          >
            <Text style={styles.controlIcon}>⏹️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.infoText}>
        🍅 25-minute focus session
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerCircle: {
    flex: 1,
  },
  timerTouchable: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: colors.surface,
  },
  progressFill: {
    height: '100%',
    backgroundColor: `${colors.self}20`,
  },
  timerText: {
    fontSize: 36,
    fontWeight: '300',
    color: colors.self,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginLeft: spacing.md,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: `${colors.self}30`,
  },
  controlIcon: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
