/**
 * SoulModule Component
 * 
 * 🔥 SOUL (Gratitude & Release)
 * - Gratitude: Simple daily text log
 * - Burn Box: Write + delete with fire animation
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { BurnBox } from './BurnBox';
import { 
  useTodaysGratitude,
  useAddGratitude,
} from '@/hooks/useSelf';

type SubTab = 'gratitude' | 'burn';

export function SoulModule() {
  const [activeTab, setActiveTab] = useState<SubTab>('gratitude');
  const [newGratitude, setNewGratitude] = useState('');
  
  // Data hooks
  const { data: todaysGratitude = [] } = useTodaysGratitude();
  const addGratitude = useAddGratitude();

  const handleAddGratitude = useCallback(async () => {
    if (!newGratitude.trim()) return;
    await addGratitude.mutateAsync(newGratitude.trim());
    setNewGratitude('');
  }, [newGratitude, addGratitude]);

  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabScroll}
    >
      {[
        { key: 'gratitude', label: 'Gratitude', icon: '🙏' },
        { key: 'burn', label: 'Burn Box', icon: '🔥' },
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

  const renderGratitude = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      <Text style={styles.gratitudeTitle}>What are you grateful for today?</Text>
      
      <View style={styles.gratitudeInput}>
        <TextInput
          style={styles.input}
          placeholder="I'm grateful for..."
          placeholderTextColor={colors.textTertiary}
          value={newGratitude}
          onChangeText={setNewGratitude}
          multiline
        />
        <TouchableOpacity 
          style={[styles.addBtn, !newGratitude.trim() && styles.addBtnDisabled]}
          onPress={handleAddGratitude}
          disabled={!newGratitude.trim()}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Today's gratitude entries */}
      <View style={styles.gratitudeList}>
        {todaysGratitude.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🙏</Text>
            <Text style={styles.emptyText}>No gratitude logged today</Text>
            <Text style={styles.emptyHint}>Start with one thing you're thankful for</Text>
          </View>
        ) : (
          <>
            <Text style={styles.listLabel}>Today's gratitude ({todaysGratitude.length})</Text>
            {todaysGratitude.map((entry, index) => (
              <Animated.View 
                key={entry.id}
                entering={FadeInRight.delay(index * 50).duration(200)}
              >
                <View style={styles.gratitudeCard}>
                  <Text style={styles.gratitudeEmoji}>🙏</Text>
                  <Text style={styles.gratitudeText}>{entry.content}</Text>
                </View>
              </Animated.View>
            ))}
          </>
        )}
      </View>

      <Text style={styles.hint}>
        Research shows gratitude journaling improves wellbeing
      </Text>
    </Animated.View>
  );

  const renderBurnBox = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      <Text style={styles.burnTitle}>Release what doesn't serve you</Text>
      <Text style={styles.burnSubtitle}>Write it down, then let it go 🔥</Text>
      <BurnBox />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderTabs()}
      
      <View style={styles.content}>
        {activeTab === 'gratitude' && renderGratitude()}
        {activeTab === 'burn' && renderBurnBox()}
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
  gratitudeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  burnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  burnSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  gratitudeInput: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  addBtn: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#000',
    fontWeight: '600',
  },
  gratitudeList: {
    marginTop: spacing.sm,
  },
  listLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  gratitudeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  gratitudeEmoji: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  gratitudeText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
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
  emptyHint: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  hint: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
