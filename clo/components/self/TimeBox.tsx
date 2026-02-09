/**
 * TimeBox Component
 * 
 * ⏱️ TIME BOX - Timed productivity sessions
 * Type what you're working on, set the time, and focus.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';

const TIME_PRESETS = [
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
  { label: '90m', minutes: 90 },
];

interface TimeBoxProps {
  onComplete?: () => void;
}

export function TimeBox({ onComplete }: TimeBoxProps) {
  const [taskName, setTaskName] = useState('');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const justCompletedRef = useRef(false);
  
  const scale = useSharedValue(1);

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

  const handleTimeSelect = (minutes: number) => {
    Haptics.selectionAsync();
    setSelectedMinutes(minutes);
    setTimeRemaining(minutes * 60);
  };

  const handleStart = useCallback(() => {
    if (!taskName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    
    setHasStarted(true);
    setIsRunning(true);
  }, [taskName, scale]);

  const handlePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(false);
  }, []);

  const handleResume = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning(true);
  }, []);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeRemaining(selectedMinutes * 60);
    setIsRunning(false);
    setIsComplete(false);
    setHasStarted(false);
    setTaskName('');
  }, [selectedMinutes]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progress = hasStarted 
    ? ((selectedMinutes * 60 - timeRemaining) / (selectedMinutes * 60)) * 100
    : 0;

  // Setup screen
  if (!hasStarted) {
    return (
      <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
        <Text style={styles.title}>⏱️ Time Box</Text>
        <Text style={styles.subtitle}>What are you working on?</Text>
        
        <TextInput
          style={styles.taskInput}
          placeholder="e.g., Finish report, Study chapter 5..."
          placeholderTextColor={colors.textTertiary}
          value={taskName}
          onChangeText={setTaskName}
          multiline={false}
          autoFocus
        />
        
        <Text style={styles.timeLabel}>Set your time:</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.timePresets}
        >
          {TIME_PRESETS.map(preset => (
            <TouchableOpacity
              key={preset.minutes}
              style={[
                styles.timePreset,
                selectedMinutes === preset.minutes && styles.timePresetActive,
              ]}
              onPress={() => handleTimeSelect(preset.minutes)}
            >
              <Text style={[
                styles.timePresetText,
                selectedMinutes === preset.minutes && styles.timePresetTextActive,
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={[styles.startButton, !taskName.trim() && styles.startButtonDisabled]}
          onPress={handleStart}
        >
          <Text style={styles.startButtonText}>Start Time Box</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Timer screen
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.container}>
      <Text style={styles.taskActive} numberOfLines={2}>
        {taskName}
      </Text>
      
      <Animated.View style={[styles.timerCircle, animatedStyle]}>
        <TouchableOpacity 
          style={styles.timerTouchable}
          onPress={isComplete ? handleReset : (isRunning ? handlePause : handleResume)}
          activeOpacity={0.8}
        >
          {/* Progress bar */}
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
            {isComplete ? '🎉 Time Box Complete!' : isRunning ? 'Tap to pause' : 'Tap to resume'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.controls}>
        {isComplete ? (
          <TouchableOpacity 
            style={styles.newBoxButton}
            onPress={handleReset}
          >
            <Text style={styles.newBoxButtonText}>New Time Box</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.controlBtn}
              onPress={isRunning ? handlePause : handleResume}
            >
              <Text style={styles.controlIcon}>
                {isRunning ? '⏸️' : '▶️'}
              </Text>
              <Text style={styles.controlLabel}>
                {isRunning ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlBtn}
              onPress={handleReset}
            >
              <Text style={styles.controlIcon}>⏹️</Text>
              <Text style={styles.controlLabel}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  taskInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  timePresets: {
    marginBottom: spacing.lg,
  },
  timePreset: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  timePresetActive: {
    backgroundColor: `${colors.self}30`,
    borderWidth: 1,
    borderColor: colors.self,
  },
  timePresetText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timePresetTextActive: {
    color: colors.self,
  },
  startButton: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  taskActive: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  timerCircle: {
    marginBottom: spacing.lg,
  },
  timerTouchable: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
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
    fontSize: 48,
    fontWeight: '300',
    color: colors.self,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  controlBtn: {
    alignItems: 'center',
    padding: spacing.md,
  },
  controlIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  controlLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  newBoxButton: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  newBoxButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
