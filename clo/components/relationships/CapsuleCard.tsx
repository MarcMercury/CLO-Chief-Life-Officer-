import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CapsuleWithPartner } from '@/types/relationships';

interface CapsuleCardProps {
  capsule: CapsuleWithPartner;
  index?: number;
  onPress: () => void;
}

const ACCENT = '#e17055';

const getHealthColor = (status: string) => {
  switch (status) {
    case 'thriving': return '#22c55e';
    case 'healthy': return '#84cc16';
    case 'needs_attention': return '#eab308';
    case 'at_risk': return '#ef4444';
    default: return '#666';
  }
};

export default function CapsuleCard({ capsule, index = 0, onPress }: CapsuleCardProps) {
  const partner = capsule.partner;
  const health = capsule.relationship_health;
  const isPending = capsule.status?.toLowerCase() === 'pending';
  const inviteEmail = capsule.user_b_email || capsule.invite_email;
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 60).duration(300)}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Avatar with health ring */}
        <View style={styles.avatarContainer}>
          <View style={[
            styles.healthRing,
            { borderColor: isPending ? '#666' : getHealthColor(health?.status || 'healthy') }
          ]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {partner?.display_name?.[0]?.toUpperCase() || 
                 inviteEmail?.[0]?.toUpperCase() || 
                 '?'}
              </Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {partner?.display_name || inviteEmail || 'Pending Invite'}
            </Text>
            {isPending && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            )}
          </View>
          
          {!isPending && health && (
            <Text style={[styles.healthStatus, { color: getHealthColor(health.status) }]}>
              {health.status === 'thriving' && '✨ Thriving'}
              {health.status === 'healthy' && '💚 Healthy'}
              {health.status === 'needs_attention' && '⚠️ Needs attention'}
              {health.status === 'at_risk' && '❗ At risk'}
            </Text>
          )}
          
          {!isPending && health && (
            <Text style={styles.lastContact}>
              {health.days_since_meaningful_interaction === 0 
                ? 'Connected today'
                : health.days_since_meaningful_interaction === 1
                ? 'Last connected yesterday'
                : `${health.days_since_meaningful_interaction} days since last connect`
              }
            </Text>
          )}
          
          {isPending && (
            <Text style={styles.lastContact}>Waiting for them to accept...</Text>
          )}
        </View>

        {/* Chevron */}
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 14,
  },
  healthRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: ACCENT,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 17,
    fontWeight: '400',
    color: '#E0E0E0',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 11,
    color: '#888',
  },
  healthStatus: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  lastContact: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#666',
    marginLeft: 8,
  },
});
