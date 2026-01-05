import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';

interface DecideItem {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  confirmed_by_initiator: boolean;
  confirmed_by_partner: boolean;
  status: 'pending' | 'confirmed' | 'completed' | 'expired';
  promoted_from_plan_id?: string;
  created_at: string;
}

interface DecideModuleProps {
  items: DecideItem[];
  onConfirm: (itemId: string) => void;
  onComplete: (itemId: string) => void;
  onAddItem: (title: string, description: string, deadline?: Date) => void;
  currentUserId: string;
  initiatorId?: string;
  loading?: boolean;
}

export default function DecideModule({
  items,
  onConfirm,
  onComplete,
  onAddItem,
  currentUserId,
  initiatorId,
  loading,
}: DecideModuleProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const pendingItems = items.filter(i => i.status === 'pending');
  const confirmedItems = items.filter(i => i.status === 'confirmed');
  const completedItems = items.filter(i => i.status === 'completed');

  const getConfirmationStatus = (item: DecideItem) => {
    const isInitiator = initiatorId === currentUserId;
    const myConfirm = isInitiator ? item.confirmed_by_initiator : item.confirmed_by_partner;
    const theirConfirm = isInitiator ? item.confirmed_by_partner : item.confirmed_by_initiator;
    return { isInitiator, myConfirm, theirConfirm };
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAddItem(newTitle, newDescription, undefined);
    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
  };

  const renderDecision = ({ item }: { item: DecideItem }) => {
    const { myConfirm, theirConfirm } = getConfirmationStatus(item);
    const isConfirmed = item.status === 'confirmed';
    const isCompleted = item.status === 'completed';

    return (
      <View style={[
        styles.decisionCard,
        isCompleted && styles.decisionCardCompleted,
      ]}>
        <View style={styles.decisionHeader}>
          <Text style={styles.decisionTitle}>{item.title}</Text>
          {item.promoted_from_plan_id && (
            <View style={styles.promotedBadge}>
              <Text style={styles.promotedText}>From Plan</Text>
            </View>
          )}
        </View>

        {item.description && (
          <Text style={styles.decisionDescription}>{item.description}</Text>
        )}

        {item.deadline && (
          <View style={styles.deadlineRow}>
            <Text style={styles.deadlineIcon}>📅</Text>
            <Text style={styles.deadlineText}>
              {new Date(item.deadline).toLocaleDateString()}
            </Text>
          </View>
        )}

        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedIcon}>✓</Text>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : isConfirmed ? (
          <View style={styles.confirmedActions}>
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedIcon}>🤝</Text>
              <Text style={styles.confirmedText}>Both Confirmed</Text>
            </View>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => onComplete(item.id)}
            >
              <Text style={styles.completeBtnText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.confirmationContainer}>
            <View style={styles.confirmationStatus}>
              <View style={[styles.confirmDot, myConfirm && styles.confirmDotActive]}>
                <Text style={styles.confirmDotText}>
                  {myConfirm ? '✓' : '○'}
                </Text>
              </View>
              <Text style={styles.confirmLabel}>You</Text>
            </View>

            <View style={styles.handshakeIcon}>
              <Text>🤝</Text>
            </View>

            <View style={styles.confirmationStatus}>
              <View style={[styles.confirmDot, theirConfirm && styles.confirmDotActive]}>
                <Text style={styles.confirmDotText}>
                  {theirConfirm ? '✓' : '○'}
                </Text>
              </View>
              <Text style={styles.confirmLabel}>Partner</Text>
            </View>

            {!myConfirm && (
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => onConfirm(item.id)}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Decisions</Text>
        <Text style={styles.subtitle}>Mutual agreements</Text>
      </View>

      <View style={styles.tabs}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={styles.tabTextActive}>Pending ({pendingItems.length})</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Confirmed ({confirmedItems.length})</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Done ({completedItems.length})</Text>
        </View>
      </View>

      <FlatList
        data={[...pendingItems, ...confirmedItems]}
        keyExtractor={(item) => item.id}
        renderItem={renderDecision}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No pending decisions</Text>
            <Text style={styles.emptySubtext}>
              Promote ideas from Plan or add directly
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ New Decision</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Decision</Text>
            <Text style={styles.modalSubtitle}>
              Both partners must confirm to finalize
            </Text>

            <TextInput
              style={styles.input}
              placeholder="What are we deciding?"
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
  },
  tabActive: {
    backgroundColor: '#e17055',
  },
  tabText: {
    color: '#888',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  decisionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#f39c12',
  },
  decisionCardCompleted: {
    opacity: 0.6,
    borderLeftColor: '#27ae60',
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  decisionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
    flex: 1,
  },
  promotedBadge: {
    backgroundColor: '#3498db33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promotedText: {
    fontSize: 10,
    color: '#3498db',
    textTransform: 'uppercase',
  },
  decisionDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    lineHeight: 20,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  deadlineIcon: {
    fontSize: 14,
  },
  deadlineText: {
    fontSize: 13,
    color: '#f39c12',
  },
  confirmationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  confirmationStatus: {
    alignItems: 'center',
    gap: 4,
  },
  confirmDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDotActive: {
    backgroundColor: '#27ae60',
  },
  confirmDotText: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  confirmLabel: {
    color: '#666',
    fontSize: 11,
  },
  handshakeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  handshakeEmoji: {
    fontSize: 24,
  },
  confirmBtn: {
    backgroundColor: '#e17055',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 16,
  },
  confirmBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  confirmedActions: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#27ae6033',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confirmedIcon: {
    fontSize: 14,
  },
  confirmedText: {
    color: '#27ae60',
    fontSize: 13,
    fontWeight: '500',
  },
  completeBtn: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  completedIcon: {
    fontSize: 16,
    color: '#27ae60',
  },
  completedText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  emptySubtext: {
    color: '#444',
    fontSize: 13,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#e17055',
    margin: 16,
    marginBottom: 120,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
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
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
