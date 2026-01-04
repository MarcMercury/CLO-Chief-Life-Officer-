/**
 * VibeCheck Component
 * 
 * Russell's Circumplex Model of Emotion
 * Interactive X/Y Graph: Energy (Y) vs Pleasure (X)
 * 
 * Tap anywhere on the graph to set your emotional state.
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { getEmotionFromCoordinates } from '@/services/selfService';

const GRAPH_SIZE = Dimensions.get('window').width - 80;

interface VibeCheckProps {
  onSubmit: (energy: number, pleasure: number, label: string) => void;
  initialEnergy?: number;
  initialPleasure?: number;
}

// Emotion label options based on quadrant
const EMOTION_OPTIONS: Record<string, string[]> = {
  'high_positive': ['Excited', 'Elated', 'Happy', 'Thrilled', 'Energized'],
  'high_negative': ['Anxious', 'Stressed', 'Angry', 'Frustrated', 'Overwhelmed'],
  'low_positive': ['Calm', 'Relaxed', 'Content', 'Peaceful', 'Satisfied'],
  'low_negative': ['Sad', 'Tired', 'Bored', 'Depressed', 'Lonely'],
};

// Quadrant colors
const QUADRANT_COLORS = {
  'high_positive': '#10B981', // green
  'high_negative': '#EF4444', // red
  'low_positive': '#3B82F6', // blue
  'low_negative': '#6B7280', // gray
};

export function VibeCheck({ onSubmit, initialEnergy, initialPleasure }: VibeCheckProps) {
  const [step, setStep] = useState<'grid' | 'label'>('grid');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(initialEnergy ?? null);
  const [selectedPleasure, setSelectedPleasure] = useState<number | null>(initialPleasure ?? null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const handleGraphTap = useCallback((event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    
    // Convert pixel position to -2 to 2 scale
    // X: left = negative, right = positive (pleasure)
    // Y: top = positive, bottom = negative (energy)
    const pleasure = ((locationX / GRAPH_SIZE) * 4) - 2;
    const energy = 2 - ((locationY / GRAPH_SIZE) * 4);
    
    // Clamp values
    const clampedPleasure = Math.max(-2, Math.min(2, pleasure));
    const clampedEnergy = Math.max(-2, Math.min(2, energy));
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setPosition({ x: locationX, y: locationY });
    setSelectedPleasure(clampedPleasure);
    setSelectedEnergy(clampedEnergy);
  }, []);

  const handleContinue = useCallback(() => {
    if (selectedEnergy !== null && selectedPleasure !== null) {
      Haptics.selectionAsync();
      setStep('label');
    }
  }, [selectedEnergy, selectedPleasure]);

  const handleLabelSelect = useCallback((label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLabel(label);
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedEnergy !== null && selectedPleasure !== null && selectedLabel) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSubmit(selectedEnergy, selectedPleasure, selectedLabel);
      // Reset
      setStep('grid');
      setPosition(null);
      setSelectedEnergy(null);
      setSelectedPleasure(null);
      setSelectedLabel(null);
    }
  }, [selectedEnergy, selectedPleasure, selectedLabel, onSubmit]);

  const getQuadrantKey = (): string => {
    if (selectedEnergy === null || selectedPleasure === null) return 'high_positive';
    const energyKey = selectedEnergy >= 0 ? 'high' : 'low';
    const pleasureKey = selectedPleasure >= 0 ? 'positive' : 'negative';
    return `${energyKey}_${pleasureKey}`;
  };

  const getPointColor = (): string => {
    return QUADRANT_COLORS[getQuadrantKey() as keyof typeof QUADRANT_COLORS] || colors.self;
  };

  const labelOptions = EMOTION_OPTIONS[getQuadrantKey()] || EMOTION_OPTIONS['high_positive'];

  if (step === 'label') {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <Text style={styles.stepTitle}>How would you describe it?</Text>
        <Text style={styles.stepSubtitle}>
          {getEmotionFromCoordinates(selectedEnergy!, selectedPleasure!)} vibes
        </Text>

        <View style={styles.labelsGrid}>
          {labelOptions.map((label, index) => (
            <Animated.View 
              key={label} 
              entering={FadeInUp.delay(index * 50).duration(200)}
            >
              <TouchableOpacity
                style={[
                  styles.labelChip,
                  selectedLabel === label && styles.labelChipSelected,
                ]}
                onPress={() => handleLabelSelect(label)}
              >
                <Text style={[
                  styles.labelText,
                  selectedLabel === label && styles.labelTextSelected,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setStep('grid')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedLabel && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!selectedLabel}
          >
            <Text style={styles.submitButtonText}>Log Mood</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <Text style={styles.stepTitle}>How are you feeling?</Text>
      <Text style={styles.stepSubtitle}>Tap anywhere on the graph</Text>

      <View style={styles.graphContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>High{'\n'}Energy</Text>
          <Text style={[styles.axisValue, styles.axisValueTop]}>+2</Text>
          <Text style={styles.axisValue}>0</Text>
          <Text style={[styles.axisValue, styles.axisValueBottom]}>-2</Text>
          <Text style={styles.axisLabel}>Low{'\n'}Energy</Text>
        </View>

        {/* Graph area */}
        <View 
          style={styles.graph}
          onTouchEnd={handleGraphTap}
        >
          {/* Background quadrant colors */}
          <View style={styles.quadrantRow}>
            <View style={[styles.quadrant, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Text style={styles.quadrantEmoji}>😰</Text>
            </View>
            <View style={[styles.quadrant, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Text style={styles.quadrantEmoji}>🤩</Text>
            </View>
          </View>
          <View style={styles.quadrantRow}>
            <View style={[styles.quadrant, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
              <Text style={styles.quadrantEmoji}>😔</Text>
            </View>
            <View style={[styles.quadrant, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Text style={styles.quadrantEmoji}>😌</Text>
            </View>
          </View>

          {/* Grid lines */}
          <View style={styles.gridLineH} />
          <View style={styles.gridLineV} />

          {/* Selected point */}
          {position && (
            <View 
              style={[
                styles.point,
                { 
                  left: position.x - 15,
                  top: position.y - 15,
                  backgroundColor: getPointColor(),
                }
              ]}
            >
              <View style={styles.pointInner} />
            </View>
          )}
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxis}>
        <Text style={styles.axisLabel}>Negative</Text>
        <View style={styles.xAxisValues}>
          <Text style={styles.axisValue}>-2</Text>
          <Text style={styles.axisValue}>0</Text>
          <Text style={styles.axisValue}>+2</Text>
        </View>
        <Text style={styles.axisLabel}>Positive</Text>
      </View>
      <Text style={styles.xAxisTitle}>← Pleasure →</Text>

      {/* Current selection info */}
      {position && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.selectionInfo}>
          <Text style={[styles.selectionLabel, { color: getPointColor() }]}>
            {getEmotionFromCoordinates(selectedEnergy!, selectedPleasure!)}
          </Text>
          <Text style={styles.selectionValues}>
            Energy: {selectedEnergy?.toFixed(1)} • Pleasure: {selectedPleasure?.toFixed(1)}
          </Text>
        </Animated.View>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          !position && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!position}
      >
        <Text style={styles.continueButtonText}>
          {position ? 'Continue →' : 'Tap the graph to continue'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxis: {
    width: 50,
    height: GRAPH_SIZE,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  axisLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 12,
  },
  axisValue: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  axisValueTop: {
    marginTop: 10,
  },
  axisValueBottom: {
    marginBottom: 10,
  },
  graph: {
    width: GRAPH_SIZE,
    height: GRAPH_SIZE,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  quadrantRow: {
    flexDirection: 'row',
    flex: 1,
  },
  quadrant: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quadrantEmoji: {
    fontSize: 24,
    opacity: 0.3,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: colors.border,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: colors.border,
  },
  point: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pointInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: 50,
  },
  xAxisValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginHorizontal: spacing.md,
  },
  xAxisTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  selectionInfo: {
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  selectionLabel: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectionValues: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  continueButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.self,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.surface,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  labelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  labelChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelChipSelected: {
    backgroundColor: colors.self,
    borderColor: colors.self,
  },
  labelText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  labelTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.self,
    borderRadius: borderRadius.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontWeight: '600',
  },
});
