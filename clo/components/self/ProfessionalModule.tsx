/**
 * ProfessionalModule Component
 * 
 * 💼 PROFESSIONAL (Career & Growth)
 * - Career Goals: Checklist for career milestones
 * - Networking: 5 daily contact slots (resets every 24h)
 * - Idea Vault: Sticky-note grid for capturing ideas
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
  Linking,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '@/constants/theme';
import {
  useCareerGoals,
  useCreateCareerGoal,
  useToggleCareerGoal,
  useDeleteCareerGoal,
  useTodaysNetworking,
  useAddNetworkingContact,
  useMarkContacted,
  useDeleteNetworkingContact,
  useIdeas,
  useCreateIdea,
  useUpdateIdea,
  useDeleteIdea,
} from '@/hooks/useSelf';

type SubTab = 'career' | 'network' | 'ideas';

const IDEA_COLORS = [
  '#FBBF24', // Yellow
  '#34D399', // Green  
  '#60A5FA', // Blue
  '#F472B6', // Pink
  '#A78BFA', // Purple
  '#FB923C', // Orange
];

const MAX_DAILY_OUTREACH = 5;

export function ProfessionalModule() {
  const [activeTab, setActiveTab] = useState<SubTab>('career');
  const [newGoal, setNewGoal] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newIdea, setNewIdea] = useState('');
  const [showIdeaInput, setShowIdeaInput] = useState(false);
  const [selectedColor, setSelectedColor] = useState(IDEA_COLORS[0]);
  
  // Career Goals hooks
  const { data: careerGoals = [] } = useCareerGoals();
  const createGoal = useCreateCareerGoal();
  const toggleGoal = useToggleCareerGoal();
  const deleteGoal = useDeleteCareerGoal();
  
  // Networking hooks
  const { data: todaysContacts = [] } = useTodaysNetworking();
  const addContact = useAddNetworkingContact();
  const markContacted = useMarkContacted();
  const deleteContact = useDeleteNetworkingContact();
  
  // Idea Vault hooks
  const { data: ideas = [] } = useIdeas();
  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();

  const contactCount = todaysContacts.length;
  const remainingSlots = MAX_DAILY_OUTREACH - contactCount;

  const handleAddGoal = useCallback(async () => {
    if (!newGoal.trim()) return;
    
    await createGoal.mutateAsync({
      goalText: newGoal.trim(),
    });
    
    setNewGoal('');
  }, [newGoal, createGoal]);

  const handleToggleGoal = useCallback((goal: any) => {
    toggleGoal.mutate({
      id: goal.id,
      completed: !goal.is_completed,
    });
  }, [toggleGoal]);

  const handleDeleteGoal = useCallback((goal: any) => {
    Alert.alert('Delete Goal', `Remove "${goal.goal_text}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteGoal.mutate(goal.id) },
    ]);
  }, [deleteGoal]);

  const handleAddContact = useCallback(async () => {
    if (!newContactName.trim()) return;
    if (contactCount >= MAX_DAILY_OUTREACH) {
      Alert.alert('Daily Limit', "You've reached your 5 daily contact goal!");
      return;
    }
    
    await addContact.mutateAsync({
      contactName: newContactName.trim(),
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNewContactName('');
  }, [newContactName, contactCount, addContact]);

  const handleToggleContacted = useCallback((contact: any) => {
    markContacted.mutate({
      id: contact.id,
      contacted: !contact.contacted,
    });
  }, [markContacted]);

  const handleDeleteContact = useCallback((contact: any) => {
    Alert.alert('Remove Contact', `Remove "${contact.contact_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteContact.mutate(contact.id) },
    ]);
  }, [deleteContact]);

  const handleAddIdea = useCallback(async () => {
    if (!newIdea.trim()) return;
    
    await createIdea.mutateAsync({
      ideaTitle: newIdea.trim(),
      color: selectedColor,
    });
    
    setNewIdea('');
    setSelectedColor(IDEA_COLORS[0]);
    setShowIdeaInput(false);
  }, [newIdea, selectedColor, createIdea]);

  const handleDeleteIdea = useCallback((idea: any) => {
    Alert.alert('Delete Idea', 'Remove this idea?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteIdea.mutate(idea.id) },
    ]);
  }, [deleteIdea]);

  const renderTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabScroll}
    >
      {[
        { key: 'career', label: 'Goals', icon: '🎯' },
        { key: 'network', label: 'Network', icon: '🤝' },
        { key: 'ideas', label: 'Ideas', icon: '💡' },
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

  const renderCareerGoals = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Quick add */}
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add a career goal..."
          placeholderTextColor={colors.textTertiary}
          value={newGoal}
          onChangeText={setNewGoal}
          onSubmitEditing={handleAddGoal}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={[styles.addBtn, !newGoal.trim() && styles.addBtnDisabled]}
          onPress={handleAddGoal}
          disabled={!newGoal.trim()}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Goals list */}
      {careerGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>No career goals yet</Text>
          <Text style={styles.emptyHint}>Add goals to track your professional growth</Text>
        </View>
      ) : (
        careerGoals.map((goal, index) => (
          <Animated.View 
            key={goal.id}
            entering={FadeInRight.delay(index * 30).duration(200)}
          >
            <TouchableOpacity
              style={styles.goalItem}
              onPress={() => handleToggleGoal(goal)}
              onLongPress={() => handleDeleteGoal(goal)}
            >
              <View style={[
                styles.checkbox,
                goal.is_completed && styles.checkboxDone
              ]}>
                {goal.is_completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.goalContent}>
                <Text style={[
                  styles.goalText,
                  goal.is_completed && styles.goalTextDone
                ]}>
                  {goal.goal_text}
                </Text>
                {goal.target_date && (
                  <Text style={styles.goalDate}>
                    Target: {new Date(goal.target_date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))
      )}
    </Animated.View>
  );

  const renderNetworking = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Progress */}
      <View style={styles.networkHeader}>
        <Text style={styles.networkTitle}>Daily Outreach</Text>
        <Text style={styles.networkProgress}>
          {contactCount} / {MAX_DAILY_OUTREACH}
        </Text>
      </View>

      {/* Add contact input */}
      {remainingSlots > 0 && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Who to reach out to..."
            placeholderTextColor={colors.textTertiary}
            value={newContactName}
            onChangeText={setNewContactName}
            onSubmitEditing={handleAddContact}
            returnKeyType="done"
          />
          <TouchableOpacity 
            style={[styles.addBtn, !newContactName.trim() && styles.addBtnDisabled]}
            onPress={handleAddContact}
            disabled={!newContactName.trim()}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Today's contacts */}
      {todaysContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyText}>No outreach yet today</Text>
          <Text style={styles.emptyHint}>Add people you want to connect with</Text>
        </View>
      ) : (
        <>
          {todaysContacts.map((contact, index) => (
            <Animated.View 
              key={contact.id}
              entering={FadeInRight.delay(index * 30).duration(200)}
            >
              <TouchableOpacity
                style={styles.contactItem}
                onPress={() => handleToggleContacted(contact)}
                onLongPress={() => handleDeleteContact(contact)}
              >
                <View style={[
                  styles.contactCheckbox,
                  contact.contacted && styles.contactCheckboxDone
                ]}>
                  {contact.contacted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.contactInfo}>
                  <Text style={[
                    styles.contactName,
                    contact.contacted && styles.contactNameDone
                  ]}>
                    {contact.contact_name}
                  </Text>
                  {contact.contact_info && (
                    <Text style={styles.contactDetail}>{contact.contact_info}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </>
      )}

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <Text style={styles.quickActionsLabel}>Quick reach out:</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => Linking.openURL('mailto:')}
          >
            <Text>📧</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => Linking.openURL('sms:')}
          >
            <Text>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionBtn}
            onPress={() => Linking.openURL('https://linkedin.com')}
          >
            <Text>💼</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderIdeas = () => (
    <Animated.View entering={FadeIn.duration(200)}>
      {/* Add idea button / form */}
      {!showIdeaInput ? (
        <TouchableOpacity
          style={styles.addIdeaBtn}
          onPress={() => setShowIdeaInput(true)}
        >
          <Text style={styles.addIdeaBtnText}>+ Add Idea</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.ideaForm}>
          <TextInput
            style={styles.ideaInput}
            placeholder="What's your idea?"
            placeholderTextColor={colors.textTertiary}
            value={newIdea}
            onChangeText={setNewIdea}
            multiline
            autoFocus
          />
          
          {/* Color picker */}
          <View style={styles.colorPicker}>
            {IDEA_COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorOptionSelected
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
          
          <View style={styles.ideaFormActions}>
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => {
                setShowIdeaInput(false);
                setNewIdea('');
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveIdeaBtn, !newIdea.trim() && styles.saveIdeaBtnDisabled]}
              onPress={handleAddIdea}
              disabled={!newIdea.trim()}
            >
              <Text style={styles.saveIdeaBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Ideas grid (sticky notes) */}
      {ideas.length === 0 && !showIdeaInput ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💡</Text>
          <Text style={styles.emptyText}>No ideas yet</Text>
          <Text style={styles.emptyHint}>Capture your brilliant thoughts!</Text>
        </View>
      ) : (
        <View style={styles.ideaGrid}>
          {ideas.map((idea, index) => (
            <Animated.View 
              key={idea.id}
              entering={FadeInUp.delay(index * 30).duration(200)}
              style={[
                styles.ideaCard,
                { backgroundColor: idea.color || IDEA_COLORS[0] }
              ]}
            >
              <TouchableOpacity
                onLongPress={() => handleDeleteIdea(idea)}
                style={styles.ideaCardInner}
              >
                <Text style={styles.ideaText}>{idea.idea_title}</Text>
                {idea.idea_content && (
                  <Text style={styles.ideaContent} numberOfLines={3}>
                    {idea.idea_content}
                  </Text>
                )}
                <Text style={styles.ideaDate}>
                  {new Date(idea.created_at).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderTabs()}
      
      <View style={styles.content}>
        {activeTab === 'career' && renderCareerGoals()}
        {activeTab === 'network' && renderNetworking()}
        {activeTab === 'ideas' && renderIdeas()}
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
  addRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.md,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#000',
    fontSize: 20,
    fontWeight: '300',
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
    marginTop: 4,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.self,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.self,
  },
  checkmark: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  goalContent: {
    flex: 1,
  },
  goalText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  goalTextDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  goalDate: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
  },
  // Networking styles
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  networkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  networkProgress: {
    fontSize: 14,
    color: colors.self,
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  contactCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.self,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCheckboxDone: {
    backgroundColor: colors.self,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  contactNameDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  contactDetail: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  quickActions: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  quickActionsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Ideas styles
  addIdeaBtn: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addIdeaBtnText: {
    color: colors.self,
    fontWeight: '600',
  },
  ideaForm: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  ideaInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    minHeight: 80,
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
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  ideaFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelBtnText: {
    color: colors.textSecondary,
  },
  saveIdeaBtn: {
    backgroundColor: colors.self,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  saveIdeaBtnDisabled: {
    opacity: 0.5,
  },
  saveIdeaBtnText: {
    color: '#000',
    fontWeight: '600',
  },
  ideaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ideaCard: {
    width: '48%',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    // Slight rotation for sticky note effect
    transform: [{ rotate: '-1deg' }],
  },
  ideaCardInner: {
    flex: 1,
  },
  ideaText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  ideaContent: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.7)',
    marginTop: 4,
  },
  ideaDate: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
    marginTop: spacing.sm,
  },
});
