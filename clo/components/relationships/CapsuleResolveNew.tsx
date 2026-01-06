/**
 * CapsuleResolve - Conflict Resolution & Discussion Component
 * 
 * The Resolve section where couples work through disagreements or
 * complex decisions that need more discussion before deciding.
 * 
 * Uses structured format:
 * - I feel...
 * - I need...
 * - I am willing to...
 * - My proposed compromise...
 * 
 * Once both partners submit perspectives, they can review and
 * move the item to Decisions with resolution notes.
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
  useResolveItems,
  useSubmitPerspective,
  useMoveToDecision,
  useIsUserA,
  useItemCounts,
  useArchiveItem,
} from '@/hooks/useRelationshipItems';
import { RelationshipItem } from '@/types/relationships';

interface CapsuleResolveProps {
  capsuleId: string;
}

export default function CapsuleResolve({ capsuleId }: CapsuleResolveProps) {
  const [selectedItem, setSelectedItem] = useState<RelationshipItem | null>(null);
  const [showPerspectiveForm, setShowPerspectiveForm] = useState(false);
  
  // Form state
  const [feeling, setFeeling] = useState('');
  const [need, setNeed] = useState('');
  const [willing, setWilling] = useState('');
  const [compromise, setCompromise] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  
  // Queries
  const { data: items, isLoading } = useResolveItems(capsuleId);
  const { data: isUserA } = useIsUserA(capsuleId);
  const { data: counts } = useItemCounts(capsuleId);
  
  // Mutations
  const { mutate: submitPerspective, isPending: submitting } = useSubmitPerspective();
  const { mutate: moveToDecision, isPending: moving } = useMoveToDecision();
  const { mutate: archiveItem } = useArchiveItem();

  const getMyPerspective = (item: RelationshipItem) => {
    return isUserA
      ? {
          feeling: item.feeling_a,
          need: item.need_a,
          willing: item.willing_a,
          compromise: item.compromise_a,
        }
      : {
          feeling: item.feeling_b,
          need: item.need_b,
          willing: item.willing_b,
          compromise: item.compromise_b,
        };
  };

  const getTheirPerspective = (item: RelationshipItem) => {
    return isUserA
      ? {
          feeling: item.feeling_b,
          need: item.need_b,
          willing: item.willing_b,
          compromise: item.compromise_b,
        }
      : {
          feeling: item.feeling_a,
          need: item.need_a,
          willing: item.willing_a,
          compromise: item.compromise_a,
        };
  };

  const hasMyPerspective = (item: RelationshipItem) => {
    const mine = getMyPerspective(item);
    return !!(mine.feeling && mine.need && mine.willing && mine.compromise);
  };

  const hasTheirPerspective = (item: RelationshipItem) => {
    const theirs = getTheirPerspective(item);
    return !!(theirs.feeling && theirs.need && theirs.willing && theirs.compromise);
  };

  const handleOpenPerspectiveForm = useCallback((item: RelationshipItem) => {
    const mine = getMyPerspective(item);
    setSelectedItem(item);
    setFeeling(mine.feeling || '');
    setNeed(mine.need || '');
    setWilling(mine.willing || '');
    setCompromise(mine.compromise || '');
    setShowPerspectiveForm(true);
  }, [isUserA]);

  const handleSubmitPerspective = useCallback(() => {
    if (!selectedItem || !feeling || !need || !willing || !compromise) return;
    
    submitPerspective({
      itemId: selectedItem.id,
      capsuleId,
      isUserA: isUserA ?? true,
      feeling,
      need,
      willing,
      compromise,
    }, {
      onSuccess: () => {
        setShowPerspectiveForm(false);
        setFeeling('');
        setNeed('');
        setWilling('');
        setCompromise('');
        setSelectedItem(null);
      },
    });
  }, [selectedItem, capsuleId, isUserA, feeling, need, willing, compromise, submitPerspective]);

  const handleMoveToDecision = useCallback((item: RelationshipItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    moveToDecision({
      itemId: item.id,
      capsuleId,
      resolutionNotes: resolutionNotes || undefined,
    });
  }, [capsuleId, resolutionNotes, moveToDecision]);

  const handleArchive = useCallback((itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    archiveItem({ itemId, capsuleId });
  }, [capsuleId, archiveItem]);

  const renderPerspectiveCard = (
    label: string, 
    perspective: { feeling: string | null; need: string | null; willing: string | null; compromise: string | null },
    isComplete: boolean
  ) => {
    if (!isComplete) {
      return (
        <View style={styles.perspectiveCard}>
          <Text style={styles.perspectiveLabel}>{label}</Text>
          <View style={styles.perspectiveEmpty}>
            <Text style={styles.perspectiveEmptyText}>⏳ Waiting for response...</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.perspectiveCard}>
        <Text style={styles.perspectiveLabel}>{label}</Text>
        <View style={styles.perspectiveContent}>
          <View style={styles.perspectiveRow}>
            <Text style={styles.perspectiveField}>I feel:</Text>
            <Text style={styles.perspectiveValue}>{perspective.feeling}</Text>
          </View>
          <View style={styles.perspectiveRow}>
            <Text style={styles.perspectiveField}>I need:</Text>
            <Text style={styles.perspectiveValue}>{perspective.need}</Text>
          </View>
          <View style={styles.perspectiveRow}>
            <Text style={styles.perspectiveField}>I'm willing to:</Text>
            <Text style={styles.perspectiveValue}>{perspective.willing}</Text>
          </View>
          <View style={styles.perspectiveRow}>
            <Text style={styles.perspectiveField}>My compromise:</Text>
            <Text style={styles.perspectiveValue}>{perspective.compromise}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderItem = (item: RelationshipItem, index: number) => {
    const myPerspective = getMyPerspective(item);
    const theirPerspective = getTheirPerspective(item);
    const iHaveSubmitted = hasMyPerspective(item);
    const theyHaveSubmitted = hasTheirPerspective(item);
    const bothSubmitted = iHaveSubmitted && theyHaveSubmitted;

    return (
      <Animated.View
        key={item.id}
        entering={FadeInUp.delay(index * 50).duration(300)}
        style={styles.itemCard}
      >
        {/* Header */}
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={styles.statusBadges}>
            <View style={[styles.statusBadge, iHaveSubmitted && styles.statusBadgeComplete]}>
              <Text style={styles.statusBadgeText}>
                {iHaveSubmitted ? '✓ You' : '○ You'}
              </Text>
            </View>
            <View style={[styles.statusBadge, theyHaveSubmitted && styles.statusBadgeComplete]}>
              <Text style={styles.statusBadgeText}>
                {theyHaveSubmitted ? '✓ Partner' : '○ Partner'}
              </Text>
            </View>
          </View>
        </View>

        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}

        {/* Progress indicator */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: bothSubmitted ? '100%' : iHaveSubmitted || theyHaveSubmitted ? '50%' : '0%' }]} />
        </View>
        <Text style={styles.progressText}>
          {bothSubmitted 
            ? '✨ Both perspectives shared - ready to decide!'
            : iHaveSubmitted 
              ? 'Waiting for partner\'s perspective...'
              : 'Share your perspective'}
        </Text>

        {/* Perspectives */}
        {(iHaveSubmitted || theyHaveSubmitted) && (
          <View style={styles.perspectives}>
            {renderPerspectiveCard('Your Perspective', myPerspective, iHaveSubmitted)}
            {renderPerspectiveCard('Partner\'s Perspective', theirPerspective, theyHaveSubmitted)}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          {!iHaveSubmitted && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                Haptics.selectionAsync();
                handleOpenPerspectiveForm(item);
              }}
            >
              <Text style={styles.primaryBtnText}>✍️ Share My Perspective</Text>
            </TouchableOpacity>
          )}

          {iHaveSubmitted && !bothSubmitted && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                Haptics.selectionAsync();
                handleOpenPerspectiveForm(item);
              }}
            >
              <Text style={styles.editBtnText}>Edit My Response</Text>
            </TouchableOpacity>
          )}

          {bothSubmitted && (
            <TouchableOpacity
              style={styles.decisionBtn}
              onPress={() => handleMoveToDecision(item)}
            >
              <Text style={styles.decisionBtnText}>✓ Move to Decisions</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.archiveBtn}
            onPress={() => handleArchive(item.id)}
          >
            <Text style={styles.archiveBtnText}>Archive</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>🤝 Resolve</Text>
          <Text style={styles.subtitle}>Work through it together</Text>
        </View>
        {counts && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{counts.resolving}</Text>
            <Text style={styles.countLabel}>items</Text>
          </View>
        )}
      </Animated.View>

      {/* Explanation Card */}
      <View style={styles.explainCard}>
        <Text style={styles.explainTitle}>How it works</Text>
        <Text style={styles.explainText}>
          Share your perspective using the structured format. Once both of you have shared, 
          you can review each other's thoughts and move forward to a decision.
        </Text>
      </View>

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
            <Text style={styles.emptyIcon}>🕊️</Text>
            <Text style={styles.emptyTitle}>All resolved!</Text>
            <Text style={styles.emptySubtitle}>
              Nothing to work through right now. Items moved here from Plan 
              will appear when they need discussion.
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Perspective Form Modal */}
      <Modal visible={showPerspectiveForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeInDown.duration(300)}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Share Your Perspective</Text>
                {selectedItem && (
                  <Text style={styles.modalSubtitle}>{selectedItem.title}</Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setShowPerspectiveForm(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>I feel...</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Express how you're feeling about this"
                  placeholderTextColor="#666"
                  value={feeling}
                  onChangeText={setFeeling}
                  multiline
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>I need...</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="What do you need to feel good about this?"
                  placeholderTextColor="#666"
                  value={need}
                  onChangeText={setNeed}
                  multiline
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>I am willing to...</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="What are you willing to do or give up?"
                  placeholderTextColor="#666"
                  value={willing}
                  onChangeText={setWilling}
                  multiline
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>My proposed compromise...</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Suggest a middle ground"
                  placeholderTextColor="#666"
                  value={compromise}
                  onChangeText={setCompromise}
                  multiline
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowPerspectiveForm(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitBtn, 
                    (submitting || !feeling || !need || !willing || !compromise) && styles.submitBtnDisabled
                  ]}
                  onPress={handleSubmitPerspective}
                  disabled={submitting || !feeling || !need || !willing || !compromise}
                >
                  <Text style={styles.submitBtnText}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  explainCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  explainTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 6,
  },
  explainText: {
    fontSize: 13,
    color: '#8B8B9E',
    lineHeight: 18,
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemHeader: {
    marginBottom: 10,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#8B8B9E',
    lineHeight: 20,
    marginBottom: 12,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 10,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeComplete: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#8B8B9E',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8B8B9E',
    marginTop: 8,
    textAlign: 'center',
  },
  perspectives: {
    marginTop: 16,
    gap: 12,
  },
  perspectiveCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  perspectiveLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  perspectiveEmpty: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  perspectiveEmptyText: {
    fontSize: 14,
    color: '#8B8B9E',
  },
  perspectiveContent: {
    gap: 8,
  },
  perspectiveRow: {
    marginBottom: 4,
  },
  perspectiveField: {
    fontSize: 11,
    color: '#8B8B9E',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  perspectiveValue: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  primaryBtn: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  editBtn: {
    flex: 1,
    minWidth: 120,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  decisionBtn: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  decisionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  archiveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  archiveBtnText: {
    fontSize: 14,
    color: '#8B8B9E',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8B8B9E',
    marginTop: 4,
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
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#fff',
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B8B9E',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
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
