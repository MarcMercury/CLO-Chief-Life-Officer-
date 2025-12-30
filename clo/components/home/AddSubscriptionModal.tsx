/**
 * AddSubscriptionModal Component
 * 
 * Modal for adding/editing subscriptions with "Kill Switch" cancellation feature.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { useCreateSubscription, useUpdateSubscription, useCancelSubscription } from '@/hooks/useHomeOS';
import { CreateSubscriptionInput, SubscriptionFrequency, SubscriptionCategory, Subscription } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';
import { formatDateInput, parseDateInput, formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';

const BILLING_CYCLES: { value: SubscriptionFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
  { value: 'other', label: 'Other' },
];

const CATEGORIES: { value: SubscriptionCategory; label: string; icon: string }[] = [
  { value: 'streaming', label: 'Streaming', icon: '📺' },
  { value: 'software', label: 'Software', icon: '💻' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'membership', label: 'Membership', icon: '🎫' },
  { value: 'other', label: 'Other', icon: '📋' },
];

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  editItem?: Subscription | null;
}

export function AddSubscriptionModal({ visible, onClose, editItem }: AddSubscriptionModalProps) {
  const createSub = useCreateSubscription();
  const updateSub = useUpdateSubscription();
  const cancelSub = useCancelSubscription();
  
  const isEditMode = !!editItem;
  
  const [formData, setFormData] = useState<Partial<CreateSubscriptionInput>>({
    frequency: 'monthly',
    category: 'other',
    auto_renew: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        cost: editItem.cost,
        frequency: editItem.frequency,
        category: editItem.category,
        next_billing_date: editItem.next_billing_date ? formatDateFromDB(editItem.next_billing_date) : '',
        auto_renew: editItem.auto_renew,
        cancellation_url: editItem.cancellation_url || '',
        cancellation_instructions: editItem.cancellation_instructions || '',
        notes: editItem.notes || '',
      });
    }
  }, [editItem]);

  // Convert YYYY-MM-DD to MM/DD/YYYY for display
  const formatDateFromDB = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${month}/${day}/${year}`;
    }
    return dateStr;
  };

  const updateField = (field: keyof CreateSubscriptionInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Service name is required';
    }
    if (!formData.cost || formData.cost <= 0) {
      newErrors.cost = 'Cost is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      haptics.error();
      return;
    }

    try {
      const subData = {
        name: formData.name!,
        cost: parseCurrencyInput(formData.cost?.toString() || '0'),
        frequency: formData.frequency!,
        category: formData.category!,
        next_billing_date: formData.next_billing_date ? parseDateInput(formData.next_billing_date) : undefined,
        cancellation_url: formData.cancellation_url || undefined,
        cancellation_instructions: formData.cancellation_instructions || undefined,
        auto_renew: formData.auto_renew,
        notes: formData.notes || undefined,
      };

      if (isEditMode && editItem) {
        await updateSub.mutateAsync({ id: editItem.id, updates: subData });
      } else {
        await createSub.mutateAsync(subData);
      }
      
      haptics.success();
      handleClose();
    } catch (error) {
      haptics.error();
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} subscription. Please try again.`);
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete "${editItem.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await cancelSub.mutateAsync(editItem.id);
              haptics.success();
              handleClose();
            } catch (error) {
              haptics.error();
              Alert.alert('Error', 'Failed to delete subscription. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleClose = () => {
    setFormData({
      frequency: 'monthly',
      category: 'other',
      auto_renew: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={styles.overlay}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          onPress={handleClose}
          activeOpacity={1}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View 
            style={styles.content}
            entering={SlideInDown.duration(300).springify()}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{isEditMode ? 'Edit Subscription' : 'Add Subscription'}</Text>
              <View style={styles.headerActions}>
                {isEditMode && (
                  <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              style={styles.form}
              showsVerticalScrollIndicator={false}
            >
              {/* Service Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Service Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g., Netflix, Spotify"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.name || ''}
                  onChangeText={(v) => updateField('name', v)}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryChip,
                        formData.category === cat.value && styles.categoryChipActive
                      ]}
                      onPress={() => {
                        haptics.selection();
                        updateField('category', cat.value);
                      }}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text style={[
                        styles.categoryText,
                        formData.category === cat.value && styles.categoryTextActive
                      ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Cost & Billing Cycle */}
              <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Cost *</Text>
                  <TextInput
                    style={[styles.input, errors.cost && styles.inputError]}
                    placeholder="$9.99"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={formData.cost?.toString() || ''}
                    onChangeText={(v) => updateField('cost', formatCurrencyInput(v))}
                  />
                  {errors.cost && <Text style={styles.errorText}>{errors.cost}</Text>}
                </View>
              </View>

              {/* Billing Cycle */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Billing Cycle</Text>
                <View style={styles.cycleRow}>
                  {BILLING_CYCLES.map((cycle) => (
                    <TouchableOpacity
                      key={cycle.value}
                      style={[
                        styles.cycleChip,
                        formData.frequency === cycle.value && styles.cycleChipActive
                      ]}
                      onPress={() => {
                        haptics.selection();
                        updateField('frequency', cycle.value);
                      }}
                    >
                      <Text style={[
                        styles.cycleText,
                        formData.frequency === cycle.value && styles.cycleTextActive
                      ]}>
                        {cycle.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Next Renewal Date */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Next Billing Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={formData.next_billing_date || ''}
                  onChangeText={(v) => updateField('next_billing_date', formatDateInput(v))}
                  maxLength={10}
                />
              </View>

              {/* Auto Renew Toggle */}
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => {
                  haptics.selection();
                  updateField('auto_renew', !formData.auto_renew);
                }}
              >
                <Text style={styles.toggleLabel}>Auto-renew</Text>
                <View style={[
                  styles.toggle,
                  formData.auto_renew && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleKnob,
                    formData.auto_renew && styles.toggleKnobActive
                  ]} />
                </View>
              </TouchableOpacity>

              {/* Kill Switch Section */}
              <View style={styles.killSwitchSection}>
                <Text style={styles.sectionTitle}>🔴 Kill Switch Info</Text>
                <Text style={styles.sectionSubtitle}>
                  Save cancellation details for when you need them
                </Text>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Cancellation URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://..."
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="url"
                    autoCapitalize="none"
                    value={formData.cancellation_url || ''}
                    onChangeText={(v) => updateField('cancellation_url', v)}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Cancellation Instructions</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="e.g., Go to Settings > Account > Cancel Subscription"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={3}
                    value={formData.cancellation_instructions || ''}
                    onChangeText={(v) => updateField('cancellation_instructions', v)}
                  />
                </View>
              </View>

              {/* Notes */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any additional notes..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  value={formData.notes || ''}
                  onChangeText={(v) => updateField('notes', v)}
                />
              </View>

              {/* Bottom Padding */}
              <View style={{ height: spacing.xl }} />
            </ScrollView>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (createSub.isPending || updateSub.isPending) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={createSub.isPending || updateSub.isPending}
            >
              <Text style={styles.submitButtonText}>
                {createSub.isPending || updateSub.isPending 
                  ? (isEditMode ? 'Saving...' : 'Adding...') 
                  : (isEditMode ? 'Save Changes' : 'Add Subscription')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  closeButton: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: spacing.sm,
  },
  form: {
    padding: spacing.lg,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  categoryScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.home,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cycleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cycleChip: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cycleChipActive: {
    backgroundColor: colors.home,
  },
  cycleText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cycleTextActive: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.home,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textSecondary,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: colors.textPrimary,
  },
  killSwitchSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.home,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
