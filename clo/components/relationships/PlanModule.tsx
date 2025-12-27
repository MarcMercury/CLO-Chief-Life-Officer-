import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { PlanItem, PlanCategory } from '@/types/relationships';

interface PlanModuleProps {
  items: PlanItem[];
  onCreateItem: (title: string, description?: string, category?: PlanCategory) => void;
  onVote: (itemId: string, vote: boolean) => void;
  onPromote: (itemId: string) => void;
  isUserA: boolean;
  loading?: boolean;
}

const CATEGORIES: { value: PlanCategory; label: string; icon: string }[] = [
  { value: 'date', label: 'Date', icon: '💕' },
  { value: 'trip', label: 'Trip', icon: '✈️' },
  { value: 'purchase', label: 'Purchase', icon: '🛍️' },
  { value: 'activity', label: 'Activity', icon: '🎯' },
  { value: 'general', label: 'General', icon: '💡' },
];

export default function PlanModule({
  items,
  onCreateItem,
  onVote,
  onPromote,
  isUserA,
  loading,
}: PlanModuleProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<PlanCategory>('general');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onCreateItem(newTitle, newDescription || undefined, newCategory);
    setNewTitle('');
    setNewDescription('');
    setNewCategory('general');
    setShowAddModal(false);
  };

  const getVoteStatus = (item: PlanItem) => {
    const myVote = isUserA ? item.vote_a : item.vote_b;
    const theirVote = isUserA ? item.vote_b : item.vote_a;
    return { myVote, theirVote };
  };

  const renderItem = ({ item }: { item: PlanItem }) => {
    const { myVote, theirVote } = getVoteStatus(item);
    const bothApproved = myVote === true && theirVote === true;
    const categoryInfo = CATEGORIES.find((c) => c.value === item.category);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.categoryIcon}>{categoryInfo?.icon || '💡'}</Text>
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>
        
        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}

        <View style={styles.voteRow}>
          <View style={styles.voteButtons}>
            <TouchableOpacity
              style={[styles.voteBtn, myVote === true && styles.voteBtnYes]}
              onPress={() => onVote(item.id, true)}
            >
              <Text style={styles.voteBtnText}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.voteBtn, myVote === false && styles.voteBtnNo]}
              onPress={() => onVote(item.id, false)}
            >
              <Text style={styles.voteBtnText}>👎</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.voteStatus}>
            <Text style={styles.voteLabel}>
              You: {myVote === true ? '✓' : myVote === false ? '✗' : '—'}
            </Text>
            <Text style={styles.voteLabel}>
              Them: {theirVote === true ? '✓' : theirVote === false ? '✗' : '—'}
            </Text>
          </View>

          {bothApproved && (
            <TouchableOpacity
              style={styles.promoteBtn}
              onPress={() => onPromote(item.id)}
            >
              <Text style={styles.promoteBtnText}>Decide →</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 Plan</Text>
        <Text style={styles.subtitle}>Brainstorm together</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No ideas yet. Suggest something!</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add Idea</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Idea</Text>

            <TextInput
              style={styles.input}
              placeholder="What's the idea?"
              placeholderTextColor="#666"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Details (optional)"
              placeholderTextColor="#666"
              multiline
              value={newDescription}
              onChangeText={setNewDescription}
            />

            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryBtn,
                    newCategory === cat.value && styles.categoryBtnActive,
                  ]}
                  onPress={() => setNewCategory(cat.value)}
                >
                  <Text style={styles.categoryBtnText}>{cat.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, !newTitle.trim() && styles.submitBtnDisabled]}
                onPress={handleAdd}
                disabled={!newTitle.trim()}
              >
                <Text style={styles.submitBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  voteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteBtnYes: {
    backgroundColor: '#2d5a27',
  },
  voteBtnNo: {
    backgroundColor: '#5a2727',
  },
  voteBtnText: {
    fontSize: 18,
  },
  voteStatus: {
    flex: 1,
    gap: 2,
  },
  voteLabel: {
    fontSize: 12,
    color: '#666',
  },
  promoteBtn: {
    backgroundColor: '#e17055',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  promoteBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
  },
  addButton: {
    backgroundColor: '#e17055',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#E0E0E0',
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  categoryBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBtnActive: {
    backgroundColor: '#e17055',
  },
  categoryBtnText: {
    fontSize: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 16,
  },
  submitBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e17055',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
