/**
 * CapsuleDecisions - Final Decisions & Confirmed Items Component
 * 
 * The Decisions section shows:
 * - Pending items awaiting confirmation (from Plan or Resolve)
 * - Confirmed decisions ready for action
 * - Completed decisions (archive)
 * 
 * Users can confirm pending items, complete confirmed items,
 * and see overall pending count from all undecided items.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  usePendingDecisions,
  useConfirmedDecisions,
  useCompletedItems,
  useAllPendingItems,
  useConfirmDecision,
  useCompleteItem,
  useArchiveItem,
  useIsUserA,
  useItemCounts,
} from '@/hooks/useRelationshipItems';
import { RelationshipItem, RelationshipItemCategory } from '@/types/relationships';

interface CapsuleDecisionsProps {
  capsuleId: string;
}

const CATEGORY_ICONS: Record<RelationshipItemCategory, string> = {
  travel: '✈️',
  money: '💰',
  shopping: '🛍️',
  gift: '🎁',
  activity: '🎯',
  date: '💕',
  home: '🏠',
  general: '📋',
};

type Tab = 'pending' | 'confirmed' | 'completed';

export default function CapsuleDecisions({ capsuleId }: CapsuleDecisionsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  
  // Queries
  const { data: pendingItems, isLoading: loadingPending } = usePendingDecisions(capsuleId);
  const { data: confirmedItems, isLoading: loadingConfirmed } = useConfirmedDecisions(capsuleId);
  const { data: completedItems = [], isLoading: loadingCompleted } = useCompletedItems(capsuleId);
  const { data: allPendingItems } = useAllPendingItems(capsuleId);
  const { data: isUserA } = useIsUserA(capsuleId);
  const { data: counts } = useItemCounts(capsuleId);
  
  // Mutations
  const { mutate: confirmDecision, isPending: confirming } = useConfirmDecision();
  const { mutate: completeItem, isPending: completing } = useCompleteItem();
  const { mutate: archiveItem } = useArchiveItem();

  const hasMyConfirmation = (item: RelationshipItem) => {
    return isUserA ? item.confirmed_by_a : item.confirmed_by_b;
  };

  const hasTheirConfirmation = (item: RelationshipItem) => {
    return isUserA ? item.confirmed_by_b : item.confirmed_by_a;
  };

  const handleConfirm = useCallback((itemId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    confirmDecision({
      itemId,
      capsuleId,
      isUserA: isUserA ?? true,
    });
  }, [capsuleId, isUserA, confirmDecision]);

  const handleComplete = useCallback((itemId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeItem({ itemId, capsuleId });
  }, [capsuleId, completeItem]);

  const handleArchive = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    archiveItem({ itemId, capsuleId });
  }, [capsuleId, archiveItem]);

  const renderPendingItem = (item: RelationshipItem, index: number) => {
    const iConfirmed = hasMyConfirmation(item);
    const theyConfirmed = hasTheirConfirmation(item);

    return (
      <Animated.View
        key={item.id}
        entering={FadeInUp.delay(index * 50).duration(300)}
        style={styles.itemCard}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.categoryIcon}>
              {CATEGORY_ICONS[item.category as RelationshipItemCategory] || '📋'}
            </Text>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
          <View style={styles.confirmBadges}>
            <View style={[styles.confirmBadge, iConfirmed && styles.confirmBadgeActive]}>
              <Text style={styles.confirmBadgeText}>
                {iConfirmed ? '✓' : '○'} You
              </Text>
            </View>
            <View style={[styles.confirmBadge, theyConfirmed && styles.confirmBadgeActive]}>
              <Text style={styles.confirmBadgeText}>
                {theyConfirmed ? '✓' : '○'} Partner
              </Text>
            </View>
          </View>
        </View>

        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}

        {/* Show resolution notes if came from Resolve */}
        {item.resolution_notes && (
          <View style={styles.resolutionBox}>
            <Text style={styles.resolutionLabel}>📝 Resolution Notes</Text>
            <Text style={styles.resolutionText}>{item.resolution_notes}</Text>
          </View>
        )}

        <View style={styles.actionRow}>
          {!iConfirmed ? (
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => handleConfirm(item.id)}
              disabled={confirming}
            >
              <Text style={styles.confirmBtnText}>✓ Confirm Decision</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.waitingBox}>
              <Text style={styles.waitingText}>
                {theyConfirmed 
                  ? '✨ Both confirmed! Moving to confirmed...'
                  : '⏳ Waiting for partner to confirm...'}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderConfirmedItem = (item: RelationshipItem, index: number) => {
    return (
      <Animated.View
        key={item.id}
        entering={FadeInUp.delay(index * 50).duration(300)}
        style={[styles.itemCard, styles.confirmedCard]}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.categoryIcon}>
              {CATEGORY_ICONS[item.category as RelationshipItemCategory] || '📋'}
            </Text>
            <Text style={styles.itemTitle}>{item.title}</Text>
          </View>
          <View style={styles.confirmedBadge}>
            <Text style={styles.confirmedBadgeText}>✓ Confirmed</Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}

        {item.confirmed_at && (
          <Text style={styles.confirmedDate}>
            Confirmed on {new Date(item.confirmed_at).toLocaleDateString()}
          </Text>
        )}

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => handleComplete(item.id)}
            disabled={completing}
          >
            <Text style={styles.completeBtnText}>🎉 Mark Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.archiveBtn}
            onPress={() => handleArchive(item.id)}
          >
            <Text style={styles.archiveBtnText}>Archive</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderCompletedItem = (item: RelationshipItem, index: number) => {
    return (
      <Animated.View
        key={item.id}
        entering={FadeInUp.delay(index * 50).duration(300)}
        style={[styles.itemCard, styles.completedCard]}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemTitleRow}>
            <Text style={styles.categoryIcon}>
              {CATEGORY_ICONS[item.category as RelationshipItemCategory] || '📋'}
            </Text>
            <Text style={[styles.itemTitle, styles.completedTitle]}>{item.title}</Text>
          </View>
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓ Done</Text>
          </View>
        </View>

        {item.completed_at && (
          <Text style={styles.completedDate}>
            Completed {new Date(item.completed_at).toLocaleDateString()}
          </Text>
        )}
      </Animated.View>
    );
  };

  const isLoading = loadingPending || loadingConfirmed || loadingCompleted;
  const activeConfirmedItems = confirmedItems || [];

  // Calculate total pending from ALL undecided items
  const totalPending = counts 
    ? counts.planning + counts.resolving + counts.pending_decision
    : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>✅ Decisions</Text>
          <Text style={styles.subtitle}>Confirmed agreements</Text>
        </View>
        <View style={styles.pendingCounter}>
          <Text style={styles.pendingNumber}>{totalPending}</Text>
          <Text style={styles.pendingLabel}>pending</Text>
        </View>
      </Animated.View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingItems?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'confirmed' && styles.tabActive]}
          onPress={() => setActiveTab('confirmed')}
        >
          <Text style={[styles.tabText, activeTab === 'confirmed' && styles.tabTextActive]}>
            Confirmed ({activeConfirmedItems.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Done ({completedItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#10B981" style={styles.loader} />
        ) : activeTab === 'pending' ? (
          pendingItems && pendingItems.length > 0 ? (
            pendingItems.map((item, index) => renderPendingItem(item, index))
          ) : (
            <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No pending decisions</Text>
              <Text style={styles.emptySubtitle}>
                Items that are ready for final confirmation will appear here
              </Text>
            </Animated.View>
          )
        ) : activeTab === 'confirmed' ? (
          activeConfirmedItems.length > 0 ? (
            activeConfirmedItems.map((item, index) => renderConfirmedItem(item, index))
          ) : (
            <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No confirmed decisions yet</Text>
              <Text style={styles.emptySubtitle}>
                When both of you confirm a decision, it will show here
              </Text>
            </Animated.View>
          )
        ) : (
          completedItems.length > 0 ? (
            completedItems.map((item, index) => renderCompletedItem(item, index))
          ) : (
            <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={styles.emptyTitle}>No completed decisions</Text>
              <Text style={styles.emptySubtitle}>
                Finished decisions will be archived here
              </Text>
            </Animated.View>
          )
        )}
      </ScrollView>

      {/* Overall Pending Indicator */}
      {totalPending > 0 && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.pendingIndicator}>
          <Text style={styles.pendingIndicatorText}>
            💡 {totalPending} item{totalPending !== 1 ? 's' : ''} still need{totalPending === 1 ? 's' : ''} resolution across all stages
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8B9E',
  },
  pendingCounter: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  pendingNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FBBF24',
  },
  pendingLabel: {
    fontSize: 10,
    color: '#FBBF24',
    textTransform: 'uppercase',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B8B9E',
  },
  tabTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  loader: {
    marginTop: 40,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmedCard: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completedCard: {
    opacity: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemHeader: {
    marginBottom: 10,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#8B8B9E',
  },
  itemDescription: {
    fontSize: 14,
    color: '#8B8B9E',
    lineHeight: 20,
    marginBottom: 12,
  },
  confirmBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confirmBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  confirmBadgeText: {
    fontSize: 12,
    color: '#8B8B9E',
  },
  confirmedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  confirmedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  completedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#8B8B9E',
  },
  resolutionBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  resolutionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 6,
  },
  resolutionText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  confirmedDate: {
    fontSize: 12,
    color: '#10B981',
    marginBottom: 12,
  },
  completedDate: {
    fontSize: 12,
    color: '#8B8B9E',
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  completeBtn: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  archiveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  archiveBtnText: {
    fontSize: 14,
    color: '#8B8B9E',
  },
  waitingBox: {
    flex: 1,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  waitingText: {
    fontSize: 13,
    color: '#FBBF24',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8B8B9E',
    textAlign: 'center',
    lineHeight: 20,
  },
  pendingIndicator: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  pendingIndicatorText: {
    fontSize: 13,
    color: '#FBBF24',
    textAlign: 'center',
  },
});
