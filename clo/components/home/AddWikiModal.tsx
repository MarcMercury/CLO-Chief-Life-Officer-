/**
 * AddWikiModal Component
 * 
 * Modal for adding household manual entries (WiFi, gate codes, etc).
 */

import React, { useState } from 'react';
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
import { useCreateMaintenanceSchedule } from '@/hooks/useHomeOS';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';

const WIKI_CATEGORIES = [
  { value: 'wifi_network', label: 'WiFi/Network', icon: '📶' },
  { value: 'gate_codes', label: 'Gate Codes', icon: '🔐' },
  { value: 'trash_schedule', label: 'Trash Schedule', icon: '🗑️' },
  { value: 'utilities', label: 'Utilities', icon: '💡' },
  { value: 'emergency_contacts', label: 'Emergency', icon: '🚨' },
  { value: 'parking', label: 'Parking', icon: '🅿️' },
  { value: 'appliance_tips', label: 'Appliance Tips', icon: '💡' },
  { value: 'seasonal', label: 'Seasonal', icon: '🌸' },
  { value: 'other', label: 'Other', icon: '📝' },
];

interface WikiEntry {
  category: string;
  title: string;
  content: string;
}

interface AddWikiModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (entry: WikiEntry) => void;
}

export function AddWikiModal({ visible, onClose, onSave }: AddWikiModalProps) {
  const [formData, setFormData] = useState<Partial<WikiEntry>>({
    category: 'other',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof WikiEntry, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content?.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      haptics.error();
      return;
    }

    setIsSaving(true);
    
    try {
      // For now, we'll use local storage or pass to parent
      // In future, this would save to a wiki_entries table
      if (onSave) {
        onSave({
          category: formData.category || 'other',
          title: formData.title!,
          content: formData.content!,
        });
      }
      
      haptics.success();
      handleClose();
      Alert.alert('Success', 'Entry added to your household manual!');
    } catch (error) {
      haptics.error();
      Alert.alert('Error', 'Failed to add entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({ category: 'other' });
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
              <Text style={styles.title}>Add Manual Entry</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.form}
              showsVerticalScrollIndicator={false}
            >
              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Category</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {WIKI_CATEGORIES.map((cat) => (
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
                      ]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Title */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="e.g., Home WiFi"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.title || ''}
                  onChangeText={(v) => updateField('title', v)}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              {/* Content */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Content *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.content && styles.inputError]}
                  placeholder="Network: MyWiFi_5G&#10;Password: secret123"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.content || ''}
                  onChangeText={(v) => updateField('content', v)}
                  multiline
                  numberOfLines={5}
                />
                {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}
              </View>

              <Text style={styles.tipText}>
                💡 Tip: Add WiFi passwords, gate codes, trash schedules, and other household info here
              </Text>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSaving && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSaving}
              >
                <Text style={styles.submitButtonText}>
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  keyboardView: {
    maxHeight: '90%',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textSecondary,
    padding: spacing.xs,
  },
  form: {
    padding: spacing.lg,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.home + '20',
    borderColor: colors.home,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.home,
    fontWeight: '500',
  },
  tipText: {
    fontSize: 13,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: colors.home,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
