/**
 * MindModule Component
 * 
 * 🧠 MIND (Growth)
 * - Learn: Skills with progress bars
 * - Book List: Books with reading progress slider (similar to Learn)
 */

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInRight } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { 
  useBooks, 
  useCreateBook, 
  useUpdateBookStatus,
  useUpdateBook,
  useDeleteBook,
  useSkills,
  useCreateSkill,
  useUpdateSkillProgress,
  useDeleteSkill,
} from '@/hooks/useSelf';

type SubTab = 'learn' | 'books';

interface Book {
  id: string;
  title: string;
  author?: string;
  status: 'to_read' | 'reading' | 'completed';
  progress?: number;
}

export function MindModule() {
  const [activeTab, setActiveTab] = useState<SubTab>('learn');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  
  // Edit book modal state
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  
  // Data hooks
  const { data: books = [] } = useBooks();
  const createBook = useCreateBook();
  const updateBookStatus = useUpdateBookStatus();
  const updateBook = useUpdateBook();
  const deleteBook = useDeleteBook();
  
  const { data: skills = [] } = useSkills();
  const createSkill = useCreateSkill();
  const updateSkillProgress = useUpdateSkillProgress();
  const deleteSkill = useDeleteSkill();

  // Book counts for summary
  const inProgressCount = books.filter(b => b.status === 'reading').length;
  const completedCount = books.filter(b => b.status === 'completed').length;

  const handleAddBook = useCallback(async () => {
    if (!newBookTitle.trim()) return;
    await createBook.mutateAsync({ 
      title: newBookTitle.trim(), 
      author: newBookAuthor.trim() || undefined 
    });
    setNewBookTitle('');
    setNewBookAuthor('');
    setShowAddBook(false);
  }, [newBookTitle, newBookAuthor, createBook]);

  const handleBookProgressChange = useCallback(async (bookId: string, progress: number) => {
    const roundedProgress = Math.round(progress);
    // Update status based on progress
    let status: 'to_read' | 'reading' | 'completed' = 'reading';
    if (roundedProgress === 0) {
      status = 'to_read';
    } else if (roundedProgress === 100) {
      status = 'completed';
    }
    
    await updateBook.mutateAsync({ 
      id: bookId, 
      updates: { 
        progress: roundedProgress,
        status 
      } 
    });
  }, [updateBook]);

  const handleEditBook = useCallback((book: Book) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingBook(book);
    setEditTitle(book.title);
    setEditAuthor(book.author || '');
  }, []);

  const handleSaveBook = useCallback(async () => {
    if (!editingBook || !editTitle.trim()) return;
    await updateBook.mutateAsync({ 
      id: editingBook.id, 
      updates: { 
        title: editTitle.trim(), 
        author: editAuthor.trim() || undefined 
      } 
    });
    setEditingBook(null);
  }, [editingBook, editTitle, editAuthor, updateBook]);

  const handleDeleteBook = useCallback(() => {
    if (!editingBook) return;
    Alert.alert('Delete Book', `Remove "${editingBook.title}" from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          deleteBook.mutate(editingBook.id);
          setEditingBook(null);
        }
      },
    ]);
  }, [editingBook, deleteBook]);

  const handleAddSkill = useCallback(async () => {
    if (!newSkillName.trim()) return;
    await createSkill.mutateAsync({ skillName: newSkillName.trim() });
    setNewSkillName('');
    setShowAddSkill(false);
  }, [newSkillName, createSkill]);

  const handleSkillProgressChange = useCallback(async (skillId: string, progress: number) => {
    await updateSkillProgress.mutateAsync({ id: skillId, progress: Math.round(progress) });
  }, [updateSkillProgress]);

  const handleDeleteSkill = useCallback((skillId: string, name: string) => {
    Alert.alert('Delete Skill', `Remove "${name}" from tracking?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSkill.mutate(skillId) },
    ]);
  }, [deleteSkill]);

  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabScroll}
    >
      {[
        { key: 'learn', label: 'Learn', icon: '🎓' },
        { key: 'books', label: 'Book List', icon: '📚' },
      ].map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab(tab.key as SubTab);
          }}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderLearnList = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{skills.length} skills tracking</Text>
        <TouchableOpacity onPress={() => setShowAddSkill(!showAddSkill)}>
          <Text style={styles.addButton}>{showAddSkill ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {showAddSkill && (
        <Animated.View entering={FadeInUp.duration(200)} style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Skill name (e.g., Python, Spanish)..."
            placeholderTextColor={colors.textTertiary}
            value={newSkillName}
            onChangeText={setNewSkillName}
            onSubmitEditing={handleAddSkill}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleAddSkill}>
            <Text style={styles.submitBtnText}>Add Skill</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {skills.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎓</Text>
          <Text style={styles.emptyText}>No skills yet</Text>
          <Text style={styles.emptyHint}>Track your learning progress</Text>
        </View>
      ) : (
        skills.map((skill, index) => (
          <Animated.View 
            key={skill.id} 
            entering={FadeInRight.delay(index * 50).duration(200)}
          >
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressName}>{skill.skill_name}</Text>
                <TouchableOpacity onPress={() => handleDeleteSkill(skill.id, skill.skill_name)}>
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressSlider}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={skill.progress}
                  onSlidingComplete={(value: number) => handleSkillProgressChange(skill.id, value)}
                  minimumTrackTintColor={colors.self}
                  maximumTrackTintColor={colors.surface}
                  thumbTintColor={colors.self}
                />
                <Text style={styles.progressText}>{skill.progress}%</Text>
              </View>
            </View>
          </Animated.View>
        ))
      )}
    </Animated.View>
  );

  const renderBookList = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionLabel}>
            📖 {inProgressCount} reading • ✅ {completedCount} done
          </Text>
          <Text style={styles.sectionHint}>Slide to track progress • Hold to edit</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAddBook(!showAddBook)}>
          <Text style={styles.addButton}>{showAddBook ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {showAddBook && (
        <Animated.View entering={FadeInUp.duration(200)} style={styles.addForm}>
          <TextInput
            style={styles.input}
            placeholder="Book title..."
            placeholderTextColor={colors.textTertiary}
            value={newBookTitle}
            onChangeText={setNewBookTitle}
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="Author (optional)"
            placeholderTextColor={colors.textTertiary}
            value={newBookAuthor}
            onChangeText={setNewBookAuthor}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleAddBook}>
            <Text style={styles.submitBtnText}>Add Book</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {books.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={styles.emptyText}>No books yet</Text>
          <Text style={styles.emptyHint}>Track your reading progress</Text>
        </View>
      ) : (
        books.map((book, index) => (
          <Animated.View 
            key={book.id} 
            entering={FadeInRight.delay(index * 50).duration(200)}
          >
            <TouchableOpacity
              style={styles.progressItem}
              onLongPress={() => handleEditBook(book as Book)}
              activeOpacity={0.8}
            >
              <View style={styles.progressHeader}>
                <View style={styles.bookInfo}>
                  <Text 
                    style={[
                      styles.progressName,
                      (book.progress === 100 || book.status === 'completed') && styles.progressNameComplete,
                    ]}
                  >
                    {book.title}
                  </Text>
                  {book.author && (
                    <Text style={styles.bookAuthor}>by {book.author}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleEditBook(book as Book)}>
                  <Text style={styles.editBtn}>✎</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressSlider}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={book.progress || 0}
                  onSlidingComplete={(value: number) => handleBookProgressChange(book.id, value)}
                  minimumTrackTintColor={book.progress === 100 ? '#10B981' : colors.self}
                  maximumTrackTintColor={colors.surface}
                  thumbTintColor={book.progress === 100 ? '#10B981' : colors.self}
                />
                <Text style={[
                  styles.progressText,
                  book.progress === 100 && styles.progressTextComplete
                ]}>
                  {book.progress || 0}%
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))
      )}
    </Animated.View>
  );

  const renderEditBookModal = () => (
    <Modal
      visible={!!editingBook}
      transparent
      animationType="fade"
      onRequestClose={() => setEditingBook(null)}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={() => setEditingBook(null)}
      >
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Edit Book</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Book title..."
            placeholderTextColor={colors.textTertiary}
            value={editTitle}
            onChangeText={setEditTitle}
            autoFocus
          />
          
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="Author (optional)"
            placeholderTextColor={colors.textTertiary}
            value={editAuthor}
            onChangeText={setEditAuthor}
          />
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteBook}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveBook}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderTabs()}
      
      <View style={styles.content}>
        {activeTab === 'learn' && renderLearnList()}
        {activeTab === 'books' && renderBookList()}
      </View>
      
      {renderEditBookModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  tabScroll: {
    marginBottom: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: `${colors.self}30`,
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.self,
    fontWeight: '600',
  },
  content: {
    minHeight: 150,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionHint: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 2,
  },
  addButton: {
    fontSize: 20,
    color: colors.self,
    fontWeight: '300',
  },
  addForm: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: 14,
    color: colors.textPrimary,
  },
  inputSmall: {
    marginBottom: spacing.md,
  },
  submitBtn: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#000',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textTertiary,
    fontSize: 14,
  },
  emptyHint: {
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  progressItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  bookInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  progressName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  progressNameComplete: {
    color: '#10B981',
  },
  bookAuthor: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  deleteBtn: {
    fontSize: 14,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
  editBtn: {
    fontSize: 16,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
  progressSlider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 30,
  },
  progressText: {
    fontSize: 12,
    color: colors.self,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  progressTextComplete: {
    color: '#10B981',
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  deleteButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.self,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontWeight: '600',
  },
});
