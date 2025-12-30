/**
 * MentalModule Component
 * 
 * 🧠 MENTAL (Growth)
 * - Read List: Book checklist
 * - Learn List: Skills with progress bars
 * - Focus Timer: 25-minute countdown
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
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInRight } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { FocusTimer } from './FocusTimer';
import { 
  useBooks, 
  useCreateBook, 
  useUpdateBookStatus,
  useDeleteBook,
  useSkills,
  useCreateSkill,
  useUpdateSkillProgress,
  useDeleteSkill,
} from '@/hooks/useSelf';

type SubTab = 'read' | 'learn' | 'focus';

const STATUS_ICONS: Record<string, string> = {
  to_read: '📚',
  reading: '📖',
  completed: '✅',
};

export function MentalModule() {
  const [activeTab, setActiveTab] = useState<SubTab>('read');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  
  // Data hooks
  const { data: books = [] } = useBooks();
  const createBook = useCreateBook();
  const updateBookStatus = useUpdateBookStatus();
  const deleteBook = useDeleteBook();
  
  const { data: skills = [] } = useSkills();
  const createSkill = useCreateSkill();
  const updateSkillProgress = useUpdateSkillProgress();
  const deleteSkill = useDeleteSkill();

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

  const handleBookStatusChange = useCallback(async (bookId: string, currentStatus: string) => {
    const statusOrder = ['to_read', 'reading', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length] as 'to_read' | 'reading' | 'completed';
    await updateBookStatus.mutateAsync({ id: bookId, status: nextStatus });
  }, [updateBookStatus]);

  const handleDeleteBook = useCallback((bookId: string, title: string) => {
    Alert.alert('Delete Book', `Remove "${title}" from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBook.mutate(bookId) },
    ]);
  }, [deleteBook]);

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
        { key: 'read', label: 'Read List', icon: '📚' },
        { key: 'learn', label: 'Learn', icon: '🎓' },
        { key: 'focus', label: 'Focus', icon: '🎯' },
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

  const renderReadList = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>
          {books.length} books • {books.filter(b => b.status === 'completed').length} completed
        </Text>
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
        </View>
      ) : (
        books.map((book, index) => (
          <Animated.View 
            key={book.id} 
            entering={FadeInRight.delay(index * 50).duration(200)}
          >
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleBookStatusChange(book.id, book.status)}
              onLongPress={() => handleDeleteBook(book.id, book.title)}
            >
              <Text style={styles.statusIcon}>{STATUS_ICONS[book.status]}</Text>
              <View style={styles.listItemContent}>
                <Text 
                  style={[
                    styles.listItemTitle,
                    book.status === 'completed' && styles.listItemTitleComplete,
                  ]}
                >
                  {book.title}
                </Text>
                {book.author && (
                  <Text style={styles.listItemSub}>by {book.author}</Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))
      )}
    </Animated.View>
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
        </View>
      ) : (
        skills.map((skill, index) => (
          <Animated.View 
            key={skill.id} 
            entering={FadeInRight.delay(index * 50).duration(200)}
          >
            <View style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{skill.skill_name}</Text>
                <TouchableOpacity onPress={() => handleDeleteSkill(skill.id, skill.skill_name)}>
                  <Text style={styles.deleteBtn}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.skillProgress}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={skill.progress}
                  onSlidingComplete={(value) => handleSkillProgressChange(skill.id, value)}
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

  return (
    <View style={styles.container}>
      {renderTabs()}
      
      <View style={styles.content}>
        {activeTab === 'read' && renderReadList()}
        {activeTab === 'learn' && renderLearnList()}
        {activeTab === 'focus' && <FocusTimer />}
      </View>
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statusIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  listItemTitleComplete: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  listItemSub: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  skillItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  skillName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  deleteBtn: {
    fontSize: 14,
    color: colors.textTertiary,
    padding: spacing.xs,
  },
  skillProgress: {
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
});
