import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CircleTabBar, QuickAction, ItemCard, SectionHeader } from '../components/shared';
import { ItemList } from '../components/items';
import CreateItemModal from '../components/modals/CreateItemModal';
import { useItems, useCreateItem, useUpdateItemStatus } from '../hooks/useItems';
import { ItemWithCircles } from '../types/database';

const ACCENT = '#6366f1';

const TABS = [
  { key: 'today', label: 'Today', icon: '☀️' },
  { key: 'journal', label: 'Journal', icon: '📔' },
  { key: 'goals', label: 'Goals', icon: '🎯' },
];

// Mood emoji to score mapping
const MOOD_SCORES: Record<string, number> = {
  '😢': 1,
  '😕': 2,
  '😐': 3,
  '🙂': 4,
  '😊': 5,
};

export default function SelfView() {
  const [activeTab, setActiveTab] = useState('today');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isSavingMood, setIsSavingMood] = useState(false);
  
  // Fetch items from database
  const { data: allItems, isLoading, error, refetch } = useItems('SELF');
  const { mutate: createItem } = useCreateItem();
  const { mutate: updateStatus } = useUpdateItemStatus();
  
  // Filter items by type
  const tasks = useMemo(() => 
    allItems?.filter(item => item.item_type === 'TASK') || [], 
    [allItems]
  );
  
  const notes = useMemo(() => 
    allItems?.filter(item => item.item_type === 'NOTE') || [], 
    [allItems]
  );
  
  const events = useMemo(() => 
    allItems?.filter(item => item.item_type === 'EVENT') || [], 
    [allItems]
  );
  
  // Get mood logs from items with type NOTE and metadata.mood
  const moodLogs = useMemo(() => 
    allItems?.filter(item => 
      item.item_type === 'NOTE' && 
      (item.metadata as any)?.mood
    ).slice(0, 7) || [], 
    [allItems]
  );
  
  // Toggle task completion (persists to DB)
  const toggleTask = (item: ItemWithCircles) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateStatus({
      itemId: item.id,
      status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
    });
  };
  
  // Log mood as a NOTE item with mood metadata
  const logMood = async (emoji: string) => {
    setSelectedMood(emoji);
    setIsSavingMood(true);
    Haptics.selectionAsync();
    
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    createItem({
      title: `Mood: ${emoji} - ${today}`,
      item_type: 'NOTE',
      circles: ['SELF'],
      metadata: {
        mood: emoji,
        mood_score: MOOD_SCORES[emoji] || 3,
        logged_at: new Date().toISOString(),
      },
    }, {
      onSuccess: () => {
        setIsSavingMood(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onError: () => {
        setIsSavingMood(false);
        setSelectedMood(null);
      },
    });
  };
  
  // Quick create a note
  const quickNote = () => {
    setShowCreateModal(true);
  };

  const renderTodayTab = () => {
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions - Now connected! */}
      <View style={styles.quickActions}>
        <QuickAction icon="✏️" label="Add Task" accentColor={ACCENT} onPress={() => setShowCreateModal(true)} />
        <QuickAction icon="📝" label="Quick Note" accentColor={ACCENT} onPress={quickNote} />
        <QuickAction icon="😊" label="Log Mood" accentColor={ACCENT} onPress={() => setActiveTab('journal')} />
        <QuickAction icon="⏱️" label="Focus" accentColor={ACCENT} onPress={() => {}} />
      </View>

      {/* Today's Progress - Now from real data! */}
      <View style={styles.progressCard}>
        <Text style={styles.progressLabel}>Today's Progress</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressValue}>
            {completedTasks}/{totalTasks}
          </Text>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { width: `${progressPercent}%` }
            ]} />
          </View>
        </View>
      </View>

      {/* Database Items - This was already connected! */}
      <SectionHeader title="Your Items" subtitle="From all your devices" />
      <ItemList circleContext="SELF" showCompleted={false} />

      {/* Tasks from Database */}
      <SectionHeader 
        title="Tasks" 
        subtitle={isLoading ? 'Loading...' : `${tasks.filter(t => t.status !== 'COMPLETED').length} remaining`} 
      />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={ACCENT} />
        </View>
      ) : error ? (
        <TouchableOpacity style={styles.errorContainer} onPress={() => refetch()}>
          <Text style={styles.errorText}>Failed to load tasks</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyText}>No tasks yet!</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.addButtonText}>Create your first task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.taskList}>
          {tasks.map((task, index) => (
            <ItemCard
              key={task.id}
              title={task.title}
              subtitle={task.due_date ? new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'No due date'}
              icon={task.status === 'COMPLETED' ? '✓' : '○'}
              accentColor={ACCENT}
              index={index}
              isCompleted={task.status === 'COMPLETED'}
              onPress={() => toggleTask(task)}
              rightContent={
                <View style={[styles.checkbox, task.status === 'COMPLETED' && styles.checkboxChecked]}>
                  {task.status === 'COMPLETED' && <Text style={styles.checkmark}>✓</Text>}
                </View>
              }
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
  };

  const renderJournalTab = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions - Now connected! */}
      <View style={styles.quickActions}>
        <QuickAction icon="✍️" label="New Entry" accentColor={ACCENT} onPress={() => setShowCreateModal(true)} size="large" />
        <QuickAction icon="🔍" label="Search" accentColor={ACCENT} onPress={() => {}} size="large" />
      </View>

      {/* Mood Check - Now persists to database! */}
      <View style={styles.moodCard}>
        <Text style={styles.moodLabel}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {['😢', '😕', '😐', '🙂', '😊'].map((emoji, i) => (
            <TouchableOpacity 
              key={i} 
              style={[
                styles.moodOption,
                selectedMood === emoji && styles.moodOptionSelected
              ]}
              onPress={() => logMood(emoji)}
              disabled={isSavingMood}
            >
              <Text style={[
                styles.moodEmoji,
                isSavingMood && selectedMood === emoji && styles.moodEmojiSaving
              ]}>
                {emoji}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {isSavingMood && (
          <Text style={styles.savingText}>Saving mood...</Text>
        )}
      </View>

      {/* Recent Mood Logs */}
      {moodLogs.length > 0 && (
        <>
          <SectionHeader title="Mood History" subtitle="Your recent check-ins" />
          <View style={styles.moodHistory}>
            {moodLogs.map((log, index) => {
              const metadata = log.metadata as any;
              return (
                <Animated.View 
                  key={log.id}
                  entering={FadeInUp.delay(index * 50).duration(300)}
                  style={styles.moodHistoryItem}
                >
                  <Text style={styles.moodHistoryEmoji}>{metadata?.mood || '😐'}</Text>
                  <Text style={styles.moodHistoryDate}>
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </Animated.View>
              );
            })}
          </View>
        </>
      )}

      {/* Recent Notes/Entries - Now from database! */}
      <SectionHeader title="Recent Notes" subtitle={`${notes.length} entries`} />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={ACCENT} />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No journal entries yet</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.addButtonText}>Write your first entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.taskList}>
          {notes.slice(0, 10).map((note, index) => {
            const metadata = note.metadata as any;
            return (
              <ItemCard
                key={note.id}
                title={note.title}
                subtitle={new Date(note.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
                icon={metadata?.mood || '📝'}
                accentColor={ACCENT}
                index={index}
                onPress={() => {}}
              />
            );
          })}
        </View>
      )}
    </Animated.View>
  );

  const renderGoalsTab = () => {
    // Goals are stored as items with item_type='EVENT' and goal metadata
    const goals = allItems?.filter(item => 
      item.item_type === 'EVENT' && (item.metadata as any)?.is_goal
    ) || [];
    
    return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      {/* Quick Actions - Now connected! */}
      <View style={styles.quickActions}>
        <QuickAction icon="🎯" label="New Goal" accentColor={ACCENT} onPress={() => setShowCreateModal(true)} size="large" />
        <QuickAction icon="📊" label="Stats" accentColor={ACCENT} onPress={() => {}} size="large" />
      </View>

      {/* Active Goals - From database! */}
      <SectionHeader title="Active Goals" subtitle={goals.length > 0 ? "Keep pushing!" : "Set your first goal"} />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={ACCENT} />
        </View>
      ) : goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>No goals yet</Text>
          <Text style={styles.emptySubtext}>Create events with goal tracking</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.addButtonText}>Create your first goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.goalList}>
          {goals.map((goal, index) => {
            const metadata = goal.metadata as any;
            const progress = metadata?.progress || 0;
            
            return (
              <Animated.View 
                key={goal.id} 
                entering={FadeInUp.delay(index * 50).duration(300)}
                style={styles.goalCard}
              >
                <View style={styles.goalHeader}>
                  <Text style={styles.goalIcon}>{metadata?.icon || '🎯'}</Text>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalPercent}>{progress}%</Text>
                </View>
                <View style={styles.goalBar}>
                  <Animated.View style={[styles.goalFill, { width: `${progress}%` }]} />
                </View>
              </Animated.View>
            );
          })}
        </View>
      )}
      
      {/* Recent Tasks as mini-goals */}
      <SectionHeader title="Daily Habits" subtitle="Your recurring tasks" />
      <View style={styles.taskList}>
        {tasks.slice(0, 3).map((task, index) => (
          <ItemCard
            key={task.id}
            title={task.title}
            subtitle={task.status === 'COMPLETED' ? 'Completed' : 'Pending'}
            icon={task.status === 'COMPLETED' ? '✅' : '⭕'}
            accentColor={ACCENT}
            index={index}
            isCompleted={task.status === 'COMPLETED'}
            onPress={() => toggleTask(task)}
          />
        ))}
      </View>
    </Animated.View>
  );
  };

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
      
      {/* Create Item Modal - Connected to Supabase! */}
      <CreateItemModal 
        visible={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
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
    borderRadius: 12,
  },
  moodOptionSelected: {
    backgroundColor: `${ACCENT}30`,
    transform: [{ scale: 1.1 }],
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodEmojiSaving: {
    opacity: 0.5,
  },
  savingText: {
    color: '#888',
    fontSize: 12,
    marginTop: 12,
  },
  moodHistory: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: `${ACCENT}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  moodHistoryItem: {
    alignItems: 'center',
  },
  moodHistoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodHistoryDate: {
    fontSize: 10,
    color: '#888',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  retryText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: `${ACCENT}08`,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
    opacity: 0.7,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
