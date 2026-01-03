import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCapsules } from '../hooks/useCapsules';
import InvitePartnerModal from '../components/relationships/InvitePartnerModal';

const NEST_WARM = '#D4A574'; // Warm wood/straw color

const getHealthColor = (status: string) => {
  switch (status) {
    case 'thriving': return '#22c55e';
    case 'healthy': return '#84cc16';
    case 'needs_attention': return '#eab308';
    case 'at_risk': return '#ef4444';
    default: return '#666';
  }
};

export default function RelationshipsView() {
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const router = useRouter();
  
  const { data: nests, isLoading } = useCapsules();

  const handleOpenNest = (nestId: string) => {
    router.push(`/capsule/${nestId}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.nestEmoji}>🪺</Text>
          <View>
            <Text style={styles.title}>Your Nests</Text>
            <Text style={styles.subtitle}>Spaces you share</Text>
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={NEST_WARM} />
          </View>
        ) : nests && nests.length > 0 ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.nestList}>
            {/* Nest count header */}
            <View style={styles.nestHeader}>
              <Text style={styles.nestCount}>
                {nests.length} {nests.length === 1 ? 'Nest' : 'Nests'}
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsInviteModalVisible(true);
                }}
              >
                <Text style={styles.addButtonText}>+ New Nest</Text>
              </TouchableOpacity>
            </View>

            {/* Nest Cards */}
            {nests.map((nest, index) => (
              <NestCard
                key={nest.id}
                nest={nest}
                index={index}
                onPress={() => handleOpenNest(nest.id)}
              />
            ))}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
            {/* Nest illustration */}
            <View style={styles.nestIllustration}>
              <Text style={styles.bigNestEmoji}>🏠</Text>
              <View style={styles.nestBase}>
                <Text style={styles.nestBaseBranch}>🌿</Text>
                <Text style={styles.nestBaseCenter}>🪺</Text>
                <Text style={styles.nestBaseBranch}>🌿</Text>
              </View>
            </View>
            
            <Text style={styles.emptyTitle}>Build Your First Nest</Text>
            <Text style={styles.emptySubtitle}>
              A nest is a private space you share with someone special — 
              partner, family, close friend.
            </Text>
            
            {/* What's inside a nest */}
            <View style={styles.nestFeatures}>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>💓</Text>
                <Text style={styles.featureText}>Check in on each other</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>📋</Text>
                <Text style={styles.featureText}>Plan & decide together</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>🔐</Text>
                <Text style={styles.featureText}>Keep shared memories safe</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>💬</Text>
                <Text style={styles.featureText}>Private conversations</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsInviteModalVisible(true);
              }}
            >
              <Text style={styles.createButtonIcon}>🪺</Text>
              <Text style={styles.createButtonText}>Create a Nest</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Invite Modal */}
      <InvitePartnerModal
        visible={isInviteModalVisible}
        onClose={() => setIsInviteModalVisible(false)}
      />
    </View>
  );
}

// Nest Card Component
interface NestCardProps {
  nest: any;
  index: number;
  onPress: () => void;
}

function NestCard({ nest, index, onPress }: NestCardProps) {
  const partner = nest.partner;
  const health = nest.relationship_health;
  const isPending = nest.status === 'pending';
  const inviteEmail = nest.user_b_email || nest.invite_email;
  const displayName = partner?.display_name || nest.nickname || inviteEmail || 'Pending';
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(400)}>
      <TouchableOpacity
        style={styles.nestCard}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Nest icon with health glow */}
        <View style={styles.nestIconContainer}>
          <View style={[
            styles.nestGlow,
            { backgroundColor: isPending ? '#44444440' : `${getHealthColor(health?.status || 'healthy')}20` }
          ]}>
            <Text style={styles.nestCardEmoji}>🪺</Text>
          </View>
        </View>

        {/* Nest info */}
        <View style={styles.nestInfo}>
          <View style={styles.nestNameRow}>
            <Text style={styles.nestName} numberOfLines={1}>
              {displayName}
            </Text>
            {isPending && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Invited</Text>
              </View>
            )}
          </View>
          
          {!isPending && health ? (
            <View style={styles.nestStatusRow}>
              <View style={[styles.healthDot, { backgroundColor: getHealthColor(health.status) }]} />
              <Text style={styles.nestStatus}>
                {health.days_since_meaningful_interaction === 0 
                  ? 'Connected today'
                  : health.days_since_meaningful_interaction === 1
                  ? 'Yesterday'
                  : `${health.days_since_meaningful_interaction}d ago`
                }
              </Text>
            </View>
          ) : isPending ? (
            <Text style={styles.nestStatus}>Waiting for them to join...</Text>
          ) : null}
        </View>

        {/* Enter arrow */}
        <View style={styles.enterArrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  nestEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: NEST_WARM,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 160, // Extra space for orbital control
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  
  // Nest list styles
  nestList: {
    paddingTop: 8,
  },
  nestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  nestCount: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: `${NEST_WARM}20`,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: NEST_WARM,
  },
  
  // Nest card styles
  nestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 165, 116, 0.08)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.15)',
  },
  nestIconContainer: {
    marginRight: 14,
  },
  nestGlow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nestCardEmoji: {
    fontSize: 28,
  },
  nestInfo: {
    flex: 1,
  },
  nestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nestName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E8E8E8',
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: '#666',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ccc',
  },
  nestStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nestStatus: {
    fontSize: 13,
    color: '#888',
  },
  enterArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${NEST_WARM}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: NEST_WARM,
    fontWeight: '300',
  },
  
  // Empty state styles
  emptyState: {
    paddingTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nestIllustration: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bigNestEmoji: {
    fontSize: 80,
    marginBottom: -20,
  },
  nestBase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nestBaseBranch: {
    fontSize: 32,
  },
  nestBaseCenter: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: NEST_WARM,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  nestFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(212, 165, 116, 0.06)',
    borderRadius: 12,
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  featureText: {
    fontSize: 15,
    color: '#ccc',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEST_WARM,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    gap: 10,
    shadowColor: NEST_WARM,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  createButtonIcon: {
    fontSize: 24,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
