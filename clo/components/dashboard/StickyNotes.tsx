/**
 * StickyNotes Component
 * 
 * A reusable sticky notes grid for capturing quick notes/ideas.
 * Used in Dashboard and Professional module.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import {
  useIdeas,
  useCreateIdea,
  useUpdateIdea,
  useDeleteIdea,
} from '@/hooks/useSelf';

const IDEA_COLORS = [
  '#FBBF24', // Yellow
  '#34D399', // Green  
  '#60A5FA', // Blue
  '#F472B6', // Pink
  '#A78BFA', // Purple
  '#FB923C', // Orange
];

interface Idea {
  id: string;
  idea_title: string;
  idea_content?: string;
  color: string;
  created_at: string;
}

interface StickyNotesProps {
  title?: string;
}

export function StickyNotes({ title = 'Sticky Notes' }: StickyNotesProps) {
  const [showInput, setShowInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState(IDEA_COLORS[0]);
  
  // Edit modal state
  const [editingNote, setEditingNote] = useState<Idea | null>(null);
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState(IDEA_COLORS[0]);

  // Data hooks
  const { data: notes = [] } = useIdeas();
  const createNote = useCreateIdea();
  const updateNote = useUpdateIdea();
  const deleteNote = useDeleteIdea();

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim()) return;

    await createNote.mutateAsync({
      ideaTitle: noteText.trim(),
      color: selectedColor,
    });

    setNoteText('');
    setSelectedColor(IDEA_COLORS[0]);
    setShowInput(false);
  }, [noteText, selectedColor, createNote]);

  const handleEditNote = useCallback((note: Idea) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingNote(note);
    setEditText(note.idea_title);
    setEditColor(note.color || IDEA_COLORS[0]);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingNote || !editText.trim()) return;

    await updateNote.mutateAsync({
      id: editingNote.id,
      updates: {
        idea_title: editText.trim(),
        color: editColor,
      },
    });

    setEditingNote(null);
    setEditText('');
  }, [editingNote, editText, editColor, updateNote]);

  const handleDeleteNote = useCallback(() => {
    if (!editingNote) return;
    Alert.alert('Delete Note', 'Remove this sticky note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteNote.mutate(editingNote.id);
          setEditingNote(null);
        },
      },
    ]);
  }, [editingNote, deleteNote]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={() => setShowInput(!showInput)}>
          <Text style={styles.addButton}>{showInput ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {/* Add note form */}
      {showInput && (
        <Animated.View entering={FadeInUp.duration(200)} style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Write a note..."
            placeholderTextColor={colors.textTertiary}
            value={noteText}
            onChangeText={setNoteText}
            multiline
            autoFocus
          />

          {/* Color picker */}
          <View style={styles.colorPicker}>
            {IDEA_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedColor(color);
                }}
              />
            ))}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setShowInput(false);
                setNoteText('');
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, !noteText.trim() && styles.saveBtnDisabled]}
              onPress={handleAddNote}
              disabled={!noteText.trim()}
            >
              <Text style={styles.saveBtnText}>Add Note</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Notes grid */}
      {notes.length === 0 && !showInput ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No sticky notes yet</Text>
          <Text style={styles.emptyHint}>Tap + to add your first note</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {notes.map((note, index) => (
            <Animated.View
              key={note.id}
              entering={FadeInUp.delay(index * 30).duration(200)}
              style={[
                styles.noteCard,
                { backgroundColor: note.color || IDEA_COLORS[0] },
              ]}
            >
              <TouchableOpacity
                onLongPress={() => handleEditNote(note as Idea)}
                style={styles.noteCardInner}
              >
                <Text style={styles.noteText}>{note.idea_title}</Text>
                <Text style={styles.noteDate}>
                  {new Date(note.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={!!editingNote}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingNote(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setEditingNote(null)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit Note</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Note text..."
              placeholderTextColor={colors.textTertiary}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />

            {/* Color picker in modal */}
            <View style={styles.colorPicker}>
              {IDEA_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    editColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setEditColor(color);
                  }}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteNote}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Text style={styles.hint}>Hold a note to edit or delete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addButton: {
    fontSize: 24,
    color: colors.self,
    fontWeight: '300',
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  saveBtn: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.self,
    borderRadius: borderRadius.sm,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#000',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  emptyHint: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  noteCard: {
    width: '48%',
    minHeight: 100,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteCardInner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  noteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    marginTop: spacing.sm,
  },
  hint: {
    fontSize: 10,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  deleteBtn: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: borderRadius.md,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});
