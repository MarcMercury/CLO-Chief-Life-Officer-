/**
 * VibeCheck Component
 * 
 * Russell's Circumplex Model of Emotion
 * 2-axis grid: Energy (Y) vs Pleasure (X)
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { getEmotionFromCoordinates, EMOTION_LABELS } from '@/services/selfService';

interface VibeCheckProps {
  onSubmit: (energy: number, pleasure: number, label: string) => void;
  initialEnergy?: number;
  initialPleasure?: number;
}

// Grid quadrants with their characteristics
const QUADRANTS = [
  { energy: 2, pleasure: 2, emoji: '🤩', label: 'High Energy\nPositive', color: '#10B981' },
  { energy: 2, pleasure: -2, emoji: '😰', label: 'High Energy\nNegative', color: '#EF4444' },
  { energy: -2, pleasure: 2, emoji: '😌', label: 'Low Energy\nPositive', color: '#3B82F6' },
  { energy: -2, pleasure: -2, emoji: '😔', label: 'Low Energy\nNegative', color: '#6B7280' },
];

// Emotion label options based on quadrant
const EMOTION_OPTIONS: Record<string, string[]> = {
  'high_positive': ['Excited', 'Elated', 'Happy', 'Thrilled', 'Energized'],
  'high_negative': ['Anxious', 'Stressed', 'Angry', 'Frustrated', 'Overwhelmed'],
  'low_positive': ['Calm', 'Relaxed', 'Content', 'Peaceful', 'Satisfied'],
  'low_negative': ['Sad', 'Tired', 'Bored', 'Depressed', 'Lonely'],
};

export function VibeCheck({ onSubmit, initialEnergy, initialPleasure }: VibeCheckProps) {
  const [step, setStep] = useState<'grid' | 'label'>('grid');
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(initialEnergy ?? null);
  const [selectedPleasure, setSelectedPleasure] = useState<number | null>(initialPleasure ?? null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const handleQuadrantSelect = useCallback((energy: number, pleasure: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEnergy(energy);
    setSelectedPleasure(pleasure);
    setStep('label');
  }, []);

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
      setSelectedEnergy(null);
      setSelectedPleasure(null);
      setSelectedLabel(null);
    }
  }, [selectedEnergy, selectedPleasure, selectedLabel, onSubmit]);

  const getQuadrantKey = (): string => {
    if (selectedEnergy === null || selectedPleasure === null) return 'high_positive';
    const energyKey = selectedEnergy > 0 ? 'high' : 'low';
    const pleasureKey = selectedPleasure > 0 ? 'positive' : 'negative';
    return `${energyKey}_${pleasureKey}`;
  };

  const labelOptions = EMOTION_OPTIONS[getQuadrantKey()] || EMOTION_OPTIONS['high_positive'];

  if (step === 'label') {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
        <Text style={styles.stepTitle}>How would you describe it?</Text>
        <Text style={styles.stepSubtitle}>
          {getEmotionFromCoordinates(selectedEnergy!, selectedPleasure!)} vibes detected
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
      <Text style={styles.stepSubtitle}>Tap the quadrant that fits best</Text>

      {/* 2x2 Grid */}
      <View style={styles.gridContainer}>
        {/* Y-axis label */}
        <View style={styles.yAxisLabel}>
          <Text style={styles.axisText}>HIGH</Text>
          <Text style={styles.axisText}>ENERGY</Text>
          <Text style={styles.axisText}>LOW</Text>
        </View>

        <View style={styles.grid}>
          {/* Top row */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.quadrant, { backgroundColor: `${QUADRANTS[0].color}20` }]}
              onPress={() => handleQuadrantSelect(2, 2)}
            >
              <Text style={styles.quadrantEmoji}>{QUADRANTS[0].emoji}</Text>
              <Text style={[styles.quadrantLabel, { color: QUADRANTS[0].color }]}>
                {QUADRANTS[0].label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quadrant, { backgroundColor: `${QUADRANTS[1].color}20` }]}
              onPress={() => handleQuadrantSelect(2, -2)}
            >
              <Text style={styles.quadrantEmoji}>{QUADRANTS[1].emoji}</Text>
              <Text style={[styles.quadrantLabel, { color: QUADRANTS[1].color }]}>
                {QUADRANTS[1].label}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom row */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[styles.quadrant, { backgroundColor: `${QUADRANTS[2].color}20` }]}
              onPress={() => handleQuadrantSelect(-2, 2)}
            >
              <Text style={styles.quadrantEmoji}>{QUADRANTS[2].emoji}</Text>
              <Text style={[styles.quadrantLabel, { color: QUADRANTS[2].color }]}>
                {QUADRANTS[2].label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quadrant, { backgroundColor: `${QUADRANTS[3].color}20` }]}
              onPress={() => handleQuadrantSelect(-2, -2)}
            >
              <Text style={styles.quadrantEmoji}>{QUADRANTS[3].emoji}</Text>
              <Text style={[styles.quadrantLabel, { color: QUADRANTS[3].color }]}>
                {QUADRANTS[3].label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* X-axis label */}
      <View style={styles.xAxisLabel}>
        <Text style={styles.axisText}>POSITIVE ←</Text>
        <Text style={styles.axisText}>MOOD</Text>
        <Text style={styles.axisText}>→ NEGATIVE</Text>
      </View>
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
    marginBottom: spacing.lg,
  },
  gridContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yAxisLabel: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 160,
    paddingVertical: spacing.sm,
  },
  axisText: {
    fontSize: 9,
    color: colors.textTertiary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  grid: {
    flex: 1,
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
  },
  quadrant: {
    flex: 1,
    height: 80,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  quadrantEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  quadrantLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },
  xAxisLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: spacing.sm,
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
