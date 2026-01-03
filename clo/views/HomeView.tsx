/**
 * HomeView - Tile-Based Home Management
 * 
 * Clean tile navigation that expands to full screen when selected.
 * Tiles: Overview, Inventory, Bills, Vendors, Manual, Alerts
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Linking,
  Alert,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInUp, 
  FadeInRight,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AddInventoryModal, AddSubscriptionModal, AddVendorModal, AddWikiModal } from '../components/home';
import { WikiEntry } from '../components/home/AddWikiModal';
import { 
  useInventory, 
  useSubscriptions, 
  useVendors,
  useServiceLogs,
  useMaintenanceSchedules,
  useHomeAlerts,
  useProperties,
  useCreateProperty,
} from '@/hooks/useHomeOS';
import { HomeInventoryItem, Subscription, Vendor } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';

const ACCENT = colors.home;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_GAP = 12;
const TILE_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - TILE_GAP) / 2;

// ============================================
// TYPES & CONFIGURATION
// ============================================

type TabType = 'overview' | 'inventory' | 'subscriptions' | 'vendors' | 'wiki' | 'alerts' | null;

interface TileConfig {
  key: Exclude<TabType, null>;
  label: string;
  icon: string;
  color: string;
}

const TILES: TileConfig[] = [
  { key: 'overview', label: 'Overview', icon: '📊', color: '#10B981' },
  { key: 'inventory', label: 'Inventory', icon: '📦', color: '#8B5CF6' },
  { key: 'subscriptions', label: 'Bills', icon: '💳', color: '#F59E0B' },
  { key: 'vendors', label: 'Vendors', icon: '👷', color: '#3B82F6' },
  { key: 'wiki', label: 'Manual', icon: '📖', color: '#EC4899' },
  { key: 'alerts', label: 'Alerts', icon: '🔔', color: '#EF4444' },
];

// Category icons
const INVENTORY_ICONS: Record<string, string> = {
  appliance: '🔌', electronics: '📱', furniture: '🛋️', hvac: '❄️',
  plumbing: '🚿', outdoor: '🌳', vehicle: '🚗', other: '📦',
};

const VENDOR_ICONS: Record<string, string> = {
  plumber: '🔧', electrician: '⚡', hvac: '❄️', landscaping: '🌳',
  cleaning: '🧹', handyman: '🛠️', pest_control: '🐛', roofing: '🏠', 
  painting: '🎨', appliance_repair: '🔌', other: '👷',
};

const WIKI_ICONS: Record<string, string> = {
  wifi_network: '📶', gate_codes: '🔐', trash_schedule: '🗑️',
  utilities: '💡', emergency_contacts: '🚨', parking: '🅿️',
  appliance_tips: '💡', seasonal: '🌸', other: '📝',
};

// Mock wiki data
const MOCK_WIKI_ENTRIES = [
  { id: '1', category: 'wifi_network', title: 'Home WiFi', content: 'Network: HomeNet_5G\nPassword: ********' },
  { id: '2', category: 'trash_schedule', title: 'Trash Pickup', content: 'Tuesday: Recycling\nFriday: Regular trash' },
  { id: '3', category: 'gate_codes', title: 'Gate Code', content: 'Main gate: 1234#\nGuest code: 5678#' },
];

// Helper functions
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isExpiringSoon = (dateStr: string) => {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days <= 30;
};

const formatTrade = (trade: string | undefined) => {
  if (!trade) return 'Service Provider';
  return trade.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// ============================================
// TILE COMPONENT
// ============================================

interface TileProps {
  config: TileConfig;
  index: number;
  badge?: number;
  onPress: () => void;
}

function Tile({ config, index, badge, onPress }: TileProps) {
  return (
    <Animated.View entering={FadeInUp.delay(50 + index * 50).duration(300)}>
      <TouchableOpacity
        style={[styles.tile, { backgroundColor: `${config.color}15` }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.tileIcon}>{config.icon}</Text>
        <Text style={[styles.tileLabel, { color: config.color }]}>{config.label}</Text>
        {badge !== undefined && badge > 0 && (
          <View style={[styles.tileBadge, { backgroundColor: config.color }]}>
            <Text style={styles.tileBadgeText}>{badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HomeView() {
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'inventory' | 'subscription'>('inventory');
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [editingWikiEntry, setEditingWikiEntry] = useState<WikiEntry | null>(null);
  const [wikiEntries, setWikiEntries] = useState(MOCK_WIKI_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit mode state
  const [editingInventoryItem, setEditingInventoryItem] = useState<HomeInventoryItem | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  // Fetch data
  const { data: inventory = [], isLoading: loadingInventory } = useInventory();
  const { data: subscriptions = [], isLoading: loadingSubs } = useSubscriptions();
  const { data: vendors = [], isLoading: loadingVendors } = useVendors();
  const { data: serviceLogs = [] } = useServiceLogs();
  const { data: maintenanceSchedules = [] } = useMaintenanceSchedules();

  const isLoading = loadingInventory || loadingSubs || loadingVendors;

  // Calculate stats
  const inventoryCount = inventory.length;
  const subscriptionCount = subscriptions.filter(s => s.is_active).length;
  const monthlySpend = subscriptions
    .filter(s => s.is_active)
    .reduce((total, sub) => {
      const cost = sub.cost || 0;
      switch (sub.frequency) {
        case 'monthly': return total + cost;
        case 'quarterly': return total + (cost / 3);
        case 'annual': return total + (cost / 12);
        default: return total + cost;
      }
    }, 0);

  // Alerts calculation
  const expiringWarranties = inventory.filter(item => {
    if (!item.warranty_expires) return false;
    const days = Math.ceil((new Date(item.warranty_expires).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 30;
  });

  const upcomingBills = subscriptions.filter(sub => {
    if (!sub.next_billing_date || !sub.is_active) return false;
    const days = Math.ceil((new Date(sub.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7;
  });

  const overdueMaintenance = maintenanceSchedules.filter(m => {
    if (!m.next_due) return false;
    return new Date(m.next_due) < new Date();
  });

  const totalAlerts = expiringWarranties.length + upcomingBills.length + overdueMaintenance.length;

  // Handlers
  const openAddModal = useCallback((type: 'inventory' | 'subscription') => {
    setAddModalType(type);
    setEditingInventoryItem(null);
    setEditingSubscription(null);
    setShowAddModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const openEditInventoryModal = useCallback((item: HomeInventoryItem) => {
    setAddModalType('inventory');
    setEditingInventoryItem(item);
    setShowAddModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const openEditSubscriptionModal = useCallback((sub: Subscription) => {
    setAddModalType('subscription');
    setEditingSubscription(sub);
    setShowAddModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const openEditVendorModal = useCallback((vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowVendorModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingInventoryItem(null);
    setEditingSubscription(null);
  }, []);

  const closeVendorModal = useCallback(() => {
    setShowVendorModal(false);
    setEditingVendor(null);
  }, []);

  const handleCall = useCallback((phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleCancelSubscription = useCallback((sub: any) => {
    Alert.alert(
      'Cancel Subscription',
      `Generate a cancellation letter for ${sub.name}?`,
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Generate Letter', 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Coming Soon', 'AI cancellation letter generation will be available soon!');
          }
        },
      ]
    );
  }, []);

  const openVendorModal = useCallback(() => {
    setEditingVendor(null);
    setShowVendorModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const openWikiModal = useCallback(() => {
    setShowWikiModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleAddWikiEntry = useCallback((entry: { category: string; title: string; content: string }) => {
    const newEntry = { id: Date.now().toString(), ...entry };
    setWikiEntries(prev => [...prev, newEntry]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleUpdateWikiEntry = useCallback((entry: WikiEntry) => {
    setWikiEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    setEditingWikiEntry(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleDeleteWikiEntry = useCallback((id: string) => {
    setWikiEntries(prev => prev.filter(e => e.id !== id));
    setEditingWikiEntry(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const openWikiEntryForEdit = useCallback((entry: WikiEntry) => {
    setEditingWikiEntry(entry);
    setShowWikiModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const closeWikiModal = useCallback(() => {
    setShowWikiModal(false);
    setEditingWikiEntry(null);
  }, []);

  const handleBack = useCallback(() => {
    setActiveTab(null);
    setSearchQuery('');
  }, []);

  // Filter functions
  const filteredInventory = inventory.filter(item =>
    !searchQuery || 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(sub =>
    !searchQuery || sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVendors = vendors.filter(v =>
    !searchQuery || 
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.trade?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================
  // RENDER FUNCTIONS FOR EACH TAB
  // ============================================

  const renderOverview = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.statCard} onPress={() => setActiveTab('inventory')}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statValue}>{inventoryCount}</Text>
          <Text style={styles.statLabel}>Assets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => setActiveTab('subscriptions')}>
          <Text style={styles.statIcon}>💳</Text>
          <Text style={styles.statValue}>${monthlySpend.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Monthly Bills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => setActiveTab('vendors')}>
          <Text style={styles.statIcon}>👷</Text>
          <Text style={styles.statValue}>{vendors.length}</Text>
          <Text style={styles.statLabel}>Vendors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => setActiveTab('alerts')}>
          <Text style={styles.statIcon}>🔔</Text>
          <Text style={[styles.statValue, totalAlerts > 0 && styles.alertValue]}>{totalAlerts}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </TouchableOpacity>
      </View>

      {/* Alert Summary */}
      {totalAlerts > 0 && (
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.alertCard}>
          <Text style={styles.alertCardTitle}>⚠️ Needs Attention</Text>
          {expiringWarranties.length > 0 && (
            <Text style={styles.alertItem}>• {expiringWarranties.length} warranty expiring soon</Text>
          )}
          {upcomingBills.length > 0 && (
            <Text style={styles.alertItem}>• {upcomingBills.length} bill due this week</Text>
          )}
          {overdueMaintenance.length > 0 && (
            <Text style={styles.alertItem}>• {overdueMaintenance.length} maintenance overdue</Text>
          )}
        </Animated.View>
      )}

      {/* Recent Items */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Items</Text>
        {inventory.slice(0, 3).map((item, i) => (
          <Animated.View key={item.id} entering={FadeInUp.delay(i * 50).duration(300)}>
            <View style={styles.recentItem}>
              <Text style={styles.recentIcon}>{INVENTORY_ICONS[item.category] || '📦'}</Text>
              <View style={styles.recentInfo}>
                <Text style={styles.recentTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.recentSub}>{item.brand || item.category}</Text>
              </View>
              {item.warranty_expires && <Text style={styles.warrantyBadge}>🛡️</Text>}
            </View>
          </Animated.View>
        ))}
        {inventory.length === 0 && (
          <Text style={styles.emptyText}>No items yet. Add your first asset!</Text>
        )}
      </View>
    </Animated.View>
  );

  const renderInventory = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('inventory')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.miniStats}>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>{inventory.length}</Text>
          <Text style={styles.miniStatLabel}>Items</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>
            ${inventory.reduce((sum, i) => sum + (i.purchase_price || 0), 0).toLocaleString()}
          </Text>
          <Text style={styles.miniStatLabel}>Total Value</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={[styles.miniStatValue, expiringWarranties.length > 0 && styles.alertValue]}>
            {expiringWarranties.length}
          </Text>
          <Text style={styles.miniStatLabel}>Expiring</Text>
        </View>
      </View>

      {filteredInventory.map((item, i) => (
        <Animated.View key={item.id} entering={FadeInUp.delay(i * 30).duration(300)}>
          <TouchableOpacity style={styles.listCard} onPress={() => openEditInventoryModal(item)}>
            <View style={styles.listIcon}>
              <Text style={styles.listEmoji}>{INVENTORY_ICONS[item.category] || '📦'}</Text>
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.listSub}>
                {item.brand || ''} {item.model_number ? `• ${item.model_number}` : ''}
              </Text>
              {item.warranty_expires && (
                <Text style={[styles.warrantyText, isExpiringSoon(item.warranty_expires) && styles.warningText]}>
                  Warranty: {formatDate(item.warranty_expires)}
                </Text>
              )}
            </View>
            {item.purchase_price && <Text style={styles.priceText}>${item.purchase_price.toLocaleString()}</Text>}
            <Text style={styles.editHint}>✏️</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
      
      {filteredInventory.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No items found</Text>
          <TouchableOpacity onPress={() => openAddModal('inventory')}>
            <Text style={styles.emptyAction}>Add your first item</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderSubscriptions = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search subscriptions..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('subscription')}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.burnCard}>
        <Text style={styles.burnLabel}>Monthly Spend</Text>
        <Text style={styles.burnValue}>${monthlySpend.toFixed(2)}</Text>
        <Text style={styles.burnSub}>{subscriptionCount} active subscriptions</Text>
      </View>

      {filteredSubscriptions.map((sub, i) => {
        const daysUntil = sub.next_billing_date 
          ? Math.ceil((new Date(sub.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        return (
          <Animated.View key={sub.id} entering={FadeInUp.delay(i * 30).duration(300)}>
            <TouchableOpacity 
              style={[styles.listCard, !sub.is_active && styles.cancelledCard]}
              onPress={() => openEditSubscriptionModal(sub)}
              onLongPress={() => handleCancelSubscription(sub)}
            >
              <View style={styles.listIcon}>
                <Text style={styles.listEmoji}>💳</Text>
              </View>
              <View style={styles.listInfo}>
                <Text style={styles.listTitle}>{sub.name}</Text>
                <Text style={styles.listSub}>
                  {sub.category || 'Subscription'}
                  {daysUntil !== null && daysUntil <= 7 && daysUntil >= 0 && (
                    <Text style={styles.renewWarning}> • Renews in {daysUntil}d</Text>
                  )}
                </Text>
                {!sub.is_active && <Text style={styles.cancelledBadge}>Cancelled</Text>}
              </View>
              <View style={styles.costColumn}>
                <Text style={styles.costAmount}>${sub.cost?.toFixed(2)}</Text>
                <Text style={styles.costPeriod}>/{sub.frequency?.[0]}</Text>
              </View>
              <Text style={styles.editHint}>✏️</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <Text style={styles.tipText}>💡 Tap to edit • Long press for cancellation letter</Text>
    </Animated.View>
  );

  const renderVendors = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Search vendors..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.miniStats}>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>{vendors.length}</Text>
          <Text style={styles.miniStatLabel}>Vendors</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>{serviceLogs.length}</Text>
          <Text style={styles.miniStatLabel}>Service Logs</Text>
        </View>
        <View style={styles.miniStat}>
          <Text style={styles.miniStatValue}>
            ${serviceLogs.reduce((sum, l) => sum + (l.cost || 0), 0).toLocaleString()}
          </Text>
          <Text style={styles.miniStatLabel}>Total Spent</Text>
        </View>
      </View>

      {filteredVendors.map((vendor, i) => (
        <Animated.View key={vendor.id} entering={FadeInUp.delay(i * 30).duration(300)}>
          <TouchableOpacity style={styles.listCard} onPress={() => openEditVendorModal(vendor)}>
            <View style={styles.listIcon}>
              <Text style={styles.listEmoji}>{VENDOR_ICONS[vendor.trade?.toLowerCase()] || '👷'}</Text>
            </View>
            <View style={styles.listInfo}>
              <View style={styles.vendorNameRow}>
                <Text style={styles.listTitle}>{vendor.name}</Text>
                {vendor.rating && vendor.rating >= 4 && <Text style={styles.starBadge}>⭐</Text>}
              </View>
              <Text style={styles.listSub}>{formatTrade(vendor.trade)}</Text>
              {vendor.rating && (
                <Text style={styles.ratingText}>
                  {'★'.repeat(Math.round(vendor.rating))}{'☆'.repeat(5 - Math.round(vendor.rating))}
                </Text>
              )}
            </View>
            {vendor.phone && (
              <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(vendor.phone!)}>
                <Text style={styles.callBtnText}>📞</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.editHint}>✏️</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}

      {filteredVendors.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👷</Text>
          <Text style={styles.emptyTitle}>No vendors found</Text>
          <Text style={styles.emptyText}>Add vendors as you hire them</Text>
        </View>
      )}

      <TouchableOpacity style={styles.addWikiBtn} onPress={openVendorModal}>
        <Text style={styles.addWikiBtnText}>+ Add Vendor</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderWiki = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <Text style={styles.wikiIntro}>
        Your household manual – all the info everyone needs in one place.
      </Text>

      {wikiEntries.map((entry, i) => (
        <Animated.View key={entry.id} entering={FadeInUp.delay(i * 50).duration(300)}>
          <TouchableOpacity style={styles.wikiCard} onPress={() => openWikiEntryForEdit(entry)}>
            <View style={styles.wikiHeader}>
              <Text style={styles.wikiIcon}>{WIKI_ICONS[entry.category] || '📝'}</Text>
              <Text style={styles.wikiTitle}>{entry.title}</Text>
              <Text style={styles.wikiEditHint}>✏️</Text>
            </View>
            <Text style={styles.wikiContent}>{entry.content}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}

      <TouchableOpacity style={styles.addWikiBtn} onPress={openWikiModal}>
        <Text style={styles.addWikiBtnText}>+ Add Entry</Text>
      </TouchableOpacity>

      <Text style={styles.tipText}>
        💡 Add WiFi passwords, gate codes, trash schedules, and more
      </Text>
    </Animated.View>
  );

  const renderAlerts = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      {totalAlerts === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>All clear!</Text>
          <Text style={styles.emptyText}>No alerts at this time</Text>
        </View>
      ) : (
        <>
          {expiringWarranties.length > 0 && (
            <View style={styles.alertSection}>
              <Text style={styles.alertSectionTitle}>🛡️ Warranties Expiring Soon</Text>
              {expiringWarranties.map((item, i) => (
                <Animated.View key={item.id} entering={FadeInRight.delay(i * 50).duration(300)}>
                  <View style={styles.alertRow}>
                    <Text style={styles.alertName}>{item.name}</Text>
                    <Text style={styles.alertDate}>{formatDate(item.warranty_expires!)}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}

          {upcomingBills.length > 0 && (
            <View style={styles.alertSection}>
              <Text style={styles.alertSectionTitle}>💳 Bills Due This Week</Text>
              {upcomingBills.map((sub, i) => (
                <Animated.View key={sub.id} entering={FadeInRight.delay(i * 50).duration(300)}>
                  <View style={styles.alertRow}>
                    <Text style={styles.alertName}>{sub.name}</Text>
                    <Text style={styles.alertAmount}>${sub.cost}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}

          {overdueMaintenance.length > 0 && (
            <View style={styles.alertSection}>
              <Text style={styles.alertSectionTitle}>🔧 Maintenance Overdue</Text>
              {overdueMaintenance.map((m, i) => (
                <Animated.View key={m.id} entering={FadeInRight.delay(i * 50).duration(300)}>
                  <View style={styles.alertRow}>
                    <Text style={styles.alertName}>{m.task_name}</Text>
                    <Text style={styles.alertDate}>{formatDate(m.next_due!)}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </>
      )}
    </Animated.View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'inventory': return renderInventory();
      case 'subscriptions': return renderSubscriptions();
      case 'vendors': return renderVendors();
      case 'wiki': return renderWiki();
      case 'alerts': return renderAlerts();
      default: return null;
    }
  };

  // ============================================
  // FULL SCREEN TAB VIEW
  // ============================================

  if (activeTab) {
    const config = TILES.find(t => t.key === activeTab)!;
    return (
      <View style={styles.container}>
        <Animated.View 
          entering={SlideInRight.duration(250)}
          exiting={SlideOutRight.duration(200)}
          style={styles.fullScreen}
        >
          {/* Header */}
          <View style={[styles.moduleHeader, { borderBottomColor: `${config.color}30` }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.moduleTitleContainer}>
              <Text style={styles.moduleHeaderIcon}>{config.icon}</Text>
              <Text style={[styles.moduleTitle, { color: config.color }]}>{config.label}</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.contentScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={ACCENT} />
              </View>
            ) : (
              renderTabContent()
            )}
          </ScrollView>
        </Animated.View>

        {/* Modals */}
        <AddInventoryModal visible={showAddModal && addModalType === 'inventory'} onClose={closeAddModal} editItem={editingInventoryItem} />
        <AddSubscriptionModal visible={showAddModal && addModalType === 'subscription'} onClose={closeAddModal} editItem={editingSubscription} />
        <AddVendorModal visible={showVendorModal} onClose={closeVendorModal} editItem={editingVendor} />
        <AddWikiModal visible={showWikiModal} onClose={closeWikiModal} onSave={handleAddWikiEntry} onUpdate={handleUpdateWikiEntry} onDelete={handleDeleteWikiEntry} editEntry={editingWikiEntry} />
      </View>
    );
  }

  // ============================================
  // DEFAULT TILE VIEW
  // ============================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🏠</Text>
          <View>
            <Text style={styles.title}>Home</Text>
            <Text style={styles.subtitle}>Your household command center</Text>
          </View>
        </View>
      </Animated.View>

      {/* Tile Grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tilesContainer}
      >
        <View style={styles.tilesGrid}>
          {TILES.map((tile, index) => (
            <Tile
              key={tile.key}
              config={tile}
              index={index}
              badge={tile.key === 'alerts' ? totalAlerts : undefined}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab(tile.key);
              }}
            />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <AddInventoryModal visible={showAddModal && addModalType === 'inventory'} onClose={closeAddModal} editItem={editingInventoryItem} />
      <AddSubscriptionModal visible={showAddModal && addModalType === 'subscription'} onClose={closeAddModal} editItem={editingSubscription} />
      <AddVendorModal visible={showVendorModal} onClose={closeVendorModal} editItem={editingVendor} />
      <AddWikiModal visible={showWikiModal} onClose={closeWikiModal} onSave={handleAddWikiEntry} onUpdate={handleUpdateWikiEntry} onDelete={handleDeleteWikiEntry} editEntry={editingWikiEntry} />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Scroll & Grid
  scrollView: {
    flex: 1,
  },
  tilesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },

  // Tile
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE * 0.85,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tileIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  tileBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Full Screen View
  fullScreen: {
    flex: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
    minWidth: 70,
  },
  backText: {
    color: colors.home,
    fontSize: 16,
    fontWeight: '500',
  },
  moduleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moduleHeaderIcon: {
    fontSize: 24,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    minWidth: 70,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 160,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - 12) / 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertValue: {
    color: '#EF4444',
  },

  // Alert Card
  alertCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  alertItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Recent Section
  recentSection: {
    marginTop: spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recentIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  recentSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  warrantyBadge: {
    fontSize: 16,
  },

  // Search Row
  searchRow: {
    flexDirection: 'row',
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
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: ACCENT,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Mini Stats
  miniStats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  miniStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // List Card
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cancelledCard: {
    opacity: 0.5,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  listEmoji: {
    fontSize: 22,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  listSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  warrantyText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  warningText: {
    color: '#F59E0B',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  editHint: {
    fontSize: 14,
    opacity: 0.5,
  },

  // Subscription specific
  renewWarning: {
    color: '#F59E0B',
  },
  cancelledBadge: {
    fontSize: 10,
    color: '#EF4444',
    marginTop: 2,
  },
  costColumn: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  costAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  costPeriod: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Vendor specific
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starBadge: {
    fontSize: 12,
  },
  ratingText: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 2,
  },
  callBtn: {
    padding: spacing.sm,
    marginRight: spacing.xs,
  },
  callBtnText: {
    fontSize: 18,
  },

  // Wiki
  wikiIntro: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  wikiCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  wikiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  wikiIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  wikiTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  wikiEditHint: {
    fontSize: 14,
    opacity: 0.5,
  },
  wikiContent: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addWikiBtn: {
    backgroundColor: ACCENT,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addWikiBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  // Alerts Tab
  alertSection: {
    marginBottom: spacing.lg,
  },
  alertSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  alertName: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  alertDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  alertAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyAction: {
    fontSize: 15,
    color: ACCENT,
    fontWeight: '500',
    marginTop: spacing.sm,
  },

  // Tips
  tipText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 160,
  },
});
