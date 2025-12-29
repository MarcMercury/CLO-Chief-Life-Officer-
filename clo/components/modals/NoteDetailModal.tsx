/**
 * NoteDetailModal - View/Edit notes with pins and colors
 */

import React, { useState, useEffect, useRef } from 'react';
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
  ScrollView,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { ItemWithCircles } from '@/types/database';

type NoteColor = 'default' | 'yellow' | 'blue' | 'green' | 'pink';

interface NoteDetailModalProps {
  visible: boolean;
  note: ItemWithCircles | null;
  onClose: () => void;
  onUpdate: (noteId: string, updates: { title?: string; pinned?: boolean; color?: NoteColor }) => void;
  onDelete: (noteId: string) => void;
}

const NOTE_COLORS: { id: NoteColor; bg: string; text: string; label: string }[] = [
  { id: 'default', bg: colors.surface, text: colors.textPrimary, label: 'Default' },
  { id: 'yellow', bg: '#FEF3C7', text: '#92400E', label: 'Yellow' },
  { id: 'blue', bg: '#DBEAFE', text: '#1E40AF', label: 'Blue' },
  { id: 'green', bg: '#D1FAE5', text: '#065F46', label: 'Green' },
  { id: 'pink', bg: '#FCE7F3', text: '#9D174D', label: 'Pink' },
];

export default function NoteDetailModal({ 
  visible, 
  note, 
  onClose, 
  onUpdate, 
  onDelete 
}: NoteDetailModalProps) {
  const [title, setTitle] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedColor, setSelectedColor] = useState<NoteColor>('default');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible && note) {
      // Populate from note
      setTitle(note.title);
      const metadata = note.metadata as any;
      setIsPinned(metadata?.pinned || false);
      setSelectedColor(metadata?.color || 'default');
      
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, note]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleSave = () => {
    if (!title.trim() || !note) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Keyboard.dismiss();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    onUpdate(note.id, {
      title: title.trim(),
      pinned: isPinned,
      color: selectedColor,
    });
    
    onClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDelete = () => {
    if (!note) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowDeleteConfirm(false);
    onDelete(note.id);
    onClose();
  };

  const togglePin = () => {
    Haptics.selectionAsync();
    setIsPinned(!isPinned);
  };

  const selectColor = (color: NoteColor) => {
    Haptics.selectionAsync();
    setSelectedColor(color);
  };

  const currentColorConfig = NOTE_COLORS.find(c => c.id === selectedColor) || NOTE_COLORS[0];

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
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Note</Text>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, styles.saveButton]}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Note Preview Card */}
            <View style={[
              styles.previewCard,
              { backgroundColor: currentColorConfig.bg },
              selectedColor !== 'default' && styles.previewCardColored,
            ]}>
              {isPinned && (
                <View style={styles.pinnedBadge}>
                  <Text style={styles.pinnedIcon}>📌</Text>
                </View>
              )}
              <TextInput
                ref={inputRef}
                style={[styles.titleInput, { color: currentColorConfig.text }]}
                placeholder="Note content..."
                placeholderTextColor={currentColorConfig.text + '60'}
                value={title}
                onChangeText={setTitle}
                multiline
                textAlignVertical="top"
              />
            </View>
            
            {/* Pin Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Pin to Top</Text>
              <TouchableOpacity
                style={[styles.pinToggle, isPinned && styles.pinToggleActive]}
                onPress={togglePin}
              >
                <Text style={styles.pinIcon}>{isPinned ? '📌' : '📍'}</Text>
                <Text style={[styles.pinLabel, isPinned && styles.pinLabelActive]}>
                  {isPinned ? 'Pinned' : 'Not Pinned'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Color Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Color</Text>
              <View style={styles.colorRow}>
                {NOTE_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color.id}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.bg },
                      selectedColor === color.id && styles.colorOptionSelected,
                    ]}
                    onPress={() => selectColor(color.id)}
                  >
                    {selectedColor === color.id && (
                      <Text style={[styles.colorCheck, { color: color.text }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Delete Section */}
            <View style={styles.dangerSection}>
              {showDeleteConfirm ? (
                <View style={styles.deleteConfirm}>
                  <Text style={styles.deleteConfirmText}>Delete this note?</Text>
                  <View style={styles.deleteConfirmButtons}>
                    <TouchableOpacity
                      style={styles.deleteConfirmCancel}
                      onPress={() => setShowDeleteConfirm(false)}
                    >
                      <Text style={styles.deleteConfirmCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteConfirmDelete}
                      onPress={handleDelete}
                    >
                      <Text style={styles.deleteConfirmDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Delete Note</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
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
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '85%',
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.sm,
  },
  headerButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveButton: {
    color: colors.self,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  
  // Preview Card
  previewCard: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewCardColored: {
    borderColor: 'transparent',
  },
  pinnedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  pinnedIcon: {
    fontSize: 16,
  },
  titleInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 80,
  },
  
  // Section
  section: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  
  // Pin Toggle
  pinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pinToggleActive: {
    backgroundColor: `${colors.self}15`,
    borderColor: colors.self,
  },
  pinIcon: {
    fontSize: 18,
  },
  pinLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  pinLabelActive: {
    color: colors.self,
    fontWeight: '500',
  },
  
  // Color Row
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.textPrimary,
  },
  colorCheck: {
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Danger Section
  dangerSection: {
    marginTop: spacing['2xl'],
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  deleteButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 15,
    color: colors.error,
  },
  deleteConfirm: {
    backgroundColor: `${colors.error}10`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  deleteConfirmText: {
    fontSize: 15,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deleteConfirmCancel: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteConfirmCancelText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteConfirmDelete: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteConfirmDeleteText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
});
