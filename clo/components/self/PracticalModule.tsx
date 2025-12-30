/**
 * PracticalModule Component
 * 
 * 🛠️ PRACTICAL (Logistics)
 * - Daily Tasks: Standard to-do list for Self circle
 * - List Maker: Horizontal tabs for Shopping, Gifts, Groceries
 * - Financial Pulse: Manual input for daily spend + budget
 */

import React, { useState, useCallback, useMemo } from 'react';
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
import { 
  useItems, 
  useCreateItem, 
  useUpdateItemStatus, 
  useDeleteItem 
} from '@/hooks/useItems';
import {
  useTodaysSpending,
  useAddSpending,
  useBudgetSettings,
  useUpsertBudgetSettings,
} from '@/hooks/useSelf';

type SubTab = 'tasks' | 'lists' | 'finance';
type ListBucket = 'shopping' | 'gifts' | 'groceries';

const LIST_BUCKETS: { key: ListBucket; label: string; icon: string }[] = [
  { key: 'shopping', label: 'Shopping', icon: '🛍️' },
  { key: 'gifts', label: 'Gifts', icon: '🎁' },
  { key: 'groceries', label: 'Groceries', icon: '🥬' },
];

export function PracticalModule() {
  const [activeTab, setActiveTab] = useState<SubTab>('tasks');
  const [activeBucket, setActiveBucket] = useState<ListBucket>('shopping');
  const [newTaskText, setNewTaskText] = useState('');
  const [newListItem, setNewListItem] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendDescription, setSpendDescription] = useState('');
  const [showBudgetEdit, setShowBudgetEdit] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  
  // Data hooks
  const { data: allItems = [] } = useItems('SELF');
  const createItem = useCreateItem();
  const updateStatus = useUpdateItemStatus();
  const deleteItem = useDeleteItem();
  
  const { data: todaysSpending = [] } = useTodaysSpending();
  const addSpending = useAddSpending();
  const { data: budgetSettings } = useBudgetSettings();
  const upsertBudget = useUpsertBudgetSettings();

  // Filter tasks (items without bucket metadata = general tasks)
  const tasks = useMemo(() => {
    return allItems.filter(item => 
      item.item_type === 'TASK' && 
      !(item.metadata as any)?.bucket
    );
  }, [allItems]);

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  // Filter list items by bucket
  const listItems = useMemo(() => {
    return allItems.filter(item => 
      item.item_type === 'TASK' && 
      (item.metadata as any)?.bucket === activeBucket
    );
  }, [allItems, activeBucket]);

  // Calculate today's total spend
  const totalSpentToday = useMemo(() => {
    return todaysSpending.reduce((sum, s) => sum + (s.amount || 0), 0);
  }, [todaysSpending]);

  const dailyBudget = budgetSettings?.daily_budget || 0;
  const budgetRemaining = dailyBudget - totalSpentToday;

  const handleAddTask = useCallback(async () => {
    if (!newTaskText.trim()) return;
    
    await createItem.mutateAsync({
      title: newTaskText.trim(),
      item_type: 'TASK',
      circles: ['SELF'],
    });
    
    setNewTaskText('');
  }, [newTaskText, createItem]);

  const handleAddListItem = useCallback(async () => {
    if (!newListItem.trim()) return;
    
    await createItem.mutateAsync({
      title: newListItem.trim(),
      item_type: 'TASK',
      circles: ['SELF'],
      metadata: { bucket: activeBucket },
    });
    
    setNewListItem('');
  }, [newListItem, activeBucket, createItem]);

  const handleToggleTask = useCallback((item: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateStatus.mutate({
      itemId: item.id,
      status: item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED',
    });
  }, [updateStatus]);

  const handleDeleteTask = useCallback((item: any) => {
    Alert.alert('Delete', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem.mutate(item.id) },
    ]);
  }, [deleteItem]);

  const handleAddSpend = useCallback(async () => {
    const amount = parseFloat(spendAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    await addSpending.mutateAsync({
      amount,
      description: spendDescription.trim() || undefined,
    });
    
    setSpendAmount('');
    setSpendDescription('');
  }, [spendAmount, spendDescription, addSpending]);

  const handleSaveBudget = useCallback(async () => {
    const budget = parseFloat(budgetInput);
    if (isNaN(budget) || budget <= 0) return;
    
    await upsertBudget.mutateAsync({ daily_budget: budget });
    setBudgetInput('');
    setShowBudgetEdit(false);
  }, [budgetInput, upsertBudget]);

  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabScroll}
    >
      {[
        { key: 'tasks', label: 'Tasks', icon: '✅' },
        { key: 'lists', label: 'Lists', icon: '📋' },
        { key: 'finance', label: 'Spending', icon: '💰' },
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

  const renderTasks = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Quick add */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add a task..."
          placeholderTextColor={colors.textTertiary}
          value={newTaskText}
          onChangeText={setNewTaskText}
          onSubmitEditing={handleAddTask}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={[styles.addBtn, !newTaskText.trim() && styles.addBtnDisabled]}
          onPress={handleAddTask}
          disabled={!newTaskText.trim()}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Task list */}
      {pendingTasks.length === 0 && completedTasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyText}>No tasks yet</Text>
        </View>
      ) : (
        <>
          {pendingTasks.map((task, index) => (
            <Animated.View 
              key={task.id}
              entering={FadeInRight.delay(index * 30).duration(200)}
            >
              <TouchableOpacity
                style={styles.taskItem}
                onPress={() => handleToggleTask(task)}
                onLongPress={() => handleDeleteTask(task)}
              >
                <View style={styles.checkbox} />
                <Text style={styles.taskText}>{task.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
          
          {completedTasks.length > 0 && (
            <Text style={styles.completedLabel}>
              ✓ {completedTasks.length} completed
            </Text>
          )}
        </>
      )}
    </Animated.View>
  );

  const renderLists = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Bucket tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.bucketScroll}
      >
        {LIST_BUCKETS.map(bucket => (
          <TouchableOpacity
            key={bucket.key}
            style={[
              styles.bucketTab, 
              activeBucket === bucket.key && styles.bucketTabActive
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveBucket(bucket.key);
            }}
          >
            <Text style={styles.bucketIcon}>{bucket.icon}</Text>
            <Text style={[
              styles.bucketLabel,
              activeBucket === bucket.key && styles.bucketLabelActive
            ]}>
              {bucket.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick add */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder={`Add to ${LIST_BUCKETS.find(b => b.key === activeBucket)?.label}...`}
          placeholderTextColor={colors.textTertiary}
          value={newListItem}
          onChangeText={setNewListItem}
          onSubmitEditing={handleAddListItem}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={[styles.addBtn, !newListItem.trim() && styles.addBtnDisabled]}
          onPress={handleAddListItem}
          disabled={!newListItem.trim()}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* List items */}
      {listItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>
            {LIST_BUCKETS.find(b => b.key === activeBucket)?.icon}
          </Text>
          <Text style={styles.emptyText}>No items in this list</Text>
        </View>
      ) : (
        listItems.map((item, index) => (
          <Animated.View 
            key={item.id}
            entering={FadeInRight.delay(index * 30).duration(200)}
          >
            <TouchableOpacity
              style={styles.taskItem}
              onPress={() => handleToggleTask(item)}
              onLongPress={() => handleDeleteTask(item)}
            >
              <View style={[
                styles.checkbox,
                item.status === 'COMPLETED' && styles.checkboxDone
              ]}>
                {item.status === 'COMPLETED' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[
                styles.taskText,
                item.status === 'COMPLETED' && styles.taskTextDone
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))
      )}
    </Animated.View>
  );

  const renderFinance = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Budget summary */}
      <View style={styles.budgetCard}>
        <View style={styles.budgetRow}>
          <View style={styles.budgetStat}>
            <Text style={styles.budgetLabel}>Today's Spend</Text>
            <Text style={styles.budgetValue}>${totalSpentToday.toFixed(2)}</Text>
          </View>
          <View style={styles.budgetDivider} />
          <View style={styles.budgetStat}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <Text style={[
              styles.budgetValue,
              budgetRemaining < 0 && styles.budgetNegative
            ]}>
              {dailyBudget > 0 
                ? `$${budgetRemaining.toFixed(2)}`
                : 'No budget set'
              }
            </Text>
          </View>
        </View>
        
        {!showBudgetEdit ? (
          <TouchableOpacity 
            style={styles.editBudgetBtn}
            onPress={() => setShowBudgetEdit(true)}
          >
            <Text style={styles.editBudgetText}>
              {dailyBudget > 0 ? `Budget: $${dailyBudget}/day` : 'Set daily budget'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.budgetEditRow}>
            <TextInput
              style={styles.budgetInput}
              placeholder="Daily budget"
              placeholderTextColor={colors.textTertiary}
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity style={styles.saveBudgetBtn} onPress={handleSaveBudget}>
              <Text style={styles.saveBudgetText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add spending */}
      <View style={styles.spendForm}>
        <Text style={styles.spendLabel}>Log expense</Text>
        <View style={styles.spendRow}>
          <TextInput
            style={[styles.addInput, { flex: 1 }]}
            placeholder="$0.00"
            placeholderTextColor={colors.textTertiary}
            value={spendAmount}
            onChangeText={setSpendAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.addInput, { flex: 2 }]}
            placeholder="What for? (optional)"
            placeholderTextColor={colors.textTertiary}
            value={spendDescription}
            onChangeText={setSpendDescription}
          />
          <TouchableOpacity 
            style={[styles.addBtn, !spendAmount && styles.addBtnDisabled]}
            onPress={handleAddSpend}
            disabled={!spendAmount}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's transactions */}
      {todaysSpending.length > 0 && (
        <View style={styles.transactionsList}>
          <Text style={styles.transactionsLabel}>Today's expenses</Text>
          {todaysSpending.map((spend, index) => (
            <Animated.View 
              key={spend.id}
              entering={FadeInRight.delay(index * 30).duration(200)}
            >
              <View style={styles.transactionItem}>
                <Text style={styles.transactionAmount}>
                  -${spend.amount.toFixed(2)}
                </Text>
                <Text style={styles.transactionDesc}>
                  {spend.description || 'Expense'}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderTabs()}
      
      <View style={styles.content}>
        {activeTab === 'tasks' && renderTasks()}
        {activeTab === 'lists' && renderLists()}
        {activeTab === 'finance' && renderFinance()}
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
  addRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.md,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '300',
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
    color: colors.textTertiary,
    fontSize: 14,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.self,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.self,
  },
  checkmark: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  completedLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  bucketScroll: {
    marginBottom: spacing.md,
  },
  bucketTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bucketTabActive: {
    backgroundColor: `${colors.self}20`,
    borderColor: colors.self,
  },
  bucketIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  bucketLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  bucketLabelActive: {
    color: colors.self,
    fontWeight: '600',
  },
  budgetCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetStat: {
    flex: 1,
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  budgetNegative: {
    color: '#EF4444',
  },
  budgetDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  editBudgetBtn: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editBudgetText: {
    fontSize: 12,
    color: colors.self,
  },
  budgetEditRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  budgetInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  saveBudgetBtn: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  saveBudgetText: {
    color: '#000',
    fontWeight: '600',
  },
  spendForm: {
    marginBottom: spacing.md,
  },
  spendLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  spendRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  transactionsList: {
    marginTop: spacing.sm,
  },
  transactionsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  transactionDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
