import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CircleTabBar, QuickAction, SectionHeader } from '../components/shared';

const ACCENT = '#e17055';

const TABS = [
  { key: 'capsules', label: 'Capsules', icon: '💫' },
  { key: 'recent', label: 'Recent', icon: '🕐' },
  { key: 'calendar', label: 'Calendar', icon: '📅' },
];

// Mock data
const mockCapsules = [
  { id: '1', name: 'Sarah', relationship: 'Partner', health: 'thriving', lastContact: '2 hours ago', unread: 2 },
  { id: '2', name: 'Mom', relationship: 'Family', health: 'healthy', lastContact: '3 days ago', unread: 0 },
  { id: '3', name: 'Alex', relationship: 'Friend', health: 'needs_attention', lastContact: '2 weeks ago', unread: 0 },
  { id: '4', name: 'David', relationship: 'Colleague', health: 'healthy', lastContact: '5 days ago', unread: 1 },
];

const mockRecentInteractions = [
  { id: '1', person: 'Sarah', type: 'message', content: 'Sent a good morning message', time: '2 hours ago' },
  { id: '2', person: 'Mom', type: 'call', content: 'Weekly check-in call', time: '3 days ago' },
  { id: '3', person: 'David', type: 'task', content: 'Completed shared project', time: '5 days ago' },
];

const mockUpcoming = [
  { id: '1', person: 'Sarah', event: 'Anniversary', date: 'Jan 15', daysAway: 20 },
  { id: '2', person: 'Mom', event: 'Birthday', date: 'Feb 3', daysAway: 39 },
  { id: '3', person: 'Alex', event: 'Coffee catch-up', date: 'Jan 2', daysAway: 7 },
];

const getHealthColor = (health: string) => {
  switch (health) {
    case 'thriving': return '#22c55e';
    case 'healthy': return '#84cc16';
    case 'needs_attention': return '#eab308';
    case 'at_risk': return '#ef4444';
    default: return '#666';
  }
};

const getHealthLabel = (health: string) => {
  switch (health) {
    case 'thriving': return 'Thriving';
    case 'healthy': return 'Healthy';
    case 'needs_attention': return 'Needs attention';
    case 'at_risk': return 'At risk';
    default: return 'Unknown';
  }
};

