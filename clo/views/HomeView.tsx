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
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AddInventoryModal, AddSubscriptionModal } from '../components/home';
import { 
  useInventory, 
  useSubscriptions, 
  useVendors,
  useServiceLogs,
  useMaintenanceSchedules,
  useHomeAlerts,
} from '@/hooks/useHomeOS';
import { colors } from '@/constants/theme';

const ACCENT = colors.home;

// Tab configuration
type TabType = 'overview' | 'inventory' | 'subscriptions' | 'vendors' | 'wiki' | 'alerts';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'subscriptions', label: 'Bills', icon: '💳' },
  { key: 'vendors', label: 'Vendors', icon: '👷' },
  { key: 'wiki', label: 'Manual', icon: '📖' },
  { key: 'alerts', label: 'Alerts', icon: '🔔' },
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

// Mock wiki data (will be replaced with real data)
const MOCK_WIKI_ENTRIES = [
  { id: '1', category: 'wifi_network', title: 'Home WiFi', content: 'Network: HomeNet_5G\nPassword: ********' },
  { id: '2', category: 'trash_schedule', title: 'Trash Pickup', content: 'Tuesday: Recycling\nFriday: Regular trash' },
  { id: '3', category: 'gate_codes', title: 'Gate Code', content: 'Main gate: 1234#\nGuest code: 5678#' },
];

