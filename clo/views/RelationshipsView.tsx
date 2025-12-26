import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { CircleTabBar, QuickAction, SectionHeader } from '../components/shared';
import { ItemList } from '../components/items';
import { useCapsules } from '../hooks/useCapsules';
import CapsuleCard from '../components/relationships/CapsuleCard';
import InvitePartnerModal from '../components/relationships/InvitePartnerModal';

const ACCENT = '#e17055';

const TABS = [
  { key: 'capsules', label: 'Capsules', icon: '💫' },
  { key: 'recent', label: 'Recent', icon: '🕐' },
  { key: 'calendar', label: 'Calendar', icon: '📅' },
];

// Mock data for tabs that don't use real data yet
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

export default function RelationshipsView() {
  const [activeTab, setActiveTab] = useState('capsules');
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const router = useRouter();
  
  const { data: capsules, isLoading: capsulesLoading } = useCapsules();

  const handleOpenCapsule = (capsuleId: string) => {
    router.push(`/capsule/${capsuleId}`);
  };

  const renderCapsulesTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="➕" label="New Capsule" accentColor={ACCENT} onPress={() => setIsInviteModalVisible(true)} />
        <QuickAction icon="💬" label="Quick Log" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="🎁" label="Gift Ideas" accentColor={ACCENT} onPress={() => {}} />
      </View>

      {/* Your Items */}
      <SectionHeader title="Your Items" subtitle="Relationship tasks & notes" />
      <ItemList circleContext="RELATIONSHIPS" showCompleted={false} maxItems={5} />

      {/* Health Summary */}
      <View style={styles.healthSummary}>
        <View style={styles.healthItem}>
          <View style={[styles.healthDotLarge, { backgroundColor: '#22c55e' }]} />
          <Text style={styles.healthCount}>
            {capsules?.filter(c => c.relationship_health?.status === 'thriving').length || 0}
          </Text>
        </View>
        <View style={styles.healthItem}>
          <View style={[styles.healthDotLarge, { backgroundColor: '#84cc16' }]} />
          <Text style={styles.healthCount}>
            {capsules?.filter(c => c.relationship_health?.status === 'healthy').length || 0}
          </Text>
        </View>
        <View style={styles.healthItem}>
          <View style={[styles.healthDotLarge, { backgroundColor: '#eab308' }]} />
          <Text style={styles.healthCount}>
            {capsules?.filter(c => 
              c.relationship_health?.status === 'needs_attention' || 
              c.relationship_health?.status === 'at_risk'
            ).length || 0}
          </Text>
        </View>
      </View>

      {/* Capsules List */}
      <SectionHeader 
        title="Your Capsules" 
        subtitle={`${capsules?.length || 0} connections`}
        rightContent={<Text style={styles.sortLabel}>Sort ▼</Text>}
      />
      
      {capsulesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={ACCENT} />
        </View>
      ) : capsules && capsules.length > 0 ? (
        <View style={styles.capsuleList}>
          {capsules.map((capsule, index) => (
            <CapsuleCard
              key={capsule.id}
              capsule={capsule}
              index={index}
              onPress={() => handleOpenCapsule(capsule.id)}
            />
          ))}
        </View>
      ) : (
        <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💫</Text>
          <Text style={styles.emptyTitle}>No capsules yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first relationship capsule to start tracking meaningful connections
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setIsInviteModalVisible(true)}
          >
            <Text style={styles.createButtonText}>Create Capsule</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
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

      {/* Invite Modal */}
      <InvitePartnerModal
        visible={isInviteModalVisible}
        onClose={() => setIsInviteModalVisible(false)}
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
});
