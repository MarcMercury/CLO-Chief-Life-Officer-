/**
 * InventorySection Component
 * 
 * Displays home inventory items with quick stats and filtering.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useInventory } from '@/hooks/useHomeOS';
import { HomeInventoryItem, InventoryCategory } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';

const CATEGORIES: InventoryCategory[] = [
  'appliance',
  'electronics',
  'furniture',
  'hvac',
  'plumbing',
  'outdoor',
  'vehicle',
  'other',
];

const CATEGORY_ICONS: Record<string, string> = {
  appliance: '🔌',
  electronics: '📱',
  furniture: '🛋️',
  hvac: '❄️',
  plumbing: '🚿',
  outdoor: '🌳',
  vehicle: '🚗',
  other: '📦',
};

interface InventorySectionProps {
  onAddPress: () => void;
  onItemPress: (item: HomeInventoryItem) => void;
}

export function InventorySection({ onAddPress, onItemPress }: InventorySectionProps) {
  const { data: items = [], isLoading } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate stats
  const totalValue = items.reduce((sum, item) => sum + (item.purchase_price || 0), 0);
  const expiringWarranties = items.filter(item => {
    if (!item.warranty_expires) return false;
    const daysUntil = Math.ceil((new Date(item.warranty_expires).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  }).length;

  const handleCategoryPress = (category: string) => {
    haptics.selection();
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const renderItem = ({ item, index }: { item: HomeInventoryItem; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => {
          haptics.tapLight();
          onItemPress(item);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.itemIcon}>
          <Text style={styles.itemEmoji}>
            {CATEGORY_ICONS[item.category] || '📦'}
          </Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemBrand} numberOfLines={1}>
            {item.brand || 'No brand'} {item.model_number ? `• ${item.model_number}` : ''}
          </Text>
          {item.warranty_expires && (
            <Text style={[
              styles.warrantyText,
              isWarrantyExpiringSoon(item.warranty_expires) && styles.warrantyWarning
            ]}>
              Warranty: {formatDate(item.warranty_expires)}
            </Text>
          )}
        </View>
        {item.purchase_price && (
          <Text style={styles.itemPrice}>
            ${item.purchase_price.toLocaleString()}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{items.length}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalValue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Value</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, expiringWarranties > 0 && styles.warningValue]}>
            {expiringWarranties}
          </Text>
          <Text style={styles.statLabel}>Expiring Soon</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
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

      {/* Category Filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        data={CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item && styles.categoryChipActive
            ]}
            onPress={() => handleCategoryPress(item)}
          >
            <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item]}</Text>
            <Text style={[
              styles.categoryText,
              selectedCategory === item && styles.categoryTextActive
            ]}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading inventory...' : 'No items yet'}
            </Text>
            {!isLoading && (
              <Text style={styles.emptySubtext}>
                Add your first item to start tracking warranties
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

function isWarrantyExpiringSoon(dateStr: string): boolean {
  const daysUntil = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return daysUntil > 0 && daysUntil <= 30;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
  categoryList: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.home,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.homeBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemBrand: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  warrantyText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },
  warrantyWarning: {
    color: colors.warning,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
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
