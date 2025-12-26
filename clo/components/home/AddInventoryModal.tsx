/**
 * AddInventoryModal Component
 * 
 * Modal for adding new inventory items with optional barcode scanning.
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
import { useCreateInventoryItem } from '@/hooks/useHomeOS';
import { InventoryCategory, CreateInventoryItemInput } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';

const CATEGORIES: { value: InventoryCategory; label: string; icon: string }[] = [
  { value: 'appliance', label: 'Appliance', icon: '🔌' },
  { value: 'electronics', label: 'Electronics', icon: '📱' },
  { value: 'furniture', label: 'Furniture', icon: '🛋️' },
  { value: 'hvac', label: 'HVAC', icon: '❄️' },
  { value: 'plumbing', label: 'Plumbing', icon: '🚿' },
  { value: 'outdoor', label: 'Outdoor', icon: '🌳' },
  { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
  { value: 'other', label: 'Other', icon: '📦' },
];

interface AddInventoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddInventoryModal({ visible, onClose }: AddInventoryModalProps) {
  const createItem = useCreateInventoryItem();
  
  const [formData, setFormData] = useState<Partial<CreateInventoryItemInput>>({
    category: 'other',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof CreateInventoryItemInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
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
      await createItem.mutateAsync({
        name: formData.name!,
        category: formData.category!,
        brand: formData.brand || undefined,
        model_number: formData.model_number || undefined,
        serial_number: formData.serial_number || undefined,
        purchase_date: formData.purchase_date || undefined,
        purchase_price: formData.purchase_price || undefined,
        purchase_location: formData.purchase_location || undefined,
        warranty_expires: formData.warranty_expires || undefined,
        notes: formData.notes || undefined,
        location_in_home: formData.location_in_home || undefined,
        barcode: formData.barcode || undefined,
      });
      
      haptics.success();
      handleClose();
    } catch (error) {
      haptics.error();
      Alert.alert('Error', 'Failed to add item. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({ category: 'other' });
    setErrors({});
    onClose();
  };

  const handleScanBarcode = async () => {
    // TODO: Implement barcode scanning with expo-barcode-scanner
    haptics.tapMedium();
    Alert.alert(
      'Coming Soon',
      'Barcode scanning will be available in a future update.',
      [{ text: 'OK' }]
    );
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
              <Text style={styles.title}>Add Inventory Item</Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.form}
              showsVerticalScrollIndicator={false}
            >
              {/* Barcode Scanner Button */}
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScanBarcode}
              >
                <Text style={styles.scanIcon}>📷</Text>
                <Text style={styles.scanText}>Scan Barcode</Text>
              </TouchableOpacity>

              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Item Name *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="e.g., Samsung Refrigerator"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.name || ''}
                  onChangeText={(v) => updateField('name', v)}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Category */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Category *</Text>
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

              {/* Brand & Model */}
              <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Brand</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Samsung"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.brand || ''}
                    onChangeText={(v) => updateField('brand', v)}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1, marginLeft: spacing.sm }]}>
                  <Text style={styles.label}>Model #</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="RF28R7351SR"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.model_number || ''}
                    onChangeText={(v) => updateField('model_number', v)}
                  />
                </View>
              </View>

              {/* Serial Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Serial Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Optional"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.serial_number || ''}
                  onChangeText={(v) => updateField('serial_number', v)}
                />
              </View>

              {/* Purchase Info */}
              <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Purchase Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textTertiary}
                    value={formData.purchase_date || ''}
                    onChangeText={(v) => updateField('purchase_date', v)}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1, marginLeft: spacing.sm }]}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="$0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    value={formData.purchase_price?.toString() || ''}
                    onChangeText={(v) => updateField('purchase_price', parseFloat(v) || undefined)}
                  />
                </View>
              </View>

              {/* Purchase Location */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Purchased From</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Best Buy, Amazon, etc."
                  placeholderTextColor={colors.textTertiary}
                  value={formData.purchase_location || ''}
                  onChangeText={(v) => updateField('purchase_location', v)}
                />
              </View>

              {/* Warranty */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Warranty Expires</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  value={formData.warranty_expires || ''}
                  onChangeText={(v) => updateField('warranty_expires', v)}
                />
              </View>

              {/* Location in Home */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Location in Home</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Kitchen, Garage, etc."
                  placeholderTextColor={colors.textTertiary}
                  value={formData.location_in_home || ''}
                  onChangeText={(v) => updateField('location_in_home', v)}
                />
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
                createItem.isPending && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={createItem.isPending}
            >
              <Text style={styles.submitButtonText}>
                {createItem.isPending ? 'Adding...' : 'Add Item'}
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
  closeButton: {
    fontSize: 20,
    color: colors.textSecondary,
    padding: spacing.sm,
  },
  form: {
    padding: spacing.lg,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.home,
    borderStyle: 'dashed',
  },
  scanIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  scanText: {
    fontSize: 16,
    color: colors.home,
    fontWeight: '500',
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
