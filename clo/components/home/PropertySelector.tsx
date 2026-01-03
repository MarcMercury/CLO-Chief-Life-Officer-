/**
 * PropertySelector - Dropdown to switch between properties/homes
 * 
 * Displayed as the page title that expands into a dropdown menu.
 * Allows users to switch between their different properties.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useProperties, useCreateProperty, useSetPrimaryProperty, Property } from '@/hooks/useHomeOS';
import { usePropertyStore } from '@/store/propertyStore';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface PropertySelectorProps {
  accentColor?: string;
}

const PROPERTY_ICONS = ['🏠', '🏡', '🏢', '🏖️', '🏔️', '🏕️', '🚗', '📦', '🏪', '🏭'];

export function PropertySelector({ accentColor = colors.home }: PropertySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyIcon, setNewPropertyIcon] = useState('🏠');
  const [newPropertyAddress, setNewPropertyAddress] = useState('');
  
  const { data: properties = [], isLoading } = useProperties();
  const createProperty = useCreateProperty();
  const setPrimary = useSetPrimaryProperty();
  const { selectedPropertyId, setSelectedProperty } = usePropertyStore();
  
  // Determine which property is currently selected
  const getSelectedProperty = (): Property | null => {
    if (!properties.length) return null;
    
    if (selectedPropertyId === 'all') {
      return null; // "All Properties" mode
    }
    
    if (selectedPropertyId) {
      const found = properties.find(p => p.id === selectedPropertyId);
      if (found) return found;
    }
    
    // Default to primary property
    const primary = properties.find(p => p.is_primary);
    return primary || properties[0] || null;
  };
  
  const selectedProperty = getSelectedProperty();
  const displayName = selectedPropertyId === 'all' 
    ? 'All Properties' 
    : selectedProperty?.name || 'Add a Home';
  const displayIcon = selectedPropertyId === 'all'
    ? '🏘️'
    : selectedProperty?.icon || '➕';

  const handleSelectProperty = (property: Property | 'all') => {
    Haptics.selectionAsync();
    if (property === 'all') {
      setSelectedProperty('all');
    } else {
      setSelectedProperty(property.id);
    }
    setIsOpen(false);
  };

  const handleAddProperty = async () => {
    if (!newPropertyName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this property.');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const result = await createProperty.mutateAsync({
      name: newPropertyName.trim(),
      icon: newPropertyIcon,
      address: newPropertyAddress.trim() || undefined,
      is_primary: properties.length === 0, // First property is primary
    });
    
    if (result) {
      setNewPropertyName('');
      setNewPropertyAddress('');
      setNewPropertyIcon('🏠');
      setShowAddModal(false);
      
      // Select the new property
      setSelectedProperty(result.id);
    }
  };

  const handleSetPrimary = async (property: Property) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setPrimary.mutateAsync(property.id);
  };

  return (
    <>
      {/* Title/Dropdown Trigger */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => {
          Haptics.selectionAsync();
          setIsOpen(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerIcon}>{displayIcon}</Text>
        <Text style={[styles.triggerText, { color: accentColor }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Animated.View 
            entering={SlideInUp.duration(200)}
            exiting={SlideOutUp.duration(150)}
            style={styles.dropdown}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Property</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.propertyList} showsVerticalScrollIndicator={false}>
              {/* All Properties Option */}
              <TouchableOpacity
                style={[
                  styles.propertyItem,
                  selectedPropertyId === 'all' && styles.propertyItemSelected,
                ]}
                onPress={() => handleSelectProperty('all')}
              >
                <Text style={styles.propertyIcon}>🏘️</Text>
                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyName}>All Properties</Text>
                  <Text style={styles.propertySubtext}>View everything</Text>
                </View>
                {selectedPropertyId === 'all' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Property List */}
              {properties.map((property) => (
                <TouchableOpacity
                  key={property.id}
                  style={[
                    styles.propertyItem,
                    selectedProperty?.id === property.id && 
                    selectedPropertyId !== 'all' && 
                    styles.propertyItemSelected,
                  ]}
                  onPress={() => handleSelectProperty(property)}
                  onLongPress={() => handleSetPrimary(property)}
                >
                  <Text style={styles.propertyIcon}>{property.icon}</Text>
                  <View style={styles.propertyInfo}>
                    <View style={styles.propertyNameRow}>
                      <Text style={styles.propertyName}>{property.name}</Text>
                      {property.is_primary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                      )}
                    </View>
                    {property.address && (
                      <Text style={styles.propertySubtext} numberOfLines={1}>
                        {property.address}
                      </Text>
                    )}
                  </View>
                  {selectedProperty?.id === property.id && 
                   selectedPropertyId !== 'all' && (
                    <Text style={[styles.checkmark, { color: accentColor }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}

              {/* Add New Property Button */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setIsOpen(false);
                  setTimeout(() => setShowAddModal(true), 200);
                }}
              >
                <Text style={styles.addButtonIcon}>➕</Text>
                <Text style={styles.addButtonText}>Add New Property</Text>
              </TouchableOpacity>
            </ScrollView>

            <Text style={styles.hint}>
              Long press a property to set it as primary
            </Text>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Add Property Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => setShowAddModal(false)}
        >
          <Pressable style={styles.addModal} onPress={e => e.stopPropagation()}>
            <Text style={styles.addModalTitle}>Add New Property</Text>
            
            {/* Icon Selector */}
            <View style={styles.iconSelector}>
              <Text style={styles.inputLabel}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.iconRow}>
                  {PROPERTY_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        newPropertyIcon === icon && styles.iconOptionSelected,
                      ]}
                      onPress={() => setNewPropertyIcon(icon)}
                    >
                      <Text style={styles.iconOptionText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                value={newPropertyName}
                onChangeText={setNewPropertyName}
                placeholder="e.g., Beach House"
                placeholderTextColor="#666"
                autoFocus
              />
            </View>

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address (optional)</Text>
              <TextInput
                style={styles.input}
                value={newPropertyAddress}
                onChangeText={setNewPropertyAddress}
                placeholder="123 Main St, City, State"
                placeholderTextColor="#666"
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: accentColor }]}
                onPress={handleAddProperty}
                disabled={createProperty.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {createProperty.isPending ? 'Adding...' : 'Add Property'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Trigger Button
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  triggerIcon: {
    fontSize: 20,
  },
  triggerText: {
    fontSize: 18,
    fontWeight: '600',
    maxWidth: 200,
  },
  chevron: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },

  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 20,
  },

  // Dropdown
  dropdown: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    maxHeight: 450,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },

  // Property List
  propertyList: {
    maxHeight: 300,
  },
  propertyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  propertyItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  propertyIcon: {
    fontSize: 28,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  propertySubtext: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  primaryBadge: {
    backgroundColor: 'rgba(132, 169, 140, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: colors.home,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginTop: 8,
  },
  addButtonIcon: {
    fontSize: 24,
  },
  addButtonText: {
    fontSize: 15,
    color: colors.home,
    fontWeight: '500',
  },

  hint: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },

  // Add Modal
  addModal: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  iconSelector: {
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOptionSelected: {
    backgroundColor: 'rgba(132, 169, 140, 0.3)',
    borderWidth: 2,
    borderColor: colors.home,
  },
  iconOptionText: {
    fontSize: 22,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
});

export default PropertySelector;
