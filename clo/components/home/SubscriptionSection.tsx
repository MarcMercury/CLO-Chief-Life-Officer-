/**
 * SubscriptionSection Component
 * 
 * Displays subscriptions with monthly burn rate and renewal alerts.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSubscriptions } from '@/hooks/useHomeOS';
import { Subscription } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';

const CATEGORY_ICONS: Record<string, string> = {
  streaming: '📺',
  software: '💻',
  utilities: '💡',
  insurance: '🛡️',
  membership: '🎫',
  food: '🍕',
  fitness: '💪',
  news: '📰',
  cloud: '☁️',
  other: '📋',
};

interface SubscriptionSectionProps {
  onAddPress: () => void;
  onItemPress: (subscription: Subscription) => void;
}

export function SubscriptionSection({ onAddPress, onItemPress }: SubscriptionSectionProps) {
  const { data: subscriptions = [], isLoading } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Filter subscriptions
  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = !searchQuery || 
      sub.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = !showActiveOnly || sub.is_active;
    return matchesSearch && matchesActive;
  });

  // Calculate stats
  const activeSubs = subscriptions.filter(s => s.is_active);
  const monthlyBurn = activeSubs.reduce((sum, sub) => {
    if (!sub.cost) return sum;
    switch (sub.frequency) {
      case 'monthly': return sum + sub.cost;
      case 'quarterly': return sum + (sub.cost / 3);
      case 'annual': return sum + (sub.cost / 12);
      default: return sum + sub.cost;
    }
  }, 0);

  const upcomingRenewals = subscriptions.filter(sub => {
    if (!sub.next_billing_date || !sub.is_active) return false;
    const daysUntil = Math.ceil((new Date(sub.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 7;
  }).length;

  const renderItem = ({ item, index }: { item: Subscription; index: number }) => {
    const daysUntilRenewal = item.next_billing_date
      ? Math.ceil((new Date(item.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
        <TouchableOpacity
          style={[
            styles.subCard,
            !item.is_active && styles.subCardCancelled
          ]}
          onPress={() => {
            haptics.tapLight();
            onItemPress(item);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.subIcon}>
            <Text style={styles.subEmoji}>
              {CATEGORY_ICONS[item.category || 'other'] || '📋'}
            </Text>
          </View>
          
          <View style={styles.subInfo}>
            <Text style={styles.subName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.subMeta}>
              {formatBillingCycle(item.frequency)}
              {daysUntilRenewal !== null && daysUntilRenewal <= 7 && (
                <Text style={styles.renewalWarning}>
                  {' '}• Renews in {daysUntilRenewal}d
                </Text>
              )}
            </Text>
            {!item.is_active && (
              <Text style={styles.cancelledBadge}>Cancelled</Text>
            )}
          </View>

          <View style={styles.subCost}>
            <Text style={styles.costAmount}>
              ${item.cost?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.costPeriod}>
              /{item.frequency?.[0] || 'm'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{activeSubs.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, styles.burnValue]}>
            ${monthlyBurn.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Monthly Burn</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, upcomingRenewals > 0 && styles.warningValue]}>
            {upcomingRenewals}
          </Text>
          <Text style={styles.statLabel}>Renewing Soon</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search subscriptions..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            haptics.tapMedium();
            onAddPress();
          }}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, showActiveOnly && styles.filterChipActive]}
          onPress={() => {
            haptics.selection();
            setShowActiveOnly(!showActiveOnly);
          }}
        >
          <Text style={[styles.filterText, showActiveOnly && styles.filterTextActive]}>
            Active Only
          </Text>
        </TouchableOpacity>
        <Text style={styles.filterCount}>
          {filteredSubs.length} subscription{filteredSubs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Subscriptions List */}
      <FlatList
        data={filteredSubs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading subscriptions...' : 'No subscriptions yet'}
            </Text>
            {!isLoading && (
              <Text style={styles.emptySubtext}>
                Track your recurring payments and find savings
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

function formatBillingCycle(cycle?: string): string {
  switch (cycle) {
    case 'weekly': return 'Weekly';
    case 'monthly': return 'Monthly';
    case 'quarterly': return 'Quarterly';
    case 'annual': return 'Annual';
    default: return 'Monthly';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.textPrimary,
  },
  burnValue: {
    color: colors.home,
  },
  warningValue: {
    color: colors.warning,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: colors.home,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  filterChipActive: {
    backgroundColor: colors.home,
  },
  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  filterCount: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  subCardCancelled: {
    opacity: 0.6,
  },
  subIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.homeBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  subEmoji: {
    fontSize: 24,
  },
  subInfo: {
    flex: 1,
  },
  subName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  renewalWarning: {
    color: colors.warning,
  },
  cancelledBadge: {
    fontSize: 11,
    color: colors.error,
    marginTop: 4,
    fontWeight: '500',
  },
  subCost: {
    alignItems: 'flex-end',
  },
  costAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  costPeriod: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
