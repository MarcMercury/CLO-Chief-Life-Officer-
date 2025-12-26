/**
 * VendorSection Component
 * 
 * Displays vendor memory bank with fuzzy search.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useVendors } from '@/hooks/useHomeOS';
import { Vendor } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';

const TRADE_ICONS: Record<string, string> = {
  plumber: '🔧',
  electrician: '⚡',
  hvac: '❄️',
  landscaping: '🌳',
  cleaning: '🧹',
  handyman: '🛠️',
  pest_control: '🐛',
  appliance_repair: '🔌',
  roofing: '🏠',
  painting: '🎨',
  other: '👷',
};

interface VendorSectionProps {
  onAddPress: () => void;
  onItemPress: (vendor: Vendor) => void;
}

export function VendorSection({ onAddPress, onItemPress }: VendorSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: vendors = [], isLoading } = useVendors();

  // Filter vendors based on search
  const displayedVendors = searchQuery.length >= 2 
    ? vendors.filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.trade.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : vendors;

  // Calculate stats
  const recentCount = vendors.filter(v => {
    if (!v.last_service_date) return false;
    const daysSince = Math.ceil((Date.now() - new Date(v.last_service_date).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince <= 90;
  }).length;
  const avgRating = vendors.length > 0
    ? vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.filter(v => v.rating).length
    : 0;

  const handleCall = (phone: string) => {
    haptics.tapMedium();
    Linking.openURL(`tel:${phone}`);
  };

  const renderItem = ({ item, index }: { item: Vendor; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={styles.vendorCard}
        onPress={() => {
          haptics.tapLight();
          onItemPress(item);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.vendorIcon}>
          <Text style={styles.vendorEmoji}>
            {TRADE_ICONS[item.trade.toLowerCase()] || '👷'}
          </Text>
        </View>
        
        <View style={styles.vendorInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.vendorName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.rating && item.rating >= 4 && (
              <Text style={styles.preferredBadge}>⭐</Text>
            )}
          </View>
          <Text style={styles.vendorCategory}>
            {formatCategory(item.trade)}
          </Text>
          {item.rating && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars}>
                {'★'.repeat(Math.round(item.rating))}
                {'☆'.repeat(5 - Math.round(item.rating))}
              </Text>
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        {item.phone && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(item.phone!)}
          >
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{vendors.length}</Text>
          <Text style={styles.statLabel}>Vendors</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{recentCount}</Text>
          <Text style={styles.statLabel}>Active (90d)</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {avgRating ? avgRating.toFixed(1) : '-'}
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendors (fuzzy search)..."
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

      {/* Vendors List */}
      <FlatList
        data={displayedVendors}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👷</Text>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading vendors...' : 'No vendors yet'}
            </Text>
            {!isLoading && (
              <Text style={styles.emptySubtext}>
                Build your trusted service provider network
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

function formatCategory(category?: string): string {
  if (!category) return 'Other';
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  vendorIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.homeBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  vendorEmoji: {
    fontSize: 24,
  },
  vendorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  preferredBadge: {
    fontSize: 12,
  },
  vendorCategory: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  ratingStars: {
    fontSize: 11,
    color: colors.warning,
  },
  ratingText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.homeBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 20,
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
