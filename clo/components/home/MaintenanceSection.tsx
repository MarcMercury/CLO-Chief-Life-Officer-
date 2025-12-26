/**
 * MaintenanceSection Component
 * 
 * Displays upcoming maintenance schedule and reminders.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useMaintenanceSchedules, useCompleteMaintenanceTask } from '@/hooks/useHomeOS';
import { MaintenanceSchedule } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';

const FREQUENCY_LABELS: Record<number, string> = {
  1: 'Monthly',
  3: 'Quarterly',
  6: 'Every 6 months',
  12: 'Annual',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: colors.textSecondary,
  medium: colors.home,
  high: colors.warning,
};

interface MaintenanceSectionProps {
  onAddPress: () => void;
  onItemPress: (task: MaintenanceSchedule) => void;
}

export function MaintenanceSection({ onAddPress, onItemPress }: MaintenanceSectionProps) {
  const { data: tasks = [], isLoading } = useMaintenanceSchedules();
  const completeTask = useCompleteMaintenanceTask();
  const [showCompleted, setShowCompleted] = useState(false);

  // Group tasks by urgency
  const now = Date.now();
  const overdueThreshold = 0;
  const soonThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

  const categorizedTasks = tasks.reduce((acc, task) => {
    if (!task.next_due) {
      acc.later.push(task);
      return acc;
    }
    
    const dueDate = new Date(task.next_due).getTime();
    const diff = dueDate - now;
    
    if (diff < overdueThreshold) {
      acc.overdue.push(task);
    } else if (diff < soonThreshold) {
      acc.soon.push(task);
    } else {
      acc.later.push(task);
    }
    
    return acc;
  }, { overdue: [] as MaintenanceSchedule[], soon: [] as MaintenanceSchedule[], later: [] as MaintenanceSchedule[] });

  const displayedTasks = [
    ...categorizedTasks.overdue,
    ...categorizedTasks.soon,
    ...categorizedTasks.later,
  ];

  const handleCompleteTask = async (task: MaintenanceSchedule) => {
    haptics.tapMedium();
    try {
      await completeTask.mutateAsync(task.id);
      haptics.success();
    } catch (error) {
      haptics.error();
    }
  };

  const getDaysUntilDue = (dateStr: string): number => {
    return Math.ceil((new Date(dateStr).getTime() - now) / (1000 * 60 * 60 * 24));
  };

  const getDueBadgeStyle = (dateStr?: string | null) => {
    if (!dateStr) return { bg: colors.surface, text: colors.textSecondary };
    const days = getDaysUntilDue(dateStr);
    if (days < 0) return { bg: colors.error + '20', text: colors.error };
    if (days <= 7) return { bg: colors.warning + '20', text: colors.warning };
    return { bg: colors.surface, text: colors.textSecondary };
  };

  const renderItem = ({ item, index }: { item: MaintenanceSchedule; index: number }) => {
    const dueStyle = getDueBadgeStyle(item.next_due);
    const daysUntil = item.next_due ? getDaysUntilDue(item.next_due) : null;
    
    // Determine priority based on days until due
    const getPriority = () => {
      if (!daysUntil) return 'medium';
      if (daysUntil < 0) return 'high';
      if (daysUntil <= 7) return 'high';
      if (daysUntil <= 30) return 'medium';
      return 'low';
    };
    
    return (
      <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
        <TouchableOpacity
          style={styles.taskCard}
          onPress={() => {
            haptics.tapLight();
            onItemPress(item);
          }}
          activeOpacity={0.7}
        >
          {/* Complete Checkbox */}
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => handleCompleteTask(item)}
          >
            <View style={styles.checkboxInner} />
          </TouchableOpacity>
          
          <View style={styles.taskInfo}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskName} numberOfLines={1}>
                {item.task_name}
              </Text>
              <View style={[
                styles.priorityDot,
                { backgroundColor: PRIORITY_COLORS[getPriority()] }
              ]} />
            </View>
            
            <Text style={styles.taskFrequency}>
              {FREQUENCY_LABELS[item.frequency_months] || `Every ${item.frequency_months} months`}
            </Text>
            
            {item.last_completed && (
              <Text style={styles.lastCompleted}>
                Last: {formatDate(item.last_completed)}
              </Text>
            )}
          </View>

          {/* Due Badge */}
          <View style={[styles.dueBadge, { backgroundColor: dueStyle.bg }]}>
            <Text style={[styles.dueBadgeText, { color: dueStyle.text }]}>
              {daysUntil === null 
                ? 'No date'
                : daysUntil < 0 
                  ? `${Math.abs(daysUntil)}d late`
                  : daysUntil === 0 
                    ? 'Today'
                    : `${daysUntil}d`
              }
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, categorizedTasks.overdue.length > 0 && styles.overdueValue]}>
            {categorizedTasks.overdue.length}
          </Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, categorizedTasks.soon.length > 0 && styles.soonValue]}>
            {categorizedTasks.soon.length}
          </Text>
          <Text style={styles.statLabel}>Due Soon</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{categorizedTasks.later.length}</Text>
          <Text style={styles.statLabel}>Scheduled</Text>
        </View>
      </View>

      {/* Add Button Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            haptics.tapMedium();
            onAddPress();
          }}
        >
          <Text style={styles.addButtonText}>+ Add Maintenance Task</Text>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔧</Text>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading maintenance...' : 'No maintenance scheduled'}
            </Text>
            {!isLoading && (
              <Text style={styles.emptySubtext}>
                Keep your home running smoothly with regular maintenance
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.textPrimary,
  },
  overdueValue: {
    color: colors.error,
  },
  soonValue: {
    color: colors.warning,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.home,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.home,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  taskInfo: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  taskFrequency: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lastCompleted: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },
  dueBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  dueBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
