import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AddInventoryModal, AddSubscriptionModal } from '../components/home';
import { useInventory, useSubscriptions, useHomeAlerts } from '@/hooks/useHomeOS';
import { colors } from '@/constants/theme';

const ACCENT = colors.home;

export default function HomeView() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'inventory' | 'subscription'>('inventory');
  
  // Fetch data from database
  const { data: inventory, isLoading: loadingInventory } = useInventory();
  const { data: subscriptions, isLoading: loadingSubs } = useSubscriptions();
  const { data: alerts } = useHomeAlerts();

  const isLoading = loadingInventory || loadingSubs;

  // Calculate stats
  const inventoryCount = inventory?.length || 0;
  const subscriptionCount = subscriptions?.length || 0;
  const monthlySpend = subscriptions?.reduce((total, sub) => {
    const cost = sub.cost || 0;
    switch (sub.frequency) {
      case 'monthly': return total + cost;
      case 'quarterly': return total + (cost / 3);
      case 'annual': return total + (cost / 12);
      default: return total + cost;
    }
  }, 0) || 0;

  // Alert counts
  const warrantiesExpiring = alerts?.filter(a => a.type === 'warranty_expiring').length || 0;
  const upcomingBills = alerts?.filter(a => a.type === 'subscription_billing').length || 0;
  const totalAlerts = warrantiesExpiring + upcomingBills;

  const openAddModal = (type: 'inventory' | 'subscription') => {
    setAddModalType(type);
    setShowAddModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🏠</Text>
          <View>
            <Text style={styles.title}>Home</Text>
            <Text style={styles.subtitle}>Chief Household Officer</Text>
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
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : (
          <Animated.View entering={FadeIn.duration(300)}>
            {/* Stats Summary */}
            <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inventoryCount}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{subscriptionCount}</Text>
                <Text style={styles.statLabel}>Subscriptions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${monthlySpend.toFixed(0)}</Text>
                <Text style={styles.statLabel}>Monthly</Text>
              </View>
            </Animated.View>

            {/* Alerts (if any) */}
            {totalAlerts > 0 && (
              <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.alertsCard}>
                <Text style={styles.alertsTitle}>⚠️ {totalAlerts} {totalAlerts === 1 ? 'Alert' : 'Alerts'}</Text>
                {warrantiesExpiring > 0 && (
                  <Text style={styles.alertItem}>• {warrantiesExpiring} warranty expiring soon</Text>
                )}
                {upcomingBills > 0 && (
                  <Text style={styles.alertItem}>• {upcomingBills} bill due this week</Text>
                )}
              </Animated.View>
            )}

            {/* Inventory Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📦 Inventory</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openAddModal('inventory')}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {inventoryCount === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No items yet</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => openAddModal('inventory')}
                >
                  <Text style={styles.emptyButtonText}>Add your first item</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.itemList}>
                {inventory?.slice(0, 5).map((item, index) => (
                  <InventoryCard key={item.id} item={item} index={index} />
                ))}
                {inventoryCount > 5 && (
                  <Text style={styles.moreText}>+{inventoryCount - 5} more items</Text>
                )}
              </View>
            )}

            {/* Subscriptions Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💳 Subscriptions</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openAddModal('subscription')}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {subscriptionCount === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No subscriptions tracked</Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => openAddModal('subscription')}
                >
                  <Text style={styles.emptyButtonText}>Track a subscription</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.itemList}>
                {subscriptions?.slice(0, 5).map((sub, index) => (
                  <SubscriptionCard key={sub.id} subscription={sub} index={index} />
                ))}
                {subscriptionCount > 5 && (
                  <Text style={styles.moreText}>+{subscriptionCount - 5} more subscriptions</Text>
                )}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Add Modal - switches between inventory and subscription */}
      <AddInventoryModal 
        visible={showAddModal && addModalType === 'inventory'} 
        onClose={() => setShowAddModal(false)} 
      />
      <AddSubscriptionModal 
        visible={showAddModal && addModalType === 'subscription'} 
        onClose={() => setShowAddModal(false)} 
      />
    </View>
  );
}

// Inventory Card Component
interface InventoryCardProps {
  item: any;
  index: number;
}

function InventoryCard({ item, index }: InventoryCardProps) {
  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={styles.itemCard}
        activeOpacity={0.7}
      >
        <View style={styles.itemIcon}>
          <Text style={styles.itemEmoji}>📦</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.itemSubtitle}>
            {item.brand || item.category || 'Home item'}
          </Text>
        </View>
        {item.warranty_expires && (
          <View style={styles.warrantyBadge}>
            <Text style={styles.warrantyText}>🛡️</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Subscription Card Component
interface SubscriptionCardProps {
  subscription: any;
  index: number;
}

function SubscriptionCard({ subscription, index }: SubscriptionCardProps) {
  const costDisplay = subscription.frequency === 'annual' 
    ? `$${(subscription.cost / 12).toFixed(0)}/mo`
    : `$${subscription.cost}/${subscription.frequency?.slice(0, 2) || 'mo'}`;

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={styles.itemCard}
        activeOpacity={0.7}
      >
        <View style={styles.itemIcon}>
          <Text style={styles.itemEmoji}>💳</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {subscription.name}
          </Text>
          <Text style={styles.itemSubtitle}>
            {subscription.category || 'Subscription'}
          </Text>
        </View>
        <Text style={styles.costText}>{costDisplay}</Text>
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
  headerEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: ACCENT,
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
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  
  // Stats card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: `${ACCENT}12`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: '#E0E0E0',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  
  // Alerts card
  alertsCard: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#eab308',
    marginBottom: 6,
  },
  alertItem: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  addButton: {
    backgroundColor: `${ACCENT}20`,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },
  
  // Empty section
  emptySection: {
    backgroundColor: `${ACCENT}06`,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${ACCENT}10`,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  emptyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  emptyButtonText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: '500',
  },
  
  // Item list
  itemList: {
    gap: 10,
  },
  moreText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Item card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ACCENT}08`,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: `${ACCENT}12`,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: `${ACCENT}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  warrantyBadge: {
    paddingHorizontal: 8,
  },
  warrantyText: {
    fontSize: 16,
  },
  costText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: '500',
  },
});
