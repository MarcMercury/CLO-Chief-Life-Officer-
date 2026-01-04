/**
 * SelfView - Personal Space with Enhanced Features
 * 
 * Features:
 * 1. My Lists with Buckets - Horizontal scroll of categories (General, Groceries, Work, Wishlist)
 * 2. Scratchpad with Pins & Colors - Pinnable notes with color coding
 * 3. The Daily 3 with Weekly Context - Track daily goals with 7-day history view
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInRight,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import CreateItemModal from '../components/modals/CreateItemModal';
import NoteDetailModal from '../components/modals/NoteDetailModal';
import { useItems, useUpdateItemStatus, useCreateItem, useDeleteItem, useUpdateItem } from '../hooks/useItems';
import { ItemWithCircles } from '../types/database';
import { colors, spacing, borderRadius } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT = colors.self;

// ============================================
// TYPES
// ============================================

type ListBucket = 'all' | 'general' | 'groceries' | 'work' | 'wishlist';
type NoteColor = 'default' | 'yellow' | 'blue' | 'green' | 'pink';

interface BucketConfig {
  id: ListBucket;
  label: string;
  icon: string;
}

interface DailyGoal {
  id: string;
  label: string;
  icon: string;
}

// ============================================
// CONSTANTS
// ============================================

const BUCKETS: BucketConfig[] = [
  { id: 'all', label: 'All', icon: '📋' },
  { id: 'general', label: 'General', icon: '📝' },
  { id: 'groceries', label: 'Groceries', icon: '🛒' },
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'wishlist', label: 'Wishlist', icon: '⭐' },
];

const NOTE_COLORS: Record<NoteColor, string> = {
  default: colors.surface,
  yellow: '#FEF3C7',
  blue: '#DBEAFE',
  green: '#D1FAE5',
  pink: '#FCE7F3',
};

const NOTE_TEXT_COLORS: Record<NoteColor, string> = {
  default: colors.textPrimary,
  yellow: '#92400E',
  blue: '#1E40AF',
  green: '#065F46',
  pink: '#9D174D',
};

const DAILY_GOALS: DailyGoal[] = [
  { id: 'water', label: 'Drink Water', icon: '💧' },
  { id: 'exercise', label: 'Exercise', icon: '🏃' },
  { id: 'mindful', label: 'Mindfulness', icon: '🧘' },
];

const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

// ============================================
// MAIN COMPONENT
// ============================================

export default function SelfView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<ListBucket>('all');
  const [showWeeklyView, setShowWeeklyView] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ItemWithCircles | null>(null);
  
  // Fetch items from database
  const { data: allItems, isLoading, refetch } = useItems('SELF');
  const { mutate: updateStatus } = useUpdateItemStatus();
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();
  const updateItem = useUpdateItem();
  
  // Filter items by type and bucket
  const { tasks, notes, completedTasks } = useMemo(() => {
    const filtered = allItems || [];
    
    // Get bucket from metadata or default to 'general'
    const getBucket = (item: ItemWithCircles): ListBucket => {
      return (item.metadata as any)?.bucket || 'general';
    };
    
    const allTasks = filtered.filter(item => item.item_type === 'TASK');
    const allNotes = filtered.filter(item => item.item_type === 'NOTE');
    
    // Filter by selected bucket
    const filteredTasks = selectedBucket === 'all' 
      ? allTasks 
      : allTasks.filter(item => getBucket(item) === selectedBucket);
    
    return {
      tasks: filteredTasks.filter(t => t.status !== 'COMPLETED'),
      completedTasks: filteredTasks.filter(t => t.status === 'COMPLETED'),
      notes: allNotes,
    };
  }, [allItems, selectedBucket]);
  
  // Sort notes - pinned first
  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      const aPinned = (a.metadata as any)?.pinned || false;
      const bPinned = (b.metadata as any)?.pinned || false;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notes]);
  
  // Daily goals tracking
  const dailyProgress = useMemo(() => {
    const today = new Date().toDateString();
    const todayItems = (allItems || []).filter(item => {
      const metadata = item.metadata as any;
      return metadata?.dailyGoal && new Date(item.created_at).toDateString() === today;
    });
    
    return DAILY_GOALS.map(goal => ({
      ...goal,
      completed: todayItems.some(item => (item.metadata as any)?.goalId === goal.id),
    }));
  }, [allItems]);
  
  // Weekly history for Daily 3
  const weeklyHistory = useMemo(() => {
    const days: { date: Date; goals: Record<string, boolean> }[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayItems = (allItems || []).filter(item => {
        const metadata = item.metadata as any;
        return metadata?.dailyGoal && new Date(item.created_at).toDateString() === dateStr;
      });
      
      const goals: Record<string, boolean> = {};
      DAILY_GOALS.forEach(goal => {
        goals[goal.id] = dayItems.some(item => (item.metadata as any)?.goalId === goal.id);
      });
      
      days.push({ date, goals });
    }
    
    return days;
  }, [allItems]);
  
  // Toggle task completion
  const toggleTask = useCallback((item: ItemWithCircles) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateStatus({
      itemId: item.id,
      status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
    });
  }, [updateStatus]);
  
  // Handle bucket selection
  const handleBucketSelect = useCallback((bucket: ListBucket) => {
    Haptics.selectionAsync();
    setSelectedBucket(bucket);
  }, []);
  
  // Quick add task
  const handleQuickAdd = useCallback(async () => {
    if (!quickAddText.trim()) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    await createItem.mutateAsync({
      title: quickAddText.trim(),
      item_type: 'TASK',
      circles: ['SELF'],
      metadata: {
        bucket: selectedBucket === 'all' ? 'general' : selectedBucket,
      },
    });
    
    setQuickAddText('');
    setShowQuickAdd(false);
  }, [quickAddText, selectedBucket, createItem]);
  
  // Toggle daily goal
  const toggleDailyGoal = useCallback(async (goalId: string) => {
    const isCompleted = dailyProgress.find(g => g.id === goalId)?.completed;
    
    if (isCompleted) {
      Haptics.selectionAsync();
      return; // Don't uncomplete for now
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    await createItem.mutateAsync({
      title: `Daily: ${DAILY_GOALS.find(g => g.id === goalId)?.label}`,
      item_type: 'NOTE',
      circles: ['SELF'],
      metadata: {
        dailyGoal: true,
        goalId,
      },
    });
  }, [dailyProgress, createItem]);

  // Handle note press - open detail modal
  const handleNotePress = useCallback((note: ItemWithCircles) => {
    Haptics.selectionAsync();
    setSelectedNote(note);
  }, []);

  // Handle note update (pin/color/title)
  const handleNoteUpdate = useCallback(async (noteId: string, updates: { 
    title?: string; 
    pinned?: boolean; 
    color?: NoteColor 
  }) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const currentMetadata = (note.metadata as any) || {};
    const newMetadata = { ...currentMetadata };
    
    if (updates.pinned !== undefined) newMetadata.pinned = updates.pinned;
    if (updates.color !== undefined) newMetadata.color = updates.color;

    await updateItem.mutateAsync({
      itemId: noteId,
      updates: {
        title: updates.title || note.title,
        metadata: newMetadata,
      },
    });
  }, [notes, updateItem]);

  // Handle note delete
  const handleNoteDelete = useCallback(async (noteId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteItem.mutateAsync(noteId);
    setSelectedNote(null);
  }, [deleteItem]);

  // Handle task delete
  const handleTaskDelete = useCallback((task: ItemWithCircles) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteItem.mutateAsync(task.id);
          },
        },
      ]
    );
  }, [deleteItem]);

  const totalTasks = tasks.length + completedTasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  const completedDaily = dailyProgress.filter(g => g.completed).length;

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🧘</Text>
          <View>
            <Text style={styles.title}>Self</Text>
            <Text style={styles.subtitle}>Your personal space</Text>
          </View>
        </View>
        
        {/* Add Button */}
        <TouchableOpacity 
          style={styles.headerAddButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowCreateModal(true);
          }}
        >
          <Text style={styles.headerAddIcon}>+</Text>
        </TouchableOpacity>
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
            
            {/* ============================================ */}
            {/* SECTION 1: THE DAILY 3 */}
            {/* ============================================ */}
            <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionIcon}>🎯</Text>
                  <Text style={styles.sectionTitle}>The Daily 3</Text>
                </View>
                <TouchableOpacity 
                  style={styles.calendarButton}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowWeeklyView(!showWeeklyView);
                  }}
                >
                  <Text style={styles.calendarIcon}>📅</Text>
                </TouchableOpacity>
              </View>
              
              {/* Weekly View (flip card) */}
              {showWeeklyView ? (
                <Animated.View 
                  entering={FadeIn.duration(300)}
                  style={styles.weeklyCard}
                >
                  <Text style={styles.weeklyTitle}>Last 7 Days</Text>
                  <View style={styles.weeklyGrid}>
                    {/* Day labels */}
                    <View style={styles.weeklyRow}>
                      <View style={styles.weeklyGoalLabel} />
                      {weeklyHistory.map((day, i) => (
                        <View key={i} style={styles.weeklyDayCell}>
                          <Text style={styles.weeklyDayText}>
                            {day.date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                          </Text>
                        </View>
                      ))}
                    </View>
                    
                    {/* Goal rows */}
                    {DAILY_GOALS.map(goal => (
                      <View key={goal.id} style={styles.weeklyRow}>
                        <View style={styles.weeklyGoalLabel}>
                          <Text style={styles.weeklyGoalIcon}>{goal.icon}</Text>
                        </View>
                        {weeklyHistory.map((day, i) => (
                          <View key={i} style={styles.weeklyDayCell}>
                            <View style={[
                              styles.weeklyDot,
                              day.goals[goal.id] ? styles.weeklyDotComplete : styles.weeklyDotMissed,
                            ]} />
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                  
                  {/* Streak indicator */}
                  <View style={styles.streakRow}>
                    <Text style={styles.streakText}>
                      🔥 Current streak: {calculateStreak(weeklyHistory)} days
                    </Text>
                  </View>
                </Animated.View>
              ) : (
                <View style={styles.dailyGoalsRow}>
                  {dailyProgress.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.dailyGoalCard,
                        goal.completed && styles.dailyGoalCardComplete,
                      ]}
                      onPress={() => toggleDailyGoal(goal.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.dailyGoalIcon}>{goal.icon}</Text>
                      <Text style={[
                        styles.dailyGoalLabel,
                        goal.completed && styles.dailyGoalLabelComplete,
                      ]}>
                        {goal.label}
                      </Text>
                      {goal.completed && (
                        <View style={styles.dailyCheckmark}>
                          <Text style={styles.dailyCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <Text style={styles.dailyProgress}>
                {completedDaily}/3 completed today
              </Text>
            </Animated.View>
            
            {/* ============================================ */}
            {/* SECTION 2: MY LISTS WITH BUCKETS */}
            {/* ============================================ */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionIcon}>☑️</Text>
                  <Text style={styles.sectionTitle}>My Lists</Text>
                </View>
                <TouchableOpacity 
                  style={styles.quickAddButton}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowQuickAdd(!showQuickAdd);
                  }}
                >
                  <Text style={styles.quickAddIcon}>+</Text>
                </TouchableOpacity>
              </View>
              
              {/* Bucket Tabs */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.bucketScroll}
                contentContainerStyle={styles.bucketScrollContent}
              >
                {BUCKETS.map((bucket) => (
                  <TouchableOpacity
                    key={bucket.id}
                    style={[
                      styles.bucketTab,
                      selectedBucket === bucket.id && styles.bucketTabActive,
                    ]}
                    onPress={() => handleBucketSelect(bucket.id)}
                  >
                    <Text style={styles.bucketIcon}>{bucket.icon}</Text>
                    <Text style={[
                      styles.bucketLabel,
                      selectedBucket === bucket.id && styles.bucketLabelActive,
                    ]}>
                      {bucket.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              {/* Quick Add Input */}
              {showQuickAdd && (
                <Animated.View 
                  entering={SlideInDown.duration(200)}
                  style={styles.quickAddContainer}
                >
                  <TextInput
                    style={styles.quickAddInput}
                    placeholder={`Add to ${selectedBucket === 'all' ? 'General' : BUCKETS.find(b => b.id === selectedBucket)?.label}...`}
                    placeholderTextColor={colors.textTertiary}
                    value={quickAddText}
                    onChangeText={setQuickAddText}
                    onSubmitEditing={handleQuickAdd}
                    returnKeyType="done"
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={styles.quickAddSubmit}
                    onPress={handleQuickAdd}
                  >
                    <Text style={styles.quickAddSubmitText}>Add</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
              
              {/* Task List */}
              <View style={styles.taskList}>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <SwipeableTaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onToggle={() => toggleTask(task)}
                      onSnooze={() => {
                        // Snooze to tomorrow
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      }}
                      onDelete={() => handleTaskDelete(task)}
                    />
                  ))
                ) : (
                  <View style={styles.emptyList}>
                    <Text style={styles.emptyListText}>
                      No tasks in {selectedBucket === 'all' ? 'any list' : `"${BUCKETS.find(b => b.id === selectedBucket)?.label}"`}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Completed count */}
              {completedTasks.length > 0 && (
                <Text style={styles.completedCount}>
                  ✓ {completedTasks.length} completed
                </Text>
              )}
            </Animated.View>
            
            {/* ============================================ */}
            {/* SECTION 3: SCRATCHPAD WITH PINS & COLORS */}
            {/* ============================================ */}
            <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionIcon}>📌</Text>
                  <Text style={styles.sectionTitle}>Scratchpad</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addNoteButton}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowCreateModal(true);
                  }}
                >
                  <Text style={styles.addNoteIcon}>+</Text>
                </TouchableOpacity>
              </View>
              
              {/* Notes Grid */}
              <View style={styles.notesGrid}>
                {sortedNotes.length > 0 ? (
                  sortedNotes.slice(0, 6).map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      index={index}
                      onPress={() => handleNotePress(note)}
                    />
                  ))
                ) : (
                  <View style={styles.emptyNotes}>
                    <Text style={styles.emptyNotesIcon}>📝</Text>
                    <Text style={styles.emptyNotesText}>No notes yet</Text>
                  </View>
                )}
              </View>
            </Animated.View>
            
            {/* Bottom padding */}
            <View style={styles.bottomPadding} />
          </Animated.View>
        )}
      </ScrollView>

      {/* Create Item Modal */}
      <CreateItemModal 
        visible={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />

      {/* Note Detail Modal */}
      <NoteDetailModal
        visible={!!selectedNote}
        note={selectedNote}
        onClose={() => setSelectedNote(null)}
        onUpdate={handleNoteUpdate}
        onDelete={handleNoteDelete}
      />
    </GestureHandlerRootView>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateStreak(history: { date: Date; goals: Record<string, boolean> }[]): number {
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const day = history[i];
    const allComplete = Object.values(day.goals).every(v => v);
    if (allComplete) {
      streak++;
    } else if (i < history.length - 1) {
      // Allow today to be incomplete but check previous days
      break;
    }
  }
  return streak;
}

// ============================================
// SWIPEABLE TASK CARD
// ============================================

interface SwipeableTaskCardProps {
  task: ItemWithCircles;
  index: number;
  onToggle: () => void;
  onSnooze: () => void;
  onDelete: () => void;
}

function SwipeableTaskCard({ task, index, onToggle, onSnooze, onDelete }: SwipeableTaskCardProps) {
  const translateX = useSharedValue(0);
  const isCompleted = task.status === 'COMPLETED';
  const bucket = (task.metadata as any)?.bucket || 'general';
  const bucketConfig = BUCKETS.find(b => b.id === bucket) || BUCKETS[1];
  
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Allow more distance for delete (far left)
      translateX.value = Math.max(-150, Math.min(100, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right -> Complete
        translateX.value = withTiming(0);
        runOnJS(onToggle)();
      } else if (event.translationX < -SWIPE_THRESHOLD * 1.5) {
        // Swipe far left -> Delete
        translateX.value = withTiming(0);
        runOnJS(onDelete)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left -> Snooze
        translateX.value = withTiming(0);
        runOnJS(onSnooze)();
      } else {
        translateX.value = withSpring(0);
      }
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  const leftIndicatorStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 20 ? Math.min(translateX.value / SWIPE_THRESHOLD, 1) : 0,
  }));
  
  const rightIndicatorStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 && translateX.value > -SWIPE_THRESHOLD * 1.3
      ? Math.min(Math.abs(translateX.value) / SWIPE_THRESHOLD, 1) 
      : 0,
  }));

  const deleteIndicatorStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -SWIPE_THRESHOLD * 1.3
      ? Math.min((Math.abs(translateX.value) - SWIPE_THRESHOLD * 1.3) / (SWIPE_THRESHOLD * 0.2), 1)
      : 0,
  }));
  
  return (
    <Animated.View entering={FadeInRight.delay(index * 30).duration(200)}>
      <View style={styles.swipeContainer}>
        {/* Left indicator (Complete) */}
        <Animated.View style={[styles.swipeIndicatorLeft, leftIndicatorStyle]}>
          <Text style={styles.swipeIndicatorIcon}>✓</Text>
        </Animated.View>
        
        {/* Right indicator (Snooze) */}
        <Animated.View style={[styles.swipeIndicatorRight, rightIndicatorStyle]}>
          <Text style={styles.swipeIndicatorIcon}>⏰</Text>
        </Animated.View>

        {/* Delete indicator (far right) */}
        <Animated.View style={[styles.swipeIndicatorDelete, deleteIndicatorStyle]}>
          <Text style={styles.swipeIndicatorIcon}>🗑️</Text>
        </Animated.View>
        
        <GestureDetector gesture={panGesture}>
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              style={styles.taskCard}
              onPress={onToggle}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
                {isCompleted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]} numberOfLines={1}>
                  {task.title}
                </Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskBucket}>{bucketConfig.icon} {bucketConfig.label}</Text>
                  {task.due_date && (
                    <Text style={styles.taskDue}>
                      • {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

// ============================================
// NOTE CARD WITH PINS & COLORS
// ============================================

interface NoteCardProps {
  note: ItemWithCircles;
  index: number;
  onPress: () => void;
}

function NoteCard({ note, index, onPress }: NoteCardProps) {
  const metadata = note.metadata as any;
  const isPinned = metadata?.pinned || false;
  const noteColor: NoteColor = metadata?.color || 'default';
  const backgroundColor = NOTE_COLORS[noteColor];
  const textColor = NOTE_TEXT_COLORS[noteColor];
  
  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 50).duration(200)}
      style={styles.noteCardWrapper}
    >
      <TouchableOpacity
        style={[
          styles.noteCard,
          { backgroundColor },
          noteColor !== 'default' && styles.noteCardColored,
        ]}
        activeOpacity={0.7}
        onPress={onPress}
      >
        {isPinned && (
          <View style={styles.pinIcon}>
            <Text style={styles.pinEmoji}>📌</Text>
          </View>
        )}
        <Text 
          style={[styles.noteTitle, { color: textColor }]} 
          numberOfLines={3}
        >
          {note.title}
        </Text>
        <Text style={[styles.noteDate, { color: textColor, opacity: 0.6 }]}>
          {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      </TouchableOpacity>
    </Animated.View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: ACCENT,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAddIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  
  // Sections
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  
  // Daily 3
  calendarButton: {
    padding: spacing.xs,
  },
  calendarIcon: {
    fontSize: 20,
  },
  dailyGoalsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dailyGoalCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dailyGoalCardComplete: {
    backgroundColor: `${colors.success}15`,
    borderColor: colors.success,
  },
  dailyGoalIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  dailyGoalLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dailyGoalLabelComplete: {
    color: colors.success,
  },
  dailyCheckmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyCheckmarkText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  dailyProgress: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  
  // Weekly View
  weeklyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  weeklyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  weeklyGrid: {
    gap: spacing.sm,
  },
  weeklyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyGoalLabel: {
    width: 30,
    alignItems: 'center',
  },
  weeklyGoalIcon: {
    fontSize: 16,
  },
  weeklyDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weeklyDayText: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  weeklyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  weeklyDotComplete: {
    backgroundColor: colors.success,
  },
  weeklyDotMissed: {
    backgroundColor: colors.textMuted,
  },
  streakRow: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  
  // Buckets
  bucketScroll: {
    marginBottom: spacing.md,
  },
  bucketScrollContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  bucketTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bucketTabActive: {
    backgroundColor: `${ACCENT}20`,
    borderColor: ACCENT,
  },
  bucketIcon: {
    fontSize: 14,
  },
  bucketLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  bucketLabelActive: {
    color: ACCENT,
    fontWeight: '600',
  },
  
  // Quick Add
  quickAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${ACCENT}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddIcon: {
    fontSize: 18,
    color: ACCENT,
    fontWeight: '500',
  },
  quickAddContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickAddInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAddSubmit: {
    backgroundColor: ACCENT,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  quickAddSubmitText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Task List
  taskList: {
    gap: spacing.sm,
  },
  emptyList: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  completedCount: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  
  // Swipeable Task
  swipeContainer: {
    position: 'relative',
  },
  swipeIndicatorLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: `${colors.success}20`,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeIndicatorRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: `${colors.warning}20`,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeIndicatorDelete: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: `${colors.error}30`,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeIndicatorIcon: {
    fontSize: 20,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: ACCENT,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  taskBucket: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  taskDue: {
    fontSize: 11,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  
  // Notes Grid
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  noteCardWrapper: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
  },
  noteCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteCardColored: {
    borderColor: 'transparent',
  },
  pinIcon: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  pinEmoji: {
    fontSize: 14,
  },
  noteTitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  noteDate: {
    fontSize: 11,
  },
  addNoteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${ACCENT}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNoteIcon: {
    fontSize: 18,
    color: ACCENT,
    fontWeight: '500',
  },
  emptyNotes: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    width: '100%',
  },
  emptyNotesIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyNotesText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  
  bottomPadding: {
    height: 40,
  },
});
