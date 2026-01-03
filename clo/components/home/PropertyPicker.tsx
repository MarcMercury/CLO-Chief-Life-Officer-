/**
 * PropertyPicker - Inline property selector for add/edit modals
 * 
 * Allows users to select which property(s) an item belongs to.
 * Supports selecting a single property or "All Properties".
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useProperties, Property } from '@/hooks/useHomeOS';
import { usePropertyStore } from '@/store/propertyStore';
import { colors, spacing, borderRadius } from '@/constants/theme';

interface PropertyPickerProps {
  selectedPropertyId: string | null;
  onSelect: (propertyId: string | null) => void;
  allowAll?: boolean; // Allow "All Properties" option
  label?: string;
  accentColor?: string;
}

export function PropertyPicker({
  selectedPropertyId,
  onSelect,
  allowAll = false,
  label = 'Property',
  accentColor = colors.home,
}: PropertyPickerProps) {
  const { data: properties = [] } = useProperties();
  const { selectedPropertyId: currentlyViewingProperty } = usePropertyStore();
  
  // Get primary property as default
  const primaryProperty = properties.find(p => p.is_primary);
  const defaultPropertyId = selectedPropertyId ?? currentlyViewingProperty ?? primaryProperty?.id ?? null;
  
  // If only one property, auto-select it and don't show picker
  if (properties.length === 1) {
    // Auto-select the only property
    if (selectedPropertyId !== properties[0].id) {
      onSelect(properties[0].id);
    }
    return null; // Don't render picker for single property
  }
  
  // If no properties exist, don't show picker
  if (properties.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* All Properties Option */}
        {allowAll && (
          <TouchableOpacity
            style={[
              styles.chip,
              defaultPropertyId === null && styles.chipActive,
              defaultPropertyId === null && { borderColor: accentColor },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(null);
            }}
          >
            <Text style={styles.chipIcon}>🏘️</Text>
            <Text style={[
              styles.chipText,
              defaultPropertyId === null && { color: accentColor },
            ]}>
              All
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Property Options */}
        {properties.map((property) => (
          <TouchableOpacity
            key={property.id}
            style={[
              styles.chip,
              defaultPropertyId === property.id && styles.chipActive,
              defaultPropertyId === property.id && { borderColor: accentColor },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onSelect(property.id);
            }}
          >
            <Text style={styles.chipIcon}>{property.icon}</Text>
            <Text 
              style={[
                styles.chipText,
                defaultPropertyId === property.id && { color: accentColor },
              ]}
              numberOfLines={1}
            >
              {property.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  scrollView: {
    marginHorizontal: -4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(132, 169, 140, 0.15)',
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    maxWidth: 100,
  },
});

export default PropertyPicker;
