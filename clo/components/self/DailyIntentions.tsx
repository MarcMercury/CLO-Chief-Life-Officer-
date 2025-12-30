/**
 * DailyIntentions Component
 * 
 * The "Daily 3" - Three editable intention tiles that reset daily.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { useDailyIntentions, useUpsertIntention, useToggleIntention } from '@/hooks/useSelf';

interface DailyIntentionsProps {
  onComplete?: (count: number) => void;
}

export function DailyIntentions({ onComplete }: DailyIntentionsProps) {
  const { data: intentions = [], isLoading } = useDailyIntentions();
  const upsertIntention = useUpsertIntention();
  const toggleIntention = useToggleIntention();
  
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Create empty slots for the 3 intentions
  const slots = [1, 2, 3].map(slotNumber => {
    const intention = intentions.find(i => i.slot_number === slotNumber);
    return {
      slotNumber,
      id: intention?.id,
      text: intention?.intention_text || '',
      isCompleted: intention?.is_completed || false,
    };
  });

  const completedCount = slots.filter(s => s.isCompleted).length;

  useEffect(() => {
    onComplete?.(completedCount);
  }, [completedCount, onComplete]);

  const handleStartEdit = useCallback((slotNumber: number, currentText: string) => {
    Haptics.selectionAsync();
    setEditingSlot(slotNumber);
    setEditText(currentText);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingSlot === null) return;
    
    if (editText.trim()) {
      await upsertIntention.mutateAsync({
        slotNumber: editingSlot as 1 | 2 | 3,
        intentionText: editText.trim(),
      });
    }
    
    setEditingSlot(null);
    setEditText('');
  }, [editingSlot, editText, upsertIntention]);

  const handleToggle = useCallback(async (slot: typeof slots[0]) => {
    if (!slot.id || !slot.text) return;
    
    Haptics.notificationAsync(
      slot.isCompleted 
        ? Haptics.NotificationFeedbackType.Warning 
        : Haptics.NotificationFeedbackType.Success
    );
    
    await toggleIntention.mutateAsync({
      id: slot.id,
      completed: !slot.isCompleted,
    });
  }, [toggleIntention]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          What are you committed to today?
        </Text>
        <Text style={styles.progress}>
          {completedCount}/3
        </Text>
      </View>

      <View style={styles.intentionsGrid}>
        {slots.map((slot, index) => (
          <Animated.View 
            key={slot.slotNumber}
            entering={FadeInUp.delay(index * 100).duration(300)}
          >
            {editingSlot === slot.slotNumber ? (
              <View style={styles.editCard}>
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="Enter your intention..."
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                  onBlur={handleSaveEdit}
                  onSubmitEditing={handleSaveEdit}
                  returnKeyType="done"
                />
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.intentionCard,
                  slot.isCompleted && styles.intentionCardComplete,
                  !slot.text && styles.intentionCardEmpty,
                ]}
                onPress={() => slot.text ? handleToggle(slot) : handleStartEdit(slot.slotNumber, '')}
                onLongPress={() => handleStartEdit(slot.slotNumber, slot.text)}
                delayLongPress={300}
              >
                <View style={styles.slotBadge}>
                  <Text style={styles.slotNumber}>{slot.slotNumber}</Text>
                </View>
                
                {slot.text ? (
                  <>
                    <Text 
                      style={[
                        styles.intentionText,
                        slot.isCompleted && styles.intentionTextComplete,
                      ]}
                      numberOfLines={2}
                    >
                      {slot.text}
                    </Text>
                    {slot.isCompleted && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.emptyText}>Tap to set intention</Text>
                )}
              </TouchableOpacity>
            )}
          </Animated.View>
        ))}
      </View>

      <Text style={styles.hint}>
        Long press to edit • Tap to complete
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.self,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  intentionsGrid: {
    gap: spacing.sm,
  },
  intentionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 60,
  },
  intentionCardComplete: {
    backgroundColor: `${colors.self}15`,
    borderColor: colors.self,
  },
  intentionCardEmpty: {
    borderStyle: 'dashed',
  },
  slotBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.self,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  slotNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  intentionText: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  intentionTextComplete: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  emptyText: {
    flex: 1,
    fontSize: 14,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.self,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  checkmarkText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  editCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.self,
    minHeight: 60,
  },
  editInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
  },
  hint: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
