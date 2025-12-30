/**
 * PhysicalModule Component
 * 
 * 💪 PHYSICAL (Integrations & Goals)
 * - Health Dashboard: Mock data for Steps, Heart Rate, Sleep Score
 * - Health Goals: % tracker with circular progress rings
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { ProgressRing } from './ProgressRing';
import { 
  useHealthMetrics,
  useHealthGoals,
  useCreateHealthGoal,
  useUpdateHealthGoalProgress,
  useDeleteHealthGoal,
} from '@/hooks/useSelf';
import { calculateGoalProgress, formatGoalProgress } from '@/services/healthService';

type SubTab = 'dashboard' | 'goals';

export function PhysicalModule() {
  const [activeTab, setActiveTab] = useState<SubTab>('dashboard');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalUnit, setNewGoalUnit] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  
  // Data hooks
  const { data: metrics, isLoading: loadingMetrics } = useHealthMetrics();
  const { data: goals = [] } = useHealthGoals();
  const createGoal = useCreateHealthGoal();
  const updateProgress = useUpdateHealthGoalProgress();
  const deleteGoal = useDeleteHealthGoal();

  const handleAddGoal = useCallback(async () => {
    if (!newGoalName.trim() || !newGoalTarget || !newGoalUnit.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }
    
    await createGoal.mutateAsync({
      goal_name: newGoalName.trim(),
      target_value: parseFloat(newGoalTarget),
      unit: newGoalUnit.trim(),
      goal_type: 'daily',
    });
    
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalUnit('');
    setShowAddGoal(false);
  }, [newGoalName, newGoalTarget, newGoalUnit, createGoal]);

  const handleAddProgress = useCallback(async (goalId: string) => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    await updateProgress.mutateAsync({ goalId, amount, mode: 'add' });
    setAddAmount('');
    setActiveGoalId(null);
  }, [addAmount, updateProgress]);

  const handleDeleteGoal = useCallback((goalId: string, name: string) => {
    Alert.alert('Delete Goal', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal.mutate(goalId) },
    ]);
  }, [deleteGoal]);

  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabScroll}
    >
      {[
        { key: 'dashboard', label: 'Dashboard', icon: '📊' },
        { key: 'goals', label: 'Goals', icon: '🎯' },
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab(tab.key as SubTab);
          }}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderDashboard = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      <Text style={styles.dashboardNote}>
        📡 Health integrations coming soon
      </Text>
      
      {/* Health Metrics Row */}
      <View style={styles.metricsRow}>
        <Animated.View 
          entering={FadeInUp.delay(100).duration(300)} 
          style={styles.metricCard}
        >
          <Text style={styles.metricIcon}>👟</Text>
          <Text style={styles.metricValue}>
            {metrics?.steps.value.toLocaleString() || '--'}
          </Text>
          <Text style={styles.metricLabel}>Steps</Text>
          <View style={styles.metricProgress}>
            <View 
              style={[
                styles.metricProgressFill,
                { width: `${Math.min(100, ((metrics?.steps.value || 0) / (metrics?.steps.goal || 10000)) * 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.metricGoal}>Goal: {metrics?.steps.goal.toLocaleString()}</Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(200).duration(300)} 
          style={styles.metricCard}
        >
          <Text style={styles.metricIcon}>❤️</Text>
          <Text style={styles.metricValue}>
            {metrics?.heartRate.average || '--'}
          </Text>
          <Text style={styles.metricLabel}>Avg BPM</Text>
          <Text style={styles.metricSub}>
            Resting: {metrics?.heartRate.resting || '--'}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(300).duration(300)} 
          style={styles.metricCard}
        >
          <Text style={styles.metricIcon}>😴</Text>
          <Text style={styles.metricValue}>
            {metrics?.sleepScore.score || '--'}
          </Text>
          <Text style={styles.metricLabel}>Sleep Score</Text>
          <Text style={styles.metricSub}>
            {metrics?.sleepScore.duration.toFixed(1) || '--'}h
          </Text>
        </Animated.View>
      </View>

      <Text style={styles.mockDataNote}>
        📱 Mock data • Connect Apple Health or Oura in Settings
      </Text>
    </Animated.View>
  );

  const renderGoals = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{goals.length} active goals</Text>
        <TouchableOpacity onPress={() => setShowAddGoal(!showAddGoal)}>
          <Text style={styles.addButton}>{showAddGoal ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {showAddGoal && (
        <Animated.View entering={FadeInUp.duration(200)} style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Goal name (e.g., Water)"
            placeholderTextColor={colors.textTertiary}
            value={newGoalName}
            onChangeText={setNewGoalName}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: spacing.sm }]}
              placeholder="Target (e.g., 100)"
              placeholderTextColor={colors.textTertiary}
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Unit (e.g., oz)"
              placeholderTextColor={colors.textTertiary}
              value={newGoalUnit}
              onChangeText={setNewGoalUnit}
            />
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleAddGoal}>
            <Text style={styles.submitBtnText}>Create Goal</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>No health goals yet</Text>
          <Text style={styles.emptySubtext}>Add a goal to start tracking</Text>
        </View>
      ) : (
        <View style={styles.goalsGrid}>
          {goals.map((goal, index) => {
            const progress = calculateGoalProgress(goal);
            const isAddingToThis = activeGoalId === goal.id;
            
            return (
              <Animated.View 
                key={goal.id}
                entering={FadeInRight.delay(index * 50).duration(200)}
              >
                <TouchableOpacity
                  style={styles.goalCard}
                  onPress={() => setActiveGoalId(isAddingToThis ? null : goal.id)}
                  onLongPress={() => handleDeleteGoal(goal.id, goal.goal_name)}
                >
                  <View style={styles.goalTop}>
                    <ProgressRing
                      progress={progress}
                      size={60}
                      strokeWidth={6}
                      color={progress >= 100 ? '#10B981' : colors.self}
                    />
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalName}>{goal.goal_name}</Text>
                      <Text style={styles.goalProgress}>
                        {formatGoalProgress(goal)}
                      </Text>
                    </View>
                  </View>
                  
                  {isAddingToThis && (
                    <Animated.View 
                      entering={FadeInUp.duration(200)}
                      style={styles.addProgressRow}
                    >
                      <TextInput
                        style={styles.addProgressInput}
                        placeholder={`+${goal.unit}`}
                        placeholderTextColor={colors.textTertiary}
                        value={addAmount}
                        onChangeText={setAddAmount}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <TouchableOpacity 
                        style={styles.addProgressBtn}
                        onPress={() => handleAddProgress(goal.id)}
                      >
                        <Text style={styles.addProgressBtnText}>Add</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      <Text style={styles.hint}>Tap to log progress • Long press to delete</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderTabs()}
      
      <View style={styles.content}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'goals' && renderGoals()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  tabScroll: {
    marginBottom: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: `${colors.self}30`,
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.self,
    fontWeight: '600',
  },
  content: {
    minHeight: 150,
  },
  dashboardNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricProgress: {
    width: '100%',
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  metricProgressFill: {
    height: '100%',
    backgroundColor: colors.self,
    borderRadius: 2,
  },
  metricGoal: {
    fontSize: 9,
    color: colors.textTertiary,
    marginTop: 4,
  },
  metricSub: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
  },
  mockDataNote: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  addButton: {
    fontSize: 20,
    color: colors.self,
    fontWeight: '300',
  },
  addForm: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
  },
  submitBtn: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#000',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptySubtext: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 4,
  },
  goalsGrid: {
    gap: spacing.sm,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  goalProgress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addProgressRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  addProgressInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addProgressBtn: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  addProgressBtnText: {
    color: '#000',
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
