import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useLogInteraction, useEmotionalLogs } from '@/hooks/useCapsules';
import { CapsuleWithPartner } from '@/types/relationships';

const ACCENT = '#e17055';

interface CapsulePulseProps {
  capsuleId: string;
  capsule: CapsuleWithPartner;
}

const getHealthColor = (status: string) => {
  switch (status) {
    case 'thriving': return '#22c55e';
    case 'healthy': return '#84cc16';
    case 'needs_attention': return '#eab308';
    case 'at_risk': return '#ef4444';
    default: return '#666';
  }
};

const QUICK_LOGS = [
  { type: 'MEETING', label: 'We met', icon: '🤝' },
  { type: 'CALL', label: 'We talked', icon: '📞' },
  { type: 'MESSAGE', label: 'We texted', icon: '💬' },
];

export default function CapsulePulse({ capsuleId, capsule }: CapsulePulseProps) {
  const { mutate: logInteraction, isPending } = useLogInteraction();
  const { data: emotionalLogs } = useEmotionalLogs(capsuleId);
  
  const health = capsule.relationship_health;
  const healthColor = getHealthColor(health?.status || 'healthy');
  
  // Breathing animation for healthy relationships
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);
  
  useEffect(() => {
    if (health?.status === 'thriving' || health?.status === 'healthy') {
      pulseScale.value = withRepeat(
        withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      pulseOpacity.value = withRepeat(
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [health?.status]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const handleQuickLog = (interactionType: string) => {
    logInteraction({
      capsule_id: capsuleId,
      interaction_type: interactionType,
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Vibe Check Indicator */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.vibeCheckContainer}>
        <View style={styles.pulseContainer}>
          {/* Animated pulse ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: healthColor },
              pulseAnimatedStyle,
            ]}
          />
          {/* Static center */}
          <View style={[styles.vibeCircle, { borderColor: healthColor }]}>
            <Text style={styles.vibeScore}>{health?.score || 0}</Text>
            <Text style={styles.vibeLabel}>Vibe</Text>
          </View>
        </View>
        
        <Text style={[styles.healthStatus, { color: healthColor }]}>
          {health?.status === 'thriving' && '✨ Thriving'}
          {health?.status === 'healthy' && '💚 Healthy'}
          {health?.status === 'needs_attention' && '⚠️ Needs Attention'}
          {health?.status === 'at_risk' && '❗ At Risk'}
        </Text>
      </Animated.View>

      {/* Days Since Last Connect */}
      <Animated.View entering={FadeInUp.delay(100).duration(300)} style={styles.daysCard}>
        <Text style={styles.daysNumber}>{health?.days_since_meaningful_interaction || 0}</Text>
        <Text style={styles.daysLabel}>days since meaningful connection</Text>
      </Animated.View>

      {/* Quick Log Buttons */}
      <Animated.View entering={FadeInUp.delay(200).duration(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Log</Text>
        <View style={styles.quickLogRow}>
          {QUICK_LOGS.map((log) => (
            <TouchableOpacity
              key={log.type}
              style={[styles.quickLogButton, isPending && styles.buttonDisabled]}
              onPress={() => handleQuickLog(log.type)}
              disabled={isPending}
            >
              <Text style={styles.quickLogIcon}>{log.icon}</Text>
              <Text style={styles.quickLogLabel}>{log.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Mood History */}
      <Animated.View entering={FadeInUp.delay(300).duration(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Moods</Text>
        {emotionalLogs && emotionalLogs.length > 0 ? (
          <View style={styles.moodHistory}>
            {emotionalLogs.slice(0, 7).map((log: any, index: number) => (
              <View key={log.id || index} style={styles.moodItem}>
                <Text style={styles.moodEmoji}>{log.mood_self || log.mood_relationship || '😐'}</Text>
                <Text style={styles.moodDate}>
                  {new Date(log.logged_at).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyMoods}>
            <Text style={styles.emptyText}>No mood logs yet</Text>
            <Text style={styles.emptySubtext}>Start tracking how you feel about this connection</Text>
          </View>
        )}
      </Animated.View>

      {/* Streak */}
      <Animated.View entering={FadeInUp.delay(400).duration(300)} style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View>
          <Text style={styles.streakNumber}>{(capsule as any).streak_days || 0} days</Text>
          <Text style={styles.streakLabel}>Connection Streak</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  vibeCheckContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pulseContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
  },
  vibeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vibeScore: {
    fontSize: 36,
    fontWeight: '300',
    color: '#E0E0E0',
  },
  vibeLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  healthStatus: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  daysCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  daysNumber: {
    fontSize: 48,
    fontWeight: '200',
    color: '#E0E0E0',
  },
  daysLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 12,
  },
  quickLogRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickLogButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  quickLogIcon: {
    fontSize: 24,
  },
  quickLogLabel: {
    fontSize: 13,
    color: '#E0E0E0',
  },
  moodHistory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodItem: {
    alignItems: 'center',
    gap: 4,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodDate: {
    fontSize: 11,
    color: '#666',
  },
  emptyMoods: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 200, 100, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  streakEmoji: {
    fontSize: 32,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  streakLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});
