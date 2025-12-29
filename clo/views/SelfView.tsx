import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import CreateItemModal from '../components/modals/CreateItemModal';
import { useItems, useUpdateItemStatus } from '../hooks/useItems';
import { ItemWithCircles } from '../types/database';

const ACCENT = '#6366f1';

// Mood emoji options
const MOODS = ['😢', '😕', '😐', '🙂', '😊'];

export default function SelfView() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Fetch items from database
  const { data: allItems, isLoading, refetch } = useItems('SELF');
  const { mutate: updateStatus } = useUpdateItemStatus();
  
  // Filter items by type
  const tasks = useMemo(() => 
    allItems?.filter(item => item.item_type === 'TASK' && item.status !== 'COMPLETED') || [], 
    [allItems]
  );
  
  const completedTasks = useMemo(() => 
    allItems?.filter(item => item.item_type === 'TASK' && item.status === 'COMPLETED') || [], 
    [allItems]
  );
  
  const notes = useMemo(() => 
    allItems?.filter(item => item.item_type === 'NOTE') || [], 
    [allItems]
  );
  
  // Get today's mood if logged
  const todaysMood = useMemo(() => {
    const today = new Date().toDateString();
    return notes.find(note => {
      const metadata = note.metadata as any;
      if (metadata?.mood) {
        const noteDate = new Date(note.created_at).toDateString();
        return noteDate === today;
      }
      return false;
    });
  }, [notes]);
  
  // Toggle task completion
  const toggleTask = (item: ItemWithCircles) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateStatus({
      itemId: item.id,
      status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
    });
  };

  const totalTasks = tasks.length + completedTasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🧘</Text>
          <View>
            <Text style={styles.title}>Self</Text>
            <Text style={styles.subtitle}>Your personal space</Text>
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
            {/* Item count header with add button */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionCount}>
                {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} • {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCreateModal(true);
                }}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {/* Today's Progress */}
            {totalTasks > 0 && (
              <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Today's Progress</Text>
                  <Text style={styles.progressValue}>
                    {completedTasks.length}/{totalTasks}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
              </Animated.View>
            )}

            {/* Mood Check-in (if not logged today) */}
            {!todaysMood && (
              <Animated.View entering={FadeInUp.delay(150).duration(400)} style={styles.moodCard}>
                <Text style={styles.moodLabel}>How are you feeling?</Text>
                <View style={styles.moodRow}>
                  {MOODS.map((emoji) => (
                    <TouchableOpacity 
                      key={emoji}
                      style={styles.moodOption}
                      onPress={() => {
                        Haptics.selectionAsync();
                        // Quick mood log - opens modal with mood pre-filled
                        setShowCreateModal(true);
                      }}
                    >
                      <Text style={styles.moodEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <>
                <Text style={styles.listHeader}>Tasks</Text>
                {tasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onToggle={() => toggleTask(task)}
                  />
                ))}
              </>
            )}

            {/* Completed Tasks (collapsed) */}
            {completedTasks.length > 0 && (
              <>
                <Text style={styles.listHeaderMuted}>
                  ✓ {completedTasks.length} Completed
                </Text>
              </>
            )}

            {/* Notes */}
            {notes.length > 0 && (
              <>
                <Text style={styles.listHeader}>Notes</Text>
                {notes.slice(0, 5).map((note, index) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    index={index}
                  />
                ))}
              </>
            )}

            {/* Empty State */}
            {tasks.length === 0 && notes.length === 0 && (
              <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>✨</Text>
                <Text style={styles.emptyTitle}>Your Space is Clear</Text>
                <Text style={styles.emptySubtitle}>
                  Add tasks, notes, or track your mood to get started.
                </Text>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowCreateModal(true);
                  }}
                >
                  <Text style={styles.createButtonText}>+ Create First Item</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Create Item Modal */}
      <CreateItemModal 
        visible={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </View>
  );
}

// Task Card Component
interface TaskCardProps {
  task: ItemWithCircles;
  index: number;
  onToggle: () => void;
}

function TaskCard({ task, index, onToggle }: TaskCardProps) {
  const isCompleted = task.status === 'COMPLETED';
  
  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
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
          {task.due_date && (
            <Text style={styles.taskDue}>
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Note Card Component
interface NoteCardProps {
  note: ItemWithCircles;
  index: number;
}

function NoteCard({ note, index }: NoteCardProps) {
  const metadata = note.metadata as any;
  const mood = metadata?.mood;
  
  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={styles.noteCard}
        activeOpacity={0.7}
      >
        <Text style={styles.noteIcon}>{mood || '📝'}</Text>
        <View style={styles.noteInfo}>
          <Text style={styles.noteTitle} numberOfLines={1}>
            {note.title}
          </Text>
          <Text style={styles.noteDate}>
            {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
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
  
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  sectionCount: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: `${ACCENT}20`,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },
  
  // Progress card
  progressCard: {
    backgroundColor: `${ACCENT}12`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: '#888',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '500',
    color: ACCENT,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  
  // Mood card
  moodCard: {
    backgroundColor: `${ACCENT}08`,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  moodLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 16,
  },
  moodOption: {
    padding: 8,
  },
  moodEmoji: {
    fontSize: 28,
  },
  
  // List headers
  listHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 12,
  },
  listHeaderMuted: {
    fontSize: 13,
    color: '#555',
    marginTop: 20,
    marginBottom: 8,
  },
  
  // Task card
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ACCENT}08`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: `${ACCENT}15`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: ACCENT,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '400',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  taskDue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Note card
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ACCENT}06`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: `${ACCENT}10`,
  },
  noteIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  noteInfo: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    color: '#E0E0E0',
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '300',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