export default function RelationshipsView() {
  const [activeTab, setActiveTab] = useState('capsules');

  const renderCapsulesTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="➕" label="New Capsule" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="💬" label="Quick Log" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="🎁" label="Gift Ideas" accentColor={ACCENT} onPress={() => {}} />
      </View>

      {/* Health Summary */}
      <View style={styles.healthSummary}>
        <View style={styles.healthItem}>
          <View style={[styles.healthDotLarge, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.healthCount}>{mockCapsules.filter(c => c.health === 'thriving').length}</Text>
        </View>
        <View style={styles.healthItem}>
          <View style={[styles.healthDotLarge, { backgroundColor: '#84cc16' }]} />
          <Text style={styles.healthCount}>{mockCapsules.filter(c => c.health === 'healthy').length}</Text>
        </View>
        <View style={styles.healthItem}>
          <View style={[styles.healthDotLarge, { backgroundColor: '#eab308' }]} />
          <Text style={styles.healthCount}>{mockCapsules.filter(c => c.health === 'needs_attention').length}</Text>
        </View>
      </View>

      {/* Capsules List */}
      <SectionHeader 
        title="Your Capsules" 
        subtitle={`${mockCapsules.length} connections`}
        rightContent={<Text style={styles.sortLabel}>Sort ▼</Text>}
      />
      <View style={styles.capsuleList}>
        {mockCapsules.map((capsule, index) => (
          <Animated.View 
            key={capsule.id}
            entering={FadeInUp.delay(index * 50).duration(300)}
          >
            <TouchableOpacity 
              style={styles.capsuleCard} 
              activeOpacity={0.7}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{capsule.name[0]}</Text>
                </View>
                <View style={[styles.healthDot, { backgroundColor: getHealthColor(capsule.health) }]} />
              </View>
              
              <View style={styles.capsuleInfo}>
                <View style={styles.capsuleHeader}>
                  <Text style={styles.capsuleName}>{capsule.name}</Text>
                  {capsule.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{capsule.unread}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.capsuleRelation}>{capsule.relationship}</Text>
                <Text style={styles.healthStatus}>{getHealthLabel(capsule.health)}</Text>
              </View>
              
              <View style={styles.capsuleRight}>
                <Text style={styles.lastContact}>{capsule.lastContact}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderRecentTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="💬" label="Log Interaction" accentColor={ACCENT} onPress={() => {}} size="large" />
        <QuickAction icon="🔍" label="Search" accentColor={ACCENT} onPress={() => {}} size="large" />
      </View>

      {/* Recent Activity */}
      <SectionHeader title="Recent Activity" />
      <View style={styles.activityList}>
        {mockRecentInteractions.map((interaction, index) => (
          <Animated.View 
            key={interaction.id}
            entering={FadeInUp.delay(index * 50).duration(300)}
            style={styles.activityCard}
          >
            <View style={styles.activityIcon}>
              <Text style={styles.activityEmoji}>
                {interaction.type === 'message' ? '💬' : interaction.type === 'call' ? '📞' : '✅'}
              </Text>
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityPerson}>{interaction.person}</Text>
              <Text style={styles.activityContent}>{interaction.content}</Text>
            </View>
            <Text style={styles.activityTime}>{interaction.time}</Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderCalendarTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="📅" label="Add Event" accentColor={ACCENT} onPress={() => {}} size="large" />
        <QuickAction icon="🔔" label="Reminders" accentColor={ACCENT} onPress={() => {}} size="large" />
      </View>

      {/* Upcoming Events */}
      <SectionHeader title="Upcoming" subtitle="Don't forget!" />
      <View style={styles.upcomingList}>
        {mockUpcoming.map((event, index) => (
          <Animated.View 
            key={event.id}
            entering={FadeInUp.delay(index * 50).duration(300)}
            style={styles.upcomingCard}
          >
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{event.date.split(' ')[1]}</Text>
              <Text style={styles.dateMonth}>{event.date.split(' ')[0]}</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventPerson}>{event.person}</Text>
              <Text style={styles.eventName}>{event.event}</Text>
            </View>
            <View style={styles.daysAway}>
              <Text style={styles.daysNumber}>{event.daysAway}</Text>
              <Text style={styles.daysLabel}>days</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <Text style={styles.title}>Relationships</Text>
        <Text style={styles.subtitle}>Your connection capsules</Text>
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
        {activeTab === 'capsules' && renderCapsulesTab()}
        {activeTab === 'recent' && renderRecentTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
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
  healthSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 16,
    marginBottom: 8,
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  healthCount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  sortLabel: {
    fontSize: 14,
    color: ACCENT,
  },
  capsuleList: {
    gap: 10,
  },
  capsuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: `${ACCENT}12`,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${ACCENT}30`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '500',
    color: ACCENT,
  },
  healthDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0f0f0f',
  },
  capsuleInfo: {
    flex: 1,
  },
  capsuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  capsuleName: {
    fontSize: 18,
    fontWeight: '400',
    color: '#E0E0E0',
  },
  unreadBadge: {
    backgroundColor: ACCENT,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  capsuleRelation: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  healthStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  capsuleRight: {
    alignItems: 'flex-end',
  },
  lastContact: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#666',
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: `${ACCENT}10`,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${ACCENT}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityInfo: {
    flex: 1,
  },
  activityPerson: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  activityContent: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  upcomingList: {
    gap: 10,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: `${ACCENT}10`,
    gap: 12,
  },
  dateBox: {
    width: 50,
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${ACCENT}25`,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '600',
    color: ACCENT,
  },
  dateMonth: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventPerson: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  eventName: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  daysAway: {
    alignItems: 'center',
  },
  daysNumber: {
    fontSize: 20,
    fontWeight: '300',
    color: ACCENT,
  },
  daysLabel: {
    fontSize: 11,
    color: '#666',
  },
});
