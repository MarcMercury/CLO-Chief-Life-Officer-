import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCreateItem } from '@/hooks/useItems';
import { CircleType } from '@/types/database';

interface CreateItemModalProps {
  visible: boolean;
  onClose: () => void;
}

type ItemType = 'TASK' | 'NOTE' | 'EVENT';

const ITEM_TYPES: { type: ItemType; icon: string; label: string }[] = [
  { type: 'TASK', icon: '✓', label: 'Task' },
  { type: 'NOTE', icon: '📝', label: 'Note' },
  { type: 'EVENT', icon: '📅', label: 'Event' },
];

const CIRCLES: { circle: CircleType; icon: string; label: string; color: string }[] = [
  { circle: 'SELF', icon: '●', label: 'Self', color: '#6366f1' },
  { circle: 'RELATIONSHIPS', icon: '●●', label: 'Relationships', color: '#e17055' },
  { circle: 'HOME', icon: '▲', label: 'Home', color: '#84a98c' },
];

export default function CreateItemModal({ visible, onClose }: CreateItemModalProps) {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType>('TASK');
  const [selectedCircles, setSelectedCircles] = useState<CircleType[]>(['SELF']);
  const inputRef = useRef<TextInput>(null);
  
  const { mutate: createItem, isPending } = useCreateItem();
  
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
      // Auto-focus after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      translateY.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const toggleCircle = (circle: CircleType) => {
    Haptics.selectionAsync();
    setSelectedCircles((prev) => {
      if (prev.includes(circle)) {
        // Don't allow removing the last circle
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== circle);
      }
      return [...prev, circle];
    });
  };

  const selectType = (type: ItemType) => {
    Haptics.selectionAsync();
    setSelectedType(type);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Keyboard.dismiss();
    
    createItem(
      {
        title: title.trim(),
        item_type: selectedType,
        circles: selectedCircles,
      },
      {
        onSuccess: () => {
          // Reset form
          setTitle('');
          setSelectedType('TASK');
          setSelectedCircles(['SELF']);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setTitle('');
    setSelectedType('TASK');
    setSelectedCircles(['SELF']);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={styles.overlayPress} onPress={handleClose} />
        </Animated.View>
        
        <Animated.View style={[styles.container, animatedContainerStyle]}>
          {/* Handle bar */}
          <View style={styles.handleBar} />
          
          {/* Title */}
          <Text style={styles.modalTitle}>Create Item</Text>
          
          {/* Title Input */}
          <TextInput
            ref={inputRef}
            style={styles.titleInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            autoFocus={false}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          
          {/* Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Type</Text>
            <View style={styles.typeRow}>
              {ITEM_TYPES.map(({ type, icon, label }) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedType === type && styles.typeButtonSelected,
                  ]}
                  onPress={() => selectType(type)}
                >
                  <Text style={styles.typeIcon}>{icon}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type && styles.typeLabelSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Circle Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Circles</Text>
            <View style={styles.circleRow}>
              {CIRCLES.map(({ circle, icon, label, color }) => {
                const isSelected = selectedCircles.includes(circle);
                return (
                  <TouchableOpacity
                    key={circle}
                    style={[
                      styles.circleButton,
                      isSelected && { backgroundColor: `${color}20`, borderColor: color },
                    ]}
                    onPress={() => toggleCircle(circle)}
                  >
                    <Text style={[styles.circleIcon, { color: isSelected ? color : '#666' }]}>
                      {icon}
                    </Text>
                    <Text
                      style={[
                        styles.circleLabel,
                        isSelected && { color },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isPending && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isPending}
          >
            <Text style={styles.saveButtonText}>
              {isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayPress: {
    flex: 1,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 20,
    textAlign: 'center',
  },
  titleInput: {
    fontSize: 18,
    color: '#E0E0E0',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#E0E0E0',
  },
  typeIcon: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 14,
    color: '#888',
  },
  typeLabelSelected: {
    color: '#E0E0E0',
    fontWeight: '500',
  },
  circleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  circleButton: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  circleIcon: {
    fontSize: 14,
  },
  circleLabel: {
    fontSize: 12,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#121212',
  },
});
