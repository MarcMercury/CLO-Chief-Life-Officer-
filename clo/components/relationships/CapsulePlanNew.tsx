/**
 * CapsulePlan - Unified Planning Component
 * 
 * The Plan section where couples brainstorm ideas together.
 * Items can be voted on (👍/👎) and moved to Resolve or Decisions.
 * 
 * Workflow:
 * - Create ideas for travel, money, shopping, gifts, activities, etc.
 * - Both partners vote on each idea
 * - If both agree (👍), can promote to Decisions
 * - If disagreement or needs discussion, move to Resolve
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  usePlanningItems,
  useCreateItem,
  useVoteOnItem,
  useMoveToResolve,
  useMoveToDecision,
  useIsUserA,
  useItemCounts,
} from '@/hooks/useRelationshipItems';
import { RelationshipItem, RelationshipItemCategory } from '@/types/relationships';

// Category configuration
const CATEGORIES: { value: RelationshipItemCategory; label: string; icon: string }[] = [
  { value: 'date', label: 'Date', icon: '💕' },
  { value: 'trip', label: 'Trip', icon: '✈️' },
  { value: 'money', label: 'Money', icon: '💰' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'gift', label: 'Gift', icon: '🎁' },
  { value: 'activity', label: 'Activity', icon: '🎯' },
  { value: 'home', label: 'Home', icon: '🏠' },
  { value: 'general', label: 'General', icon: '💡' },
];

interface CapsulePlanProps {
  capsuleId: string;
}

export default function CapsulePlan({ capsuleId }: CapsulePlanProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<RelationshipItemCategory>('general');
  
  // Queries
  const { data: items, isLoading } = usePlanningItems(capsuleId);
  const { data: isUserA } = useIsUserA(capsuleId);
  const { data: counts } = useItemCounts(capsuleId);
  
  // Mutations
  const { mutate: createItem, isPending: creating } = useCreateItem();
  const { mutate: vote } = useVoteOnItem();
  const { mutate: moveToResolve } = useMoveToResolve();
  const { mutate: moveToDecision } = useMoveToDecision();

  const handleCreate = useCallback(() => {
    if (!newTitle.trim()) return;
    
    createItem({
      capsule_id: capsuleId,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      category: newCategory,
    }, {
      onSuccess: () => {
        setNewTitle('');
        setNewDescription('');
        setNewCategory('general');
        setShowAddModal(false);
      },
    });
  }, [capsuleId, newTitle, newDescription, newCategory, createItem]);

  const handleVote = useCallback((itemId: string, voteValue: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    vote({
      itemId,
      capsuleId,
      vote: voteValue,
      isUserA: isUserA ?? true,
    });
  }, [capsuleId, isUserA, vote]);

  const handleMoveToResolve = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    moveToResolve({ itemId, capsuleId });
  }, [capsuleId, moveToResolve]);

  const handlePromoteToDecision = useCallback((itemId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    moveToDecision({ itemId, capsuleId });
  }, [capsuleId, moveToDecision]);

  const getVoteStatus = (item: RelationshipItem) => {
    const myVote = isUserA ? item.vote_user_a : item.vote_user_b;
    const theirVote = isUserA ? item.vote_user_b : item.vote_user_a;
    const bothApproved = myVote === true && theirVote === true;
    const hasDisagreement = (myVote === true && theirVote === false) || 
                            (myVote === false && theirVote === true);
    return { myVote, theirVote, bothApproved, hasDisagreement };
  };

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[CATEGORIES.length - 1];
  };

  const renderItem = (item: RelationshipItem, index: number) => {
    const { myVote, theirVote, bothApproved, hasDisagreement } = getVoteStatus(item);
    const categoryInfo = getCategoryInfo(item.category);

    return (
      <Animated.View
        key={item.id}
        entering={FadeInUp.delay(index * 50).duration(300)}
        style={styles.itemCard}
      >
        {/* Header */}
        <View style={styles.itemHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
            <Text style={styles.categoryLabel}>{categoryInfo.label}</Text>
          </View>
          {item.priority === 'high' || item.priority === 'urgent' ? (
            <View style={[styles.priorityBadge, item.priority === 'urgent' && styles.urgentBadge]}>
              <Text style={styles.priorityText}>
                {item.priority === 'urgent' ? '🔥' : '⭐'}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title & Description */}
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}

        {/* Voting Section */}
        <View style={styles.voteSection}>
          <View style={styles.voteButtons}>
            <TouchableOpacity
              style={[
                styles.voteBtn,
                myVote === true && styles.voteBtnYes,
              ]}
              onPress={() => handleVote(item.id, true)}
            >
              <Text style={styles.voteEmoji}>👍</Text>
              {myVote === true && <Text style={styles.voteCheck}>✓</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.voteBtn,
                myVote === false && styles.voteBtnNo,
              ]}
              onPress={() => handleVote(item.id, false)}
            >
              <Text style={styles.voteEmoji}>👎</Text>
              {myVote === false && <Text style={styles.voteCheck}>✓</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.voteStatus}>
            <View style={styles.voteIndicator}>
              <Text style={styles.voteIndicatorLabel}>You</Text>
              <Text style={styles.voteIndicatorValue}>
                {myVote === true ? '✅' : myVote === false ? '❌' : '⏳'}
              </Text>
            </View>
            <View style={styles.voteDivider} />
            <View style={styles.voteIndicator}>
              <Text style={styles.voteIndicatorLabel}>Partner</Text>
              <Text style={styles.voteIndicatorValue}>
                {theirVote === true ? '✅' : theirVote === false ? '❌' : '⏳'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {bothApproved && (
            <TouchableOpacity
              style={styles.promoteBtn}
              onPress={() => handlePromoteToDecision(item.id)}
            >
              <Text style={styles.promoteBtnText}>✓ Move to Decisions</Text>
            </TouchableOpacity>
          )}
          
          {hasDisagreement && (
            <TouchableOpacity
              style={styles.resolveBtn}
              onPress={() => handleMoveToResolve(item.id)}
            >
              <Text style={styles.resolveBtnText}>💬 Discuss in Resolve</Text>
            </TouchableOpacity>
          )}
          
          {!bothApproved && !hasDisagreement && myVote !== null && (
            <TouchableOpacity
              style={styles.resolveBtn}
              onPress={() => handleMoveToResolve(item.id)}
            >
              <Text style={styles.resolveBtnText}>→ Move to Resolve</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>💡 Plan</Text>
          <Text style={styles.subtitle}>Brainstorm together</Text>
        </View>
        {counts && (
          <View style={styles.headerBadges}>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{counts.planning}</Text>
              <Text style={styles.countLabel}>ideas</Text>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          Haptics.selectionAsync();
          setShowAddModal(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add New Idea</Text>
      </TouchableOpacity>

      {/* Items List */}
      <ScrollView 
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
        ) : items && items.length > 0 ? (
          items.map((item, index) => renderItem(item, index))
        ) : (
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌟</Text>
            <Text style={styles.emptyTitle}>No ideas yet</Text>
            <Text style={styles.emptySubtitle}>
              Add travel plans, purchases, date ideas, or anything you want to decide together!
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeInDown.duration(300)}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Idea</Text>
              <TouchableOpacity 
                onPress={() => setShowAddModal(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="What's the idea?"
              placeholderTextColor="#666"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Add details (optional)"
              placeholderTextColor="#666"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={3}
            />

            {/* Category Selector */}
            <Text style={styles.categoryTitle}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    newCategory === cat.value && styles.categoryChipSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setNewCategory(cat.value);
                  }}
                >
                  <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryChipText,
                    newCategory === cat.value && styles.categoryChipTextSelected,
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.submitBtn, creating && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={creating || !newTitle.trim()}
            >
              <Text style={styles.submitBtnText}>
                {creating ? 'Adding...' : 'Add Idea'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B8B9E',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  countText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  countLabel: {
    fontSize: 10,
    color: '#8B8B9E',
    textTransform: 'uppercase',
  },
  addButton: {
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loader: {
    marginTop: 40,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  priorityText: {
    fontSize: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 14,
    color: '#8B8B9E',
    lineHeight: 20,
    marginBottom: 12,
  },
  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  voteBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteBtnYes: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  voteBtnNo: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  voteEmoji: {
    fontSize: 22,
  },
  voteCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#10B981',
    borderRadius: 8,
    width: 16,
    height: 16,
    textAlign: 'center',
    lineHeight: 16,
  },
  voteStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voteIndicator: {
    alignItems: 'center',
  },
  voteIndicatorLabel: {
    fontSize: 10,
    color: '#8B8B9E',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  voteIndicatorValue: {
    fontSize: 18,
  },
  voteDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  promoteBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  promoteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  resolveBtn: {
    flex: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  resolveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8B8B9E',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a24',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#8B8B9E',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B8B9E',
    marginBottom: 10,
    marginTop: 8,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  categoryChipIcon: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#8B8B9E',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#8B5CF6',
  },
  submitBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
