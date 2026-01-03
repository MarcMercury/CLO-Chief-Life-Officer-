/**
 * AddInventoryModal Component
 * 
 * Modal for adding/editing inventory items with optional barcode scanning.
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
import { useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, useProperties } from '@/hooks/useHomeOS';
import { usePropertyStore } from '@/store/propertyStore';
import { InventoryCategory, CreateInventoryItemInput, HomeInventoryItem } from '@/types/homeos';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';
import { formatDateInput, parseDateInput, formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters';
import { PropertyPicker } from './PropertyPicker';

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
  editItem?: HomeInventoryItem | null;
}

export function AddInventoryModal({ visible, onClose, editItem }: AddInventoryModalProps) {
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
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
  
  const [formData, setFormData] = useState<Partial<CreateInventoryItemInput>>({
    category: 'other',
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
        category: editItem.category,
        brand: editItem.brand || '',
        model_number: editItem.model_number || '',
        serial_number: editItem.serial_number || '',
        purchase_date: editItem.purchase_date ? formatDateFromDB(editItem.purchase_date) : '',
        purchase_price: editItem.purchase_price?.toString() || '',
        purchase_location: editItem.purchase_location || '',
        warranty_expires: editItem.warranty_expires ? formatDateFromDB(editItem.warranty_expires) : '',
        notes: editItem.notes || '',
        location_in_home: editItem.location_in_home || '',
        barcode: editItem.barcode || '',
      });
      // Set property from edit item
      setSelectedPropertyId((editItem as any).property_id || null);
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
      const purchaseDate = parseDateInput(formData.purchase_date);
      const warrantyExpires = parseDateInput(formData.warranty_expires);
      const purchasePrice = typeof formData.purchase_price === 'string' 
        ? parseCurrencyInput(formData.purchase_price)
        : formData.purchase_price;
      
      const itemData = {
        name: formData.name!,
        category: formData.category!,
        brand: formData.brand || undefined,
        model_number: formData.model_number || undefined,
        serial_number: formData.serial_number || undefined,
        purchase_date: purchaseDate,
        purchase_price: purchasePrice,
        purchase_location: formData.purchase_location || undefined,
        warranty_expires: warrantyExpires,
        notes: formData.notes || undefined,
        location_in_home: formData.location_in_home || undefined,
        barcode: formData.barcode || undefined,
        property_id: selectedPropertyId || undefined,
      };

      if (isEditMode && editItem) {
        await updateItem.mutateAsync({ id: editItem.id, updates: itemData });
      } else {
        await createItem.mutateAsync(itemData);
      }
      
      haptics.success();
      handleClose();
    } catch (error) {
      haptics.error();
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} item. Please try again.`);
    }
  };

  const handleDelete = () => {
    if (!editItem) return;
    
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${editItem.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteItem.mutateAsync(editItem.id);
              haptics.success();
              handleClose();
            } catch (error) {
              haptics.error();
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleClose = () => {
    setFormData({ category: 'other' });
    setSelectedPropertyId(null);
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
              <Text style={styles.title}>{isEditMode ? 'Edit Item' : 'Add Inventory Item'}</Text>
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
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    value={formData.purchase_date || ''}
                    onChangeText={(v) => updateField('purchase_date', formatDateInput(v))}
                    maxLength={10}
                  />
                </View>
                <View style={[styles.fieldGroup, { flex: 1, marginLeft: spacing.sm }]}>
                  <Text style={styles.label}>Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="$0.00"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="decimal-pad"
                    value={formData.purchase_price?.toString() || ''}
                    onChangeText={(v) => updateField('purchase_price', formatCurrencyInput(v))}
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
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  value={formData.warranty_expires || ''}
                  onChangeText={(v) => updateField('warranty_expires', formatDateInput(v))}
                  maxLength={10}
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
                (createItem.isPending || updateItem.isPending) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={createItem.isPending || updateItem.isPending}
            >
              <Text style={styles.submitButtonText}>
                {createItem.isPending || updateItem.isPending 
                  ? (isEditMode ? 'Saving...' : 'Adding...') 
                  : (isEditMode ? 'Save Changes' : 'Add Item')}
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
