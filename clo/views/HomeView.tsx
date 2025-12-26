import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CircleTabBar, QuickAction, ItemCard, SectionHeader } from '../components/shared';
import { ItemList } from '../components/items';
import {
  InventorySection,
  AddInventoryModal,
  SubscriptionSection,
  AddSubscriptionModal,
  VendorSection,
  MaintenanceSection,
} from '../components/home';
import { useHomeAlerts } from '@/hooks/useHomeOS';
import { colors } from '@/constants/theme';

const ACCENT = colors.home;

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'subscriptions', label: 'Subscriptions', icon: '💳' },
  { key: 'vendors', label: 'Vendors', icon: '👷' },
  { key: 'maintenance', label: 'Maintenance', icon: '🔧' },
];

// Mock data for dashboard (will be replaced with real data)
const mockMaintenanceTasks = [
  { id: '1', task: 'HVAC Filter Change', due: 'Overdue', room: 'Utility', icon: '🌀' },
  { id: '2', task: 'Smoke Detector Battery', due: 'Jan 15', room: 'All Rooms', icon: '🔋' },
  { id: '3', task: 'Gutter Cleaning', due: 'Feb 1', room: 'Exterior', icon: '🍂' },
];

export default function HomeView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddSubscription, setShowAddSubscription] = useState(false);
  
  // Get real alerts from HomeOS
  const { data: alerts } = useHomeAlerts();

  const renderDashboardTab = () => {
    // Calculate alerts from real data
    const warrantiesExpiring = alerts?.filter(a => a.type === 'warranty_expiring').length || 0;
    const upcomingBills = alerts?.filter(a => a.type === 'subscription_billing').length || 0;
    const maintenanceOverdue = alerts?.filter(a => a.type === 'maintenance_overdue').length || 0;
    
    return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="📷" label="Scan Item" accentColor={ACCENT} onPress={() => setShowAddInventory(true)} />
        <QuickAction icon="➕" label="Add Item" accentColor={ACCENT} onPress={() => setShowAddInventory(true)} />
        <QuickAction icon="🔧" label="Find Vendor" accentColor={ACCENT} onPress={() => setActiveTab('vendors')} />
        <QuickAction icon="🔔" label="Reminders" accentColor={ACCENT} onPress={() => setActiveTab('maintenance')} />
      </View>

      {/* Alerts Card */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.alertsCard}>
        <View style={styles.alertsHeader}>
          <Text style={styles.alertsTitle}>Active Alerts</Text>
          <Text style={styles.alertsTotal}>
            {warrantiesExpiring + upcomingBills + maintenanceOverdue}
          </Text>
        </View>
        <View style={styles.alertsGrid}>
          <TouchableOpacity style={styles.alertItem} activeOpacity={0.7} onPress={() => setActiveTab('inventory')}>
            <Text style={styles.alertValue}>{warrantiesExpiring}</Text>
            <Text style={styles.alertLabel}>Warranties</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alertItem} activeOpacity={0.7} onPress={() => setActiveTab('subscriptions')}>
            <Text style={styles.alertValue}>{upcomingBills}</Text>
            <Text style={styles.alertLabel}>Bills Due</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alertItem} activeOpacity={0.7} onPress={() => setActiveTab('maintenance')}>
            <Text style={[styles.alertValue, maintenanceOverdue > 0 && styles.alertWarning]}>
              {maintenanceOverdue}
            </Text>
            <Text style={styles.alertLabel}>Overdue</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Monthly Burn Rate - TODO: fetch from subscriptions */}
      <View style={styles.burnCard}>
        <Text style={styles.burnLabel}>Monthly Recurring</Text>
        <Text style={styles.burnValue}>$--</Text>
      </View>

      {/* Maintenance Tasks */}
      <SectionHeader title="Your Items" subtitle="Home tasks & notes" />
      <ItemList circleContext="HOME" showCompleted={false} maxItems={5} />

      {/* Upcoming Maintenance */}
      <SectionHeader title="Upcoming Maintenance" subtitle={`${mockMaintenanceTasks.length} tasks`} />
      <View style={styles.taskList}>
        {mockMaintenanceTasks.map((task, index) => (
          <ItemCard
            key={task.id}
            title={task.task}
            subtitle={`${task.room} • ${task.due}`}
            icon={task.icon}
            accentColor={ACCENT}
            index={index}
            isCompleted={false}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            rightContent={
              task.due === 'Overdue' ? (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueText}>!</Text>
                </View>
              ) : null
            }
          />
        ))}
      </View>
    </Animated.View>
    );
  };

  const renderInventoryTab = () => (
    <InventorySection
      onAddPress={() => setShowAddInventory(true)}
      onItemPress={(item) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Open item detail modal
      }}
    />
  );

  const renderSubscriptionsTab = () => (
    <SubscriptionSection
      onAddPress={() => setShowAddSubscription(true)}
      onItemPress={(sub) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Open subscription detail modal
      }}
    />
  );

  const renderVendorsTab = () => (
    <VendorSection
      onAddPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // TODO: Open add vendor modal
      }}
      onItemPress={(vendor) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Open vendor detail modal
      }}
    />
  );

  const renderMaintenanceTab = () => (
    <MaintenanceSection
      onAddPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // TODO: Open add maintenance modal
      }}
      onItemPress={(task) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // TODO: Open task detail modal
      }}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Chief Household Officer</Text>
      </Animated.View>

      {/* Tab Bar */}
      <CircleTabBar 
        tabs={TABS} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        accentColor={ACCENT}
      />

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'subscriptions' && renderSubscriptionsTab()}
        {activeTab === 'vendors' && renderVendorsTab()}
        {activeTab === 'maintenance' && renderMaintenanceTab()}
      </ScrollView>

      {/* Modals */}
      <AddInventoryModal 
        visible={showAddInventory} 
        onClose={() => setShowAddInventory(false)} 
      />
      <AddSubscriptionModal 
        visible={showAddSubscription} 
        onClose={() => setShowAddSubscription(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: ACCENT,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  tabContent: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  alertsCard: {
    backgroundColor: `${ACCENT}12`,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 14,
    color: '#888',
  },
  alertsTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT,
    backgroundColor: `${ACCENT}25`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  alertItem: {
    alignItems: 'center',
    padding: 8,
  },
  alertValue: {
    fontSize: 28,
    fontWeight: '300',
    color: '#E0E0E0',
  },
  alertWarning: {
    color: '#eab308',
  },
  alertLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  burnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${ACCENT}10`,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  burnLabel: {
    fontSize: 14,
    color: '#888',
  },
  burnValue: {
    fontSize: 24,
    fontWeight: '300',
    color: ACCENT,
  },
  taskList: {
    gap: 10,
  },
  overdueBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overdueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  inventorySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ACCENT}12`,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '400',
    color: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  warningText: {
    color: '#eab308',
  },
  filterLabel: {
    fontSize: 14,
    color: ACCENT,
  },
  inventoryList: {
    gap: 10,
  },
  warrantyBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredBadge: {
    backgroundColor: '#ef4444',
  },
  expiringSoonBadge: {
    backgroundColor: '#eab308',
  },
  warrantyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  monthlyCard: {
    backgroundColor: `${ACCENT}15`,
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  monthlyLabel: {
    fontSize: 14,
    color: '#888',
  },
  monthlyValue: {
    fontSize: 40,
    fontWeight: '200',
    color: ACCENT,
    marginTop: 8,
  },
  monthlySubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  subscriptionList: {
    gap: 10,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: `${ACCENT}10`,
    gap: 12,
  },
  subIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${ACCENT}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subEmoji: {
    fontSize: 22,
  },
  subInfo: {
    flex: 1,
  },
  subName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  subNext: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  subAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  subPrice: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  subPeriod: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  reviewBadge: {
    backgroundColor: '#eab308',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  cancelAssist: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ACCENT}08`,
    borderWidth: 1,
    borderColor: `${ACCENT}30`,
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  cancelIcon: {
    fontSize: 28,
  },
  cancelInfo: {
    flex: 1,
  },
  cancelTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  cancelSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  cancelChevron: {
    fontSize: 24,
    color: ACCENT,
  },
});
