import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from 'react-native';

interface VaultItem {
  id: string;
  title: string;
  content_type: string;
  encrypted_content: string;
  uploaded_by: string;
  approved_by_uploader: boolean;
  approved_by_partner: boolean;
  status: 'pending' | 'visible' | 'rejected';
  created_at: string;
}

interface VaultModuleProps {
  items: VaultItem[];
  onUpload: (title: string, content: string, contentType: string) => void;
  onApprove: (itemId: string) => void;
  currentUserId: string;
  isUnlocked: boolean;
  onUnlock: (pin: string) => boolean;
  loading?: boolean;
}

export default function VaultModule({
  items,
  onUpload,
  onApprove,
  currentUserId,
  isUnlocked,
  onUnlock,
  loading,
}: VaultModuleProps) {
  const [showPinModal, setShowPinModal] = useState(!isUnlocked);
  const [pin, setPin] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      Alert.alert('Enter 4-digit PIN');
      return;
    }
    const success = onUnlock(pin);
    if (success) {
      setShowPinModal(false);
    } else {
      Alert.alert('Incorrect PIN');
      setPin('');
    }
  };

  const handleUpload = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    onUpload(newTitle, newContent, 'NOTE');
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  const getItemStatus = (item: VaultItem) => {
    const isUploader = item.uploaded_by === currentUserId;
    const myApproval = isUploader ? item.approved_by_uploader : item.approved_by_partner;
    const theirApproval = isUploader ? item.approved_by_partner : item.approved_by_uploader;

    return { isUploader, myApproval, theirApproval };
  };

  const renderItem = ({ item }: { item: VaultItem }) => {
    const { isUploader, myApproval, theirApproval } = getItemStatus(item);
    const isVisible = item.status === 'visible';

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, isVisible ? styles.statusVisible : styles.statusPending]}>
            <Text style={styles.statusText}>
              {isVisible ? 'Shared' : 'Pending'}
            </Text>
          </View>
        </View>

        {isVisible ? (
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>{item.encrypted_content}</Text>
          </View>
        ) : (
          <View style={styles.pendingBox}>
            <Text style={styles.pendingText}>🔒 Requires mutual approval</Text>
            <View style={styles.approvalStatus}>
              <Text style={[styles.approvalItem, myApproval && styles.approvalDone]}>
                You: {myApproval ? '✓' : '○'}
              </Text>
              <Text style={[styles.approvalItem, theirApproval && styles.approvalDone]}>
                Them: {theirApproval ? '✓' : '○'}
              </Text>
            </View>
            {!myApproval && (
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => onApprove(item.id)}
              >
                <Text style={styles.approveBtnText}>
                  {isUploader ? 'Confirm Share' : 'Approve'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // PIN Entry Modal
  if (showPinModal) {
    return (
      <View style={styles.container}>
        <View style={styles.pinContainer}>
          <Text style={styles.lockIcon}>🔐</Text>
          <Text style={styles.pinTitle}>The Vault</Text>
          <Text style={styles.pinSubtitle}>Enter your shared PIN</Text>

          <View style={styles.pinInputContainer}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.pinDot}>
                <Text style={styles.pinDotText}>
                  {pin[i] ? '●' : '○'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.numpad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.numpadBtn, num === null && styles.numpadBtnEmpty]}
                onPress={() => {
                  if (num === 'del') {
                    setPin(pin.slice(0, -1));
                  } else if (num !== null && pin.length < 4) {
                    const newPin = pin + num;
                    setPin(newPin);
                    if (newPin.length === 4) {
                      setTimeout(() => {
                        const success = onUnlock(newPin);
                        if (success) {
                          setShowPinModal(false);
                        } else {
                          Alert.alert('Incorrect PIN');
                          setPin('');
                        }
                      }, 200);
                    }
                  }
                }}
                disabled={num === null}
              >
                <Text style={styles.numpadText}>
                  {num === 'del' ? '⌫' : num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔐 The Vault</Text>
        <Text style={styles.subtitle}>Double-key protected</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nothing in the vault yet</Text>
            <Text style={styles.emptySubtext}>
              Items require both partners to approve
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ Add to Vault</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Vault</Text>
            <Text style={styles.modalSubtitle}>
              Your partner must approve before content is visible
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#666"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Content (will be encrypted)"
              placeholderTextColor="#666"
              multiline
              value={newContent}
              onChangeText={setNewContent}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, (!newTitle.trim() || !newContent.trim()) && styles.submitBtnDisabled]}
                onPress={handleUpload}
                disabled={!newTitle.trim() || !newContent.trim()}
              >
                <Text style={styles.submitBtnText}>Save</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusVisible: {
    backgroundColor: '#275a27',
  },
  statusPending: {
    backgroundColor: '#5a4a27',
  },
  statusText: {
    color: '#E0E0E0',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  contentBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
  },
  contentText: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 20,
  },
  pendingBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  pendingText: {
    color: '#888',
    marginBottom: 12,
  },
  approvalStatus: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  approvalItem: {
    color: '#666',
    fontSize: 14,
  },
  approvalDone: {
    color: '#4ade80',
  },
  approveBtn: {
    backgroundColor: '#e17055',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // PIN Entry Styles
  pinContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  pinTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  pinSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  pinInputContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  pinDot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotText: {
    fontSize: 24,
    color: '#e17055',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    gap: 16,
    justifyContent: 'center',
  },
  numpadBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadBtnEmpty: {
    backgroundColor: 'transparent',
  },
  numpadText: {
    fontSize: 24,
    color: '#E0E0E0',
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
    minHeight: 100,
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
