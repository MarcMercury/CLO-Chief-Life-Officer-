import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CircleTabBar, QuickAction, ItemCard, SectionHeader } from '../components/shared';

const ACCENT = '#84a98c';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'bills', label: 'Bills', icon: '💳' },
];

// Mock data
const mockAlerts = {
  warrantiesExpiring: 2,
  upcomingBills: 3,
  maintenanceOverdue: 1,
  monthlyBurn: 487.50,
};

const mockInventory = [
  { id: '1', name: 'MacBook Pro 16"', room: 'Office', warranty: 'Active', icon: '💻', value: 2499 },
  { id: '2', name: 'Samsung TV 65"', room: 'Living Room', warranty: 'Expires Soon', icon: '📺', value: 1299 },
  { id: '3', name: 'Dyson V15', room: 'Storage', warranty: 'Active', icon: '🔧', value: 749 },
  { id: '4', name: 'KitchenAid Mixer', room: 'Kitchen', warranty: 'Expired', icon: '🍳', value: 399 },
];

const mockSubscriptions = [
  { id: '1', name: 'Netflix', amount: 15.99, nextBill: 'Jan 5', icon: '🎬', status: 'active' },
  { id: '2', name: 'Spotify', amount: 9.99, nextBill: 'Jan 10', icon: '🎵', status: 'active' },
  { id: '3', name: 'iCloud+', amount: 2.99, nextBill: 'Jan 15', icon: '☁️', status: 'active' },
  { id: '4', name: 'Adobe CC', amount: 54.99, nextBill: 'Jan 20', icon: '🎨', status: 'review' },
];

const mockMaintenanceTasks = [
  { id: '1', task: 'HVAC Filter Change', due: 'Overdue', room: 'Utility', icon: '🌀' },
  { id: '2', task: 'Smoke Detector Battery', due: 'Jan 15', room: 'All Rooms', icon: '🔋' },
  { id: '3', task: 'Gutter Cleaning', due: 'Feb 1', room: 'Exterior', icon: '🍂' },
];

export default function HomeView() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderDashboardTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="📷" label="Scan Item" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="➕" label="Add Item" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="🔧" label="Find Vendor" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="🔔" label="Reminders" accentColor={ACCENT} onPress={() => {}} />
      </View>

      {/* Alerts Card */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.alertsCard}>
        <View style={styles.alertsHeader}>
          <Text style={styles.alertsTitle}>Active Alerts</Text>
          <Text style={styles.alertsTotal}>
            {mockAlerts.warrantiesExpiring + mockAlerts.upcomingBills + mockAlerts.maintenanceOverdue}
          </Text>
        </View>
        <View style={styles.alertsGrid}>
          <TouchableOpacity style={styles.alertItem} activeOpacity={0.7}>
            <Text style={styles.alertValue}>{mockAlerts.warrantiesExpiring}</Text>
            <Text style={styles.alertLabel}>Warranties</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alertItem} activeOpacity={0.7}>
            <Text style={styles.alertValue}>{mockAlerts.upcomingBills}</Text>
            <Text style={styles.alertLabel}>Bills Due</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alertItem} activeOpacity={0.7}>
            <Text style={[styles.alertValue, mockAlerts.maintenanceOverdue > 0 && styles.alertWarning]}>
              {mockAlerts.maintenanceOverdue}
            </Text>
            <Text style={styles.alertLabel}>Overdue</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Monthly Burn Rate */}
      <View style={styles.burnCard}>
        <Text style={styles.burnLabel}>Monthly Recurring</Text>
        <Text style={styles.burnValue}>${mockAlerts.monthlyBurn.toFixed(2)}</Text>
      </View>

      {/* Maintenance Tasks */}
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

  const renderInventoryTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="📷" label="Scan" accentColor={ACCENT} onPress={() => {}} size="large" />
        <QuickAction icon="🔍" label="Search" accentColor={ACCENT} onPress={() => {}} size="large" />
      </View>

      {/* Inventory Summary */}
      <View style={styles.inventorySummary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{mockInventory.length}</Text>
          <Text style={styles.summaryLabel}>Items</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            ${mockInventory.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>Total Value</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, styles.warningText]}>
            {mockInventory.filter(i => i.warranty === 'Expires Soon').length}
          </Text>
          <Text style={styles.summaryLabel}>Expiring</Text>
        </View>
      </View>

      {/* Inventory List */}
      <SectionHeader 
        title="All Items" 
        rightContent={<Text style={styles.filterLabel}>Filter ▼</Text>}
      />
      <View style={styles.inventoryList}>
        {mockInventory.map((item, index) => (
          <ItemCard
            key={item.id}
            title={item.name}
            subtitle={`${item.room} • $${item.value}`}
            icon={item.icon}
            accentColor={ACCENT}
            index={index}
            onPress={() => {}}
            rightContent={
              <View style={[
                styles.warrantyBadge,
                item.warranty === 'Expired' && styles.expiredBadge,
                item.warranty === 'Expires Soon' && styles.expiringSoonBadge
              ]}>
                <Text style={styles.warrantyText}>
                  {item.warranty === 'Active' ? '✓' : item.warranty === 'Expires Soon' ? '!' : '✗'}
                </Text>
              </View>
            }
          />
        ))}
      </View>
    </Animated.View>
  );

  const renderBillsTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="➕" label="Add Bill" accentColor={ACCENT} onPress={() => {}} size="large" />
        <QuickAction icon="📊" label="Analytics" accentColor={ACCENT} onPress={() => {}} size="large" />
      </View>

      {/* Monthly Total */}
      <View style={styles.monthlyCard}>
        <Text style={styles.monthlyLabel}>This Month</Text>
        <Text style={styles.monthlyValue}>
          ${mockSubscriptions.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
        </Text>
        <Text style={styles.monthlySubtext}>
          {mockSubscriptions.length} active subscriptions
        </Text>
      </View>

      {/* Subscriptions List */}
      <SectionHeader title="Subscriptions" subtitle="Manage your recurring bills" />
      <View style={styles.subscriptionList}>
        {mockSubscriptions.map((sub, index) => (
          <Animated.View 
            key={sub.id}
            entering={FadeInUp.delay(index * 50).duration(300)}
          >
            <TouchableOpacity 
              style={styles.subscriptionCard}
              activeOpacity={0.7}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.subIcon}>
                <Text style={styles.subEmoji}>{sub.icon}</Text>
              </View>
              <View style={styles.subInfo}>
                <Text style={styles.subName}>{sub.name}</Text>
                <Text style={styles.subNext}>Next: {sub.nextBill}</Text>
              </View>
              <View style={styles.subAmount}>
                <Text style={styles.subPrice}>${sub.amount}</Text>
                <Text style={styles.subPeriod}>/mo</Text>
              </View>
              {sub.status === 'review' && (
                <View style={styles.reviewBadge}>
                  <Text style={styles.reviewText}>Review</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Cancel Assistance */}
      <TouchableOpacity 
        style={styles.cancelAssist}
        activeOpacity={0.7}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <Text style={styles.cancelIcon}>✉️</Text>
        <View style={styles.cancelInfo}>
          <Text style={styles.cancelTitle}>Need to cancel a subscription?</Text>
          <Text style={styles.cancelSubtitle}>AI-powered cancellation letter generator</Text>
        </View>
        <Text style={styles.cancelChevron}>›</Text>
      </TouchableOpacity>
    </Animated.View>
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
        {activeTab === 'bills' && renderBillsTab()}
      </ScrollView>
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
