import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  accentColor: string;
  size?: 'small' | 'medium' | 'large';
}

export default function QuickAction({ 
  icon, 
  label, 
  onPress, 
  accentColor,
  size = 'medium' 
}: QuickActionProps) {
  
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyles = {
    small: { width: 60, height: 60, iconSize: 20, labelSize: 10 },
    medium: { width: 80, height: 80, iconSize: 28, labelSize: 11 },
    large: { width: 100, height: 100, iconSize: 32, labelSize: 12 },
  };

  const s = sizeStyles[size];

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          width: s.width, 
          height: s.height,
          backgroundColor: `${accentColor}15`,
          borderColor: `${accentColor}30`,
        }
      ]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, { fontSize: s.iconSize }]}>{icon}</Text>
      <Text style={[styles.label, { fontSize: s.labelSize, color: accentColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
