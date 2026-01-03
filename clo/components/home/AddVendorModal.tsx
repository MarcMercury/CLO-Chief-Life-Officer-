/**
 * AddVendorModal Component
 * 
 * Modal for adding/editing vendors/service providers.
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
import { useCreateVendor, useUpdateVendor, useDeleteVendor, useProperties } from '@/hooks/useHomeOS';
import { usePropertyStore } from '@/store/propertyStore';
import { CreateVendorInput, Vendor } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';
import { formatPhoneInput } from '@/lib/formatters';
import { PropertyPicker } from './PropertyPicker';

const TRADES = [
  { value: 'plumber', label: 'Plumber', icon: '🔧' },
  { value: 'electrician', label: 'Electrician', icon: '⚡' },
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'landscaping', label: 'Landscaping', icon: '🌳' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'handyman', label: 'Handyman', icon: '🛠️' },
  { value: 'pest_control', label: 'Pest Control', icon: '🐛' },
  { value: 'roofing', label: 'Roofing', icon: '🏠' },
  { value: 'painting', label: 'Painting', icon: '🎨' },
  { value: 'appliance_repair', label: 'Appliance Repair', icon: '🔌' },
  { value: 'other', label: 'Other', icon: '👷' },
];

interface AddVendorModalProps {
  visible: boolean;
  onClose: () => void;
  editItem?: Vendor | null;
}

export function AddVendorModal({ visible, onClose, editItem }: AddVendorModalProps) {
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();
  const { data: properties = [] } = useProperties();
  const { selectedPropertyId: currentViewProperty } = usePropertyStore();
  
  const isEditMode = !!editItem;
  
  // Get default property (current view or primary)
  const getDefaultPropertyId = () => {
    if (currentViewProperty && currentViewProperty !== 'all') {
      return currentViewProperty;
    }
    const primary = properties.find(p => p.is_primary);
    return primary?.id || properties[0]?.id || null;
  };
  
  const [formData, setFormData] = useState<Partial<CreateVendorInput>>({
    trade: 'other',
    rating: 5,
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default property when modal opens or properties load
  useEffect(() => {
    if (visible && !selectedPropertyId && properties.length > 0) {
      setSelectedPropertyId(getDefaultPropertyId());
    }
  }, [visible, properties]);

  // Populate form when editing
  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        trade: editItem.trade,
        phone: editItem.phone || '',
        email: editItem.email || '',
        website: editItem.website || '',
        rating: editItem.rating || 5,
        notes: editItem.notes || '',
      });
      // Set property from edit item
      setSelectedPropertyId((editItem as any).property_id || null);
    }
  }, [editItem]);

  const updateField = (field: keyof CreateVendorInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Company/Person name is required';
    }
    if (!formData.trade) {
      newErrors.trade = 'Trade is required';
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
      const vendorData = {
        name: formData.name!,
        trade: formData.trade!,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        rating: formData.rating || 5,
        notes: formData.notes || undefined,
        property_id: selectedPropertyId || undefined,
      };

      if (isEditMode && editItem) {
        await updateVendor.mutateAsync({ id: editItem.id, updates: vendorData });
      } else {
        await createVendor.mutateAsync(vendorData);
      }
      
      haptics.success();
      handleClose();
    } catch (error) {
      haptics.error();
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} vendor. Please try again.`);
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    
    Alert.alert(
      'Delete Vendor',
      `Are you sure you want to delete "${editItem.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteVendor.mutateAsync(editItem.id);
              haptics.success();
              handleClose();
            } catch (error) {
              haptics.error();
              Alert.alert('Error', 'Failed to delete vendor. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleClose = () => {
    setFormData({ trade: 'other', rating: 5 });
    setSelectedPropertyId(null);
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
              <Text style={styles.title}>{isEditMode ? 'Edit Vendor' : 'Add Vendor'}</Text>
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
              {/* Property Selector - Only show if multiple properties */}
              <PropertyPicker
                selectedPropertyId={selectedPropertyId}
                onSelect={setSelectedPropertyId}
                label="Add to Property"
                accentColor={colors.home}
              />

              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Company/Person Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g., ABC Plumbing"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.name || ''}
                  onChangeText={(v) => updateField('name', v)}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Trade/Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Trade/Service *</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  {TRADES.map((trade) => (
                    <TouchableOpacity
                      key={trade.value}
                      style={[
                        styles.categoryChip,
                        formData.trade === trade.value && styles.categoryChipActive
                      ]}
                      onPress={() => {
                        haptics.selection();
                        updateField('trade', trade.value);
                      }}
                    >
                      <Text style={styles.categoryIcon}>{trade.icon}</Text>
                      <Text style={[
                        styles.categoryText,
                        formData.trade === trade.value && styles.categoryTextActive
                      ]}>{trade.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Phone */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.phone || ''}
                  onChangeText={(v) => updateField('phone', formatPhoneInput(v))}
                  keyboardType="phone-pad"
                  maxLength={14}
                />
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="contact@abcplumbing.com"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.email || ''}
                  onChangeText={(v) => updateField('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Website */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Website</Text>
                <TextInput
                  style={styles.input}
                  placeholder="www.abcplumbing.com"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.website || ''}
                  onChangeText={(v) => updateField('website', v)}
                  autoCapitalize="none"
                />
              </View>

              {/* Rating */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Rating</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        haptics.selection();
                        updateField('rating', star);
                      }}
                    >
                      <Text style={styles.ratingStar}>
                        {star <= (formData.rating || 5) ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g., Great service, fixed the leak quickly"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.notes || ''}
                  onChangeText={(v) => updateField('notes', v)}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, (createVendor.isPending || updateVendor.isPending) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={createVendor.isPending || updateVendor.isPending}
              >
                <Text style={styles.submitButtonText}>
                  {createVendor.isPending || updateVendor.isPending 
                    ? (isEditMode ? 'Saving...' : 'Adding...') 
                    : (isEditMode ? 'Save Changes' : 'Add Vendor')}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  deleteButtonText: {
    fontSize: 20,
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
    minHeight: 80,
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
  ratingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingStar: {
    fontSize: 32,
    color: colors.warning,
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
