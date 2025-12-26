import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ItemWithCircles, CircleType } from '@/types/database';
import { useUpdateItemStatus } from '@/hooks/useItems';

interface UniversalItemCardProps {
  item: ItemWithCircles;
  index?: number;
  onPress?: () => void;
  onLongPress?: () => void;
}

const CIRCLE_COLORS: Record<CircleType, string> = {
  SELF: '#6366f1',
  RELATIONSHIPS: '#e17055',
  HOME: '#84a98c',
};

const TYPE_ICONS: Record<string, string> = {
  TASK: '✓',
  NOTE: '📝',
  EVENT: '📅',
  MEMORY: '💭',
};

export default function UniversalItemCard({
  item,
  index = 0,
  onPress,
  onLongPress,
}: UniversalItemCardProps) {
  const { mutate: updateStatus } = useUpdateItemStatus();
  
  const isCompleted = item.status === 'COMPLETED';
  const isTask = item.item_type === 'TASK';

  const handleToggleComplete = () => {
    if (!isTask) return;
    
    updateStatus({
      itemId: item.id,
      status: isCompleted ? 'PENDING' : 'COMPLETED',
    });
  };

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
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <TouchableOpacity
        style={[styles.container, isCompleted && styles.containerCompleted]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        {/* Checkbox for tasks */}
        {isTask && (
          <TouchableOpacity
            style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
            onPress={handleToggleComplete}
          >
            {isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        )}
        
        {/* Non-task icon */}
        {!isTask && (
          <View style={styles.typeIcon}>
            <Text style={styles.typeIconText}>{TYPE_ICONS[item.item_type] || '•'}</Text>
          </View>
        )}
        
        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          
          {item.description && (
            <Text style={styles.description} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          
          {/* Circle indicators */}
          <View style={styles.circlesRow}>
            {item.circles?.map((circle) => (
              <View
                key={circle}
                style={[styles.circleDot, { backgroundColor: CIRCLE_COLORS[circle] }]}
              />
            ))}
            {item.due_date && (
              <Text style={styles.dueDate}>
                {new Date(item.due_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  containerCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  checkmark: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: '600',
  },
  typeIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  typeIconText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '400',
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  circlesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  circleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});
