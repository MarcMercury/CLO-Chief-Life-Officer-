import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CircleTabBar, QuickAction, ItemCard, SectionHeader } from '../components/shared';
import { ItemList } from '../components/items';

const ACCENT = '#6366f1';

const TABS = [
  { key: 'today', label: 'Today', icon: '☀️' },
  { key: 'journal', label: 'Journal', icon: '📔' },
  { key: 'goals', label: 'Goals', icon: '🎯' },
];

// Mock data
const initialTasks = [
  { id: '1', title: 'Morning meditation', icon: '🧘', time: '7:00 AM', done: true },
  { id: '2', title: 'Review weekly goals', icon: '📋', time: '9:00 AM', done: false },
  { id: '3', title: 'Exercise', icon: '💪', time: '12:00 PM', done: false },
  { id: '4', title: 'Read 30 minutes', icon: '📚', time: '8:00 PM', done: false },
];

const mockJournalEntries = [
  { id: '1', date: 'Today', preview: 'Feeling grateful for...', mood: '😊' },
  { id: '2', date: 'Yesterday', preview: 'Had a productive meeting...', mood: '💪' },
  { id: '3', date: 'Dec 24', preview: 'Christmas Eve celebrations...', mood: '🎄' },
];

const mockGoals = [
  { id: '1', title: 'Meditate daily', progress: 85, icon: '🧘' },
  { id: '2', title: 'Read 12 books', progress: 67, icon: '📚' },
  { id: '3', title: 'Exercise 4x/week', progress: 50, icon: '💪' },
];

export default function SelfView() {
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const renderTodayTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="✏️" label="Add Task" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="📝" label="Quick Note" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="😊" label="Log Mood" accentColor={ACCENT} onPress={() => {}} />
        <QuickAction icon="⏱️" label="Focus" accentColor={ACCENT} onPress={() => {}} />
      </View>

      {/* Today's Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Today's Progress</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressValue}>
            {tasks.filter(t => t.done).length}/{tasks.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { width: `${(tasks.filter(t => t.done).length / tasks.length) * 100}%` }
            ]} />
          </View>
        </View>
      </View>

      {/* Database Items */}
      <SectionHeader title="Your Items" subtitle="From all your devices" />
      <ItemList circleContext="SELF" showCompleted={false} />

      {/* Tasks */}
      <SectionHeader title="Sample Tasks" subtitle={`${tasks.filter(t => !t.done).length} remaining`} />
      <View style={styles.taskList}>
        {tasks.map((task, index) => (
          <ItemCard
            key={task.id}
            title={task.title}
            subtitle={task.time}
            icon={task.icon}
            accentColor={ACCENT}
            index={index}
            isCompleted={task.done}
            onPress={() => toggleTask(task.id)}
            rightContent={
              <View style={[styles.checkbox, task.done && styles.checkboxChecked]}>
                {task.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
            }
          />
        ))}
      </View>
    </Animated.View>
  );

  const renderJournalTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="✍️" label="New Entry" accentColor={ACCENT} onPress={() => {}} size="large" />
        <QuickAction icon="🔍" label="Search" accentColor={ACCENT} onPress={() => {}} size="large" />
      </View>

      {/* Mood Check */}
      <View style={styles.moodCard}>
        <Text style={styles.moodLabel}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {['😢', '😕', '😐', '🙂', '😊'].map((emoji, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.moodOption}
              onPress={() => Haptics.selectionAsync()}
            >
              <Text style={styles.moodEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Entries */}
      <SectionHeader title="Recent Entries" />
      <View style={styles.taskList}>
        {mockJournalEntries.map((entry, index) => (
          <ItemCard
            key={entry.id}
            title={entry.preview}
            subtitle={entry.date}
            icon={entry.mood}
            accentColor={ACCENT}
            index={index}
            onPress={() => {}}
          />
        ))}
      </View>
    </Animated.View>
  );

  const renderGoalsTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickAction icon="🎯" label="New Goal" accentColor={ACCENT} onPress={() => {}} size="large" />
        <QuickAction icon="📊" label="Stats" accentColor={ACCENT} onPress={() => {}} size="large" />
      </View>

      {/* Active Goals */}
      <SectionHeader title="Active Goals" subtitle="Keep pushing!" />
      <View style={styles.goalList}>
        {mockGoals.map((goal, index) => (
          <Animated.View 
            key={goal.id} 
            entering={FadeInUp.delay(index * 50).duration(300)}
            style={styles.goalCard}
          >
            <View style={styles.goalHeader}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalPercent}>{goal.progress}%</Text>
            </View>
            <View style={styles.goalBar}>
              <Animated.View style={[styles.goalFill, { width: `${goal.progress}%` }]} />
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
        <Text style={styles.title}>Self</Text>
        <Text style={styles.subtitle}>Your personal sanctuary</Text>
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
        {activeTab === 'today' && renderTodayTab()}
        {activeTab === 'journal' && renderJournalTab()}
        {activeTab === 'goals' && renderGoalsTab()}
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
  progressCard: {
    backgroundColor: `${ACCENT}15`,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '300',
    color: ACCENT,
    width: 50,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 4,
  },
  taskList: {
    gap: 10,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: ACCENT,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  moodCard: {
    backgroundColor: `${ACCENT}10`,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 16,
  },
  moodOption: {
    padding: 8,
  },
  moodEmoji: {
    fontSize: 32,
  },
  goalList: {
    gap: 12,
  },
  goalCard: {
    backgroundColor: `${ACCENT}10`,
    borderRadius: 12,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 20,
  },
  goalTitle: {
    flex: 1,
    fontSize: 16,
    color: '#E0E0E0',
  },
  goalPercent: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT,
  },
  goalBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
});