export default function HomeView() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalType, setAddModalType] = useState<'inventory' | 'subscription'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProperty, setActiveProperty] = useState('Main House');
  
  // Fetch data
  const { data: inventory = [], isLoading: loadingInventory } = useInventory();
  const { data: subscriptions = [], isLoading: loadingSubs } = useSubscriptions();
  const { data: vendors = [], isLoading: loadingVendors } = useVendors();
  const { data: serviceLogs = [] } = useServiceLogs();
  const { data: maintenanceSchedules = [] } = useMaintenanceSchedules();
  const { data: alerts = [] } = useHomeAlerts();

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

  // Expiring warranties (within 30 days)
  const expiringWarranties = inventory.filter(item => {
    if (!item.warranty_expires) return false;
    const days = Math.ceil((new Date(item.warranty_expires).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 30;
  });

  // Upcoming bills (within 7 days)
  const upcomingBills = subscriptions.filter(sub => {
    if (!sub.next_billing_date || !sub.is_active) return false;
    const days = Math.ceil((new Date(sub.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7;
  });

  // Overdue maintenance
  const overdueMaintenance = maintenanceSchedules.filter(m => {
    if (!m.next_due) return false;
    return new Date(m.next_due) < new Date();
  });

  const totalAlerts = expiringWarranties.length + upcomingBills.length + overdueMaintenance.length;

  const openAddModal = useCallback((type: 'inventory' | 'subscription') => {
    setAddModalType(type);
    setShowAddModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
    Haptics.selectionAsync();
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

  // Render tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'inventory':
        return renderInventory();
      case 'subscriptions':
        return renderSubscriptions();
      case 'vendors':
        return renderVendors();
      case 'wiki':
        return renderWiki();
      case 'alerts':
        return renderAlerts();
      default:
        return renderOverview();
    }
  };

  // Overview Tab
  const renderOverview = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <TouchableOpacity style={styles.statCard} onPress={() => handleTabChange('inventory')}>
          <Text style={styles.statIcon}>📦</Text>
          <Text style={styles.statValue}>{inventoryCount}</Text>
          <Text style={styles.statLabel}>Assets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => handleTabChange('subscriptions')}>
          <Text style={styles.statIcon}>💳</Text>
          <Text style={styles.statValue}>${monthlySpend.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Monthly Bills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => handleTabChange('vendors')}>
          <Text style={styles.statIcon}>👷</Text>
          <Text style={styles.statValue}>{vendors.length}</Text>
          <Text style={styles.statLabel}>Vendors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statCard} onPress={() => handleTabChange('alerts')}>
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

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => openAddModal('inventory')}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionText}>Add Item</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => openAddModal('subscription')}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Track Bill</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleTabChange('vendors')}>
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>Find Vendor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleTabChange('wiki')}>
            <Text style={styles.actionIcon}>📖</Text>
            <Text style={styles.actionText}>House Info</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
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
              {item.warranty_expires && (
                <Text style={styles.warrantyBadge}>🛡️</Text>
              )}
            </View>
          </Animated.View>
        ))}
        {inventory.length === 0 && (
          <Text style={styles.emptyText}>No items yet. Add your first asset!</Text>
        )}
      </View>
    </Animated.View>
  );

  // Inventory Tab
  const renderInventory = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      {/* Search & Add */}
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

      {/* Stats */}
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

      {/* Items List */}
      {filteredInventory.map((item, i) => (
        <Animated.View key={item.id} entering={FadeInUp.delay(i * 30).duration(300)}>
          <TouchableOpacity style={styles.listCard}>
            <View style={styles.listIcon}>
              <Text style={styles.listEmoji}>{INVENTORY_ICONS[item.category] || '📦'}</Text>
            </View>
            <View style={styles.listInfo}>
              <Text style={styles.listTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.listSub}>
                {item.brand || ''} {item.model_number ? `• ${item.model_number}` : ''}
              </Text>
              {item.warranty_expires && (
                <Text style={[
                  styles.warrantyText,
                  isExpiringSoon(item.warranty_expires) && styles.warningText
                ]}>
                  Warranty: {formatDate(item.warranty_expires)}
                </Text>
              )}
            </View>
            {item.purchase_price && (
              <Text style={styles.priceText}>${item.purchase_price.toLocaleString()}</Text>
            )}
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

  // Subscriptions Tab (Financial Firewall)
  const renderSubscriptions = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      {/* Search & Add */}
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

      {/* Monthly Burn Card */}
      <View style={styles.burnCard}>
        <Text style={styles.burnLabel}>Monthly Spend</Text>
        <Text style={styles.burnValue}>${monthlySpend.toFixed(2)}</Text>
        <Text style={styles.burnSub}>{subscriptionCount} active subscriptions</Text>
      </View>

      {/* Subscriptions List */}
      {filteredSubscriptions.map((sub, i) => {
        const daysUntil = sub.next_billing_date 
          ? Math.ceil((new Date(sub.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        return (
          <Animated.View key={sub.id} entering={FadeInUp.delay(i * 30).duration(300)}>
            <TouchableOpacity 
              style={[styles.listCard, !sub.is_active && styles.cancelledCard]}
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
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      <Text style={styles.tipText}>💡 Long press on a subscription to generate a cancellation letter</Text>
    </Animated.View>
  );

  // Vendors Tab (Vendor Memory)
  const renderVendors = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Search vendors... (e.g., 'roof repair 2022')"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
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

      {/* Vendors List */}
      {filteredVendors.map((vendor, i) => (
        <Animated.View key={vendor.id} entering={FadeInUp.delay(i * 30).duration(300)}>
          <View style={styles.listCard}>
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
          </View>
        </Animated.View>
      ))}

      {filteredVendors.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👷</Text>
          <Text style={styles.emptyTitle}>No vendors found</Text>
          <Text style={styles.emptyText}>Add vendors as you hire them</Text>
        </View>
      )}
    </Animated.View>
  );

  // Wiki Tab (Household Manual)
  const renderWiki = () => (
    <Animated.View entering={FadeIn.duration(300)}>
      <Text style={styles.wikiIntro}>
        Your household manual – all the info everyone needs in one place.
      </Text>

      {MOCK_WIKI_ENTRIES.map((entry, i) => (
        <Animated.View key={entry.id} entering={FadeInUp.delay(i * 50).duration(300)}>
          <TouchableOpacity style={styles.wikiCard}>
            <View style={styles.wikiHeader}>
              <Text style={styles.wikiIcon}>{WIKI_ICONS[entry.category] || '📝'}</Text>
              <Text style={styles.wikiTitle}>{entry.title}</Text>
            </View>
            <Text style={styles.wikiContent}>{entry.content}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}

      <TouchableOpacity style={styles.addWikiBtn}>
        <Text style={styles.addWikiBtnText}>+ Add Entry</Text>
      </TouchableOpacity>

      <Text style={styles.tipText}>
        💡 Add WiFi passwords, gate codes, trash schedules, and more
      </Text>
    </Animated.View>
  );

  // Alerts Tab (Notification Center)
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
          {/* Expiring Warranties */}
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

          {/* Upcoming Bills */}
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

          {/* Overdue Maintenance */}
          {overdueMaintenance.length > 0 && (
            <View style={styles.alertSection}>
              <Text style={styles.alertSectionTitle}>🔧 Maintenance Overdue</Text>
              {overdueMaintenance.map((m, i) => (
                <Animated.View key={m.id} entering={FadeInRight.delay(i * 50).duration(300)}>
                  <View style={styles.alertRow}>
                    <Text style={styles.alertName}>{m.task_name}</Text>
                    <Text style={styles.alertOverdue}>Overdue</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Property Switcher */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>🏠</Text>
          <View>
            <Text style={styles.title}>Home</Text>
            <TouchableOpacity style={styles.propertySwitcher}>
              <Text style={styles.propertyName}>{activeProperty}</Text>
              <Text style={styles.switchIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Tab Bar */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {tab.key === 'alerts' && totalAlerts > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{totalAlerts}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          renderContent()
        )}
      </ScrollView>

      {/* Modals */}
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

// Helper functions
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isExpiringSoon(dateStr: string): boolean {
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days > 0 && days <= 30;
}

function formatTrade(trade: string): string {
  return trade.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerLeft: {
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
  propertySwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  propertyName: {
    fontSize: 14,
    color: '#888',
  },
  switchIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  
  // Tab Bar
  tabBar: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: `${ACCENT}20`,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 13,
    color: '#888',
  },
  tabLabelActive: {
    color: ACCENT,
    fontWeight: '500',
  },
  tabBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
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
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: `${ACCENT}10`,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: '#E0E0E0',
  },
  alertValue: {
    color: '#ef4444',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },

  // Alert Card
  alertCard: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  alertCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#eab308',
    marginBottom: 8,
  },
  alertItem: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  // Quick Actions
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: `${ACCENT}08`,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${ACCENT}15`,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    color: '#888',
  },

  // Recent Section
  recentSection: {
    marginTop: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ACCENT}06`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  recentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  recentSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  warrantyBadge: {
    fontSize: 16,
  },

  // Search Row
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#E0E0E0',
  },
  addBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // Mini Stats
  miniStats: {
    flexDirection: 'row',
    backgroundColor: `${ACCENT}08`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '300',
    color: '#E0E0E0',
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },

  // List Card
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ACCENT}08`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: `${ACCENT}10`,
  },
  cancelledCard: {
    opacity: 0.5,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${ACCENT}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listEmoji: {
    fontSize: 22,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  listSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  priceText: {
    fontSize: 14,
    color: '#888',
  },
  warrantyText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  warningText: {
    color: '#eab308',
  },

  // Subscription specific
  burnCard: {
    backgroundColor: `${ACCENT}15`,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  burnLabel: {
    fontSize: 12,
    color: '#888',
  },
  burnValue: {
    fontSize: 36,
    fontWeight: '200',
    color: ACCENT,
    marginVertical: 4,
  },
  burnSub: {
    fontSize: 12,
    color: '#666',
  },
  costColumn: {
    alignItems: 'flex-end',
  },
  costAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: ACCENT,
  },
  costPeriod: {
    fontSize: 11,
    color: '#666',
  },
  renewWarning: {
    color: '#eab308',
  },
  cancelledBadge: {
    fontSize: 10,
    color: '#ef4444',
    marginTop: 4,
  },

  // Vendor specific
  vendorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBadge: {
    fontSize: 12,
    marginLeft: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#fbbf24',
    marginTop: 4,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnText: {
    fontSize: 20,
  },

  // Wiki
  wikiIntro: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  wikiCard: {
    backgroundColor: `${ACCENT}08`,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: `${ACCENT}10`,
  },
  wikiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  wikiIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  wikiTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  wikiContent: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
  },
  addWikiBtn: {
    backgroundColor: `${ACCENT}15`,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addWikiBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: ACCENT,
  },

  // Alerts
  alertSection: {
    marginBottom: 24,
  },
  alertSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  alertName: {
    fontSize: 14,
    color: '#E0E0E0',
    flex: 1,
  },
  alertDate: {
    fontSize: 12,
    color: '#888',
  },
  alertAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: ACCENT,
  },
  alertOverdue: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#E0E0E0',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyAction: {
    fontSize: 14,
    color: ACCENT,
    marginTop: 12,
  },

  tipText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
