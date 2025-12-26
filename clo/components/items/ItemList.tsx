import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useItems } from '@/hooks/useItems';
import { CircleType, ItemWithCircles } from '@/types/database';
import UniversalItemCard from '@/components/items/UniversalItemCard';

interface ItemListProps {
  circleContext: CircleType | 'ALL';
  emptyMessage?: string;
  showCompleted?: boolean;
  maxItems?: number;
}

export default function ItemList({
  circleContext,
  emptyMessage = 'No items yet. Tap + to create one!',
  showCompleted = true,
  maxItems,
}: ItemListProps) {
  const { data: items, isLoading, error, refetch } = useItems(circleContext);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#888" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load items</Text>
        <Text style={styles.errorSubtext} onPress={() => refetch()}>
          Tap to retry
        </Text>
      </View>
    );
  }

  // Filter and limit items
  let displayItems = items || [];
  
  if (!showCompleted) {
    displayItems = displayItems.filter((item) => item.status !== 'COMPLETED');
  }
  
  if (maxItems) {
    displayItems = displayItems.slice(0, maxItems);
  }

  if (displayItems.length === 0) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </Animated.View>
    );
  }

  return (
    <FlatList
      data={displayItems}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <UniversalItemCard item={item} index={index} />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Parent ScrollView handles scrolling
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#888',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 8,
  },
});
