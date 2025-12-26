import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface ItemCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  accentColor: string;
  rightContent?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  index?: number;
  isCompleted?: boolean;
}

export default function ItemCard({
  title,
  subtitle,
  icon,
  accentColor,
  rightContent,
  onPress,
  onLongPress,
  index = 0,
  isCompleted = false,
}: ItemCardProps) {
  
  const handlePress = () => {
    if (onPress) {
      Haptics.selectionAsync();
      onPress();
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 40).duration(300)}>
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: `${accentColor}10` },
          isCompleted && styles.completedContainer
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
        
        <View style={styles.content}>
          <Text style={[
            styles.title,
            isCompleted && styles.completedText
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        
        {rightContent && (
          <View style={styles.rightContent}>
            {rightContent}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  completedContainer: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#E0E0E0',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
});
