/**
 * VibeCheck Component
 * 
 * Russell's Circumplex Model of Emotion
 * Interactive X/Y Graph: Energy (Y) vs Pleasure (X)
 * 
 * Tap anywhere on the graph to set your emotional state.
 * Enhanced with 32+ emotions and precise touch tracking.
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  PanResponder,
  LayoutChangeEvent,
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

// Expanded emotion label options based on quadrant and intensity
// Each quadrant now has 8-10 emotions for much more nuance
const EMOTION_OPTIONS: Record<string, string[]> = {
  // High Energy + Positive Pleasure
  'high_positive': [
    'Ecstatic', 'Thrilled', 'Excited', 'Elated', 'Euphoric',
    'Joyful', 'Energized', 'Enthusiastic', 'Pumped', 'Alive',
    'Vibrant', 'Radiant', 'Blissful', 'Exhilarated'
  ],
  // High Energy + Negative Pleasure  
  'high_negative': [
    'Anxious', 'Stressed', 'Angry', 'Frustrated', 'Overwhelmed',
    'Panicked', 'Furious', 'Agitated', 'Irritated', 'Tense',
    'Worried', 'Restless', 'Fearful', 'Frazzled'
  ],
  // Low Energy + Positive Pleasure
  'low_positive': [
    'Calm', 'Relaxed', 'Content', 'Peaceful', 'Satisfied',
    'Serene', 'Tranquil', 'Cozy', 'Mellow', 'Grateful',
    'At Ease', 'Comfortable', 'Soothed', 'Blissed Out'
  ],
  // Low Energy + Negative Pleasure
  'low_negative': [
    'Sad', 'Tired', 'Bored', 'Depressed', 'Lonely',
    'Drained', 'Exhausted', 'Melancholic', 'Hopeless', 'Numb',
    'Disconnected', 'Apathetic', 'Down', 'Gloomy'
  ],
  // Near center - Neutral/Mixed emotions
  'neutral': [
    'Neutral', 'Okay', 'Fine', 'Meh', 'So-so',
    'Indifferent', 'Balanced', 'Stable'
  ]
};

// Gradient colors for more precise positioning
const QUADRANT_COLORS = {
  'high_positive': '#10B981', // green - excited
  'high_negative': '#EF4444', // red - stressed
  'low_positive': '#3B82F6', // blue - calm
  'low_negative': '#6B7280', // gray - sad
  'neutral': '#A855F7', // purple - neutral
};

export function VibeCheck({ onSubmit, initialEnergy, initialPleasure }: VibeCheckProps) {
  const [step, setStep] = useState<'grid' | 'label'>('grid');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(initialEnergy ?? null);
  const [selectedPleasure, setSelectedPleasure] = useState<number | null>(initialPleasure ?? null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const graphRef = useRef<View>(null);
  const graphLayoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // Handle layout to get accurate graph position
  const handleGraphLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    graphLayoutRef.current = { x: 0, y: 0, width, height };
  }, []);

  // Convert touch position to emotion coordinates
  const processTouch = useCallback((locationX: number, locationY: number) => {
    const graphSize = graphLayoutRef.current?.width || GRAPH_SIZE;
    const graphHeight = graphLayoutRef.current?.height || GRAPH_SIZE;
    
    // Clamp position within graph bounds
    const clampedX = Math.max(0, Math.min(graphSize, locationX));
    const clampedY = Math.max(0, Math.min(graphHeight, locationY));
    
    // Convert pixel position to -2 to 2 scale
    // X: left = negative (-2), right = positive (+2) (pleasure)
    // Y: top = positive (+2), bottom = negative (-2) (energy)
    const pleasure = ((clampedX / graphSize) * 4) - 2;
    const energy = 2 - ((clampedY / graphHeight) * 4);
    
    // Clamp values to valid range
    const clampedPleasure = Math.max(-2, Math.min(2, pleasure));
    const clampedEnergy = Math.max(-2, Math.min(2, energy));
    
    return { 
      x: clampedX, 
      y: clampedY, 
      energy: clampedEnergy, 
      pleasure: clampedPleasure 
    };
  }, []);

  // PanResponder for accurate touch tracking (works with both taps and drags)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const result = processTouch(locationX, locationY);
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setPosition({ x: result.x, y: result.y });
        setSelectedPleasure(result.pleasure);
        setSelectedEnergy(result.energy);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const result = processTouch(locationX, locationY);
        
        setPosition({ x: result.x, y: result.y });
        setSelectedPleasure(result.pleasure);
        setSelectedEnergy(result.energy);
      },
      onPanResponderRelease: () => {
        Haptics.selectionAsync();
      },
    })
  ).current;

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
    
    // Check if near center (neutral zone) - within 0.5 of origin
    if (Math.abs(selectedEnergy) < 0.5 && Math.abs(selectedPleasure) < 0.5) {
      return 'neutral';
    }
    
    const energyKey = selectedEnergy >= 0 ? 'high' : 'low';
    const pleasureKey = selectedPleasure >= 0 ? 'positive' : 'negative';
    return `${energyKey}_${pleasureKey}`;
  };

  const getPointColor = (): string => {
    return QUADRANT_COLORS[getQuadrantKey() as keyof typeof QUADRANT_COLORS] || colors.self;
  };

  // Get intensity level for more specific emotion suggestions
  const getIntensityLevel = (): 'low' | 'medium' | 'high' => {
    if (selectedEnergy === null || selectedPleasure === null) return 'medium';
    const distance = Math.sqrt(selectedEnergy ** 2 + selectedPleasure ** 2);
    if (distance > 1.5) return 'high';
    if (distance > 0.7) return 'medium';
    return 'low';
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
      <Text style={styles.stepSubtitle}>Tap or drag anywhere on the graph</Text>

      <View style={styles.graphContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>High{'\n'}Energy</Text>
          <Text style={[styles.axisValue, styles.axisValueTop]}>+2</Text>
          <Text style={styles.axisValue}>0</Text>
          <Text style={[styles.axisValue, styles.axisValueBottom]}>-2</Text>
          <Text style={styles.axisLabel}>Low{'\n'}Energy</Text>
        </View>

        {/* Graph area with PanResponder for accurate touch tracking */}
        <View 
          ref={graphRef}
          style={styles.graph}
          onLayout={handleGraphLayout}
          {...panResponder.panHandlers}
        >
          {/* Background quadrant colors with gradients */}
          <View style={styles.quadrantRow}>
            <View style={[styles.quadrant, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
              <Text style={styles.quadrantEmoji}>😰</Text>
              <Text style={styles.quadrantLabel}>Stressed</Text>
            </View>
            <View style={[styles.quadrant, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={styles.quadrantEmoji}>🤩</Text>
              <Text style={styles.quadrantLabel}>Excited</Text>
            </View>
          </View>
          <View style={styles.quadrantRow}>
            <View style={[styles.quadrant, { backgroundColor: 'rgba(107, 114, 128, 0.15)' }]}>
              <Text style={styles.quadrantEmoji}>😔</Text>
              <Text style={styles.quadrantLabel}>Down</Text>
            </View>
            <View style={[styles.quadrant, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Text style={styles.quadrantEmoji}>😌</Text>
              <Text style={styles.quadrantLabel}>Calm</Text>
            </View>
          </View>

          {/* Center neutral zone indicator */}
          <View style={styles.centerZone}>
            <Text style={styles.centerEmoji}>😐</Text>
          </View>

          {/* Grid lines */}
          <View style={styles.gridLineH} />
          <View style={styles.gridLineV} />

          {/* Selected point - positioned exactly where user touches */}
          {position && (
            <Animated.View 
              entering={FadeIn.duration(100)}
              style={[
                styles.point,
                { 
                  left: position.x - 18,
                  top: position.y - 18,
                  backgroundColor: getPointColor(),
                }
              ]}
            >
              <View style={styles.pointInner} />
            </Animated.View>
          )}
          
          {/* Touch ripple effect */}
          {position && (
            <View 
              style={[
                styles.touchRipple,
                { 
                  left: position.x - 30,
                  top: position.y - 30,
                  borderColor: getPointColor(),
                }
              ]}
            />
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
    fontSize: 28,
    opacity: 0.4,
  },
  quadrantLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    opacity: 0.6,
    marginTop: 2,
  },
  centerZone: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerEmoji: {
    fontSize: 18,
    opacity: 0.5,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  pointInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
  touchRipple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    opacity: 0.3,
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
