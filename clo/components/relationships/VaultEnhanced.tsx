/**
 * VaultEnhanced - Secure Shared Vault with File Upload Support
 * 
 * Features:
 * - First-time passcode setup flow
 * - PIN verification for access
 * - File upload support (images, documents, etc.)
 * - Double-consent for all items
 * - Encrypted storage
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export type VaultItemType = 'note' | 'image' | 'document' | 'password' | 'account';

export interface VaultItem {
  id: string;
  title: string;
  content_type: VaultItemType;
  encrypted_content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  thumbnail_url?: string;
  uploaded_by: string;
  approved_by_uploader: boolean;
  approved_by_partner: boolean;
  status: 'pending' | 'visible' | 'rejected';
  created_at: string;
}

interface VaultEnhancedProps {
  capsuleId: string;
  currentUserId: string;
  items: VaultItem[];
  hasPasscode: boolean; // Whether this user has set their vault passcode
  partnerHasPasscode: boolean; // Whether partner has set theirs
  isUnlocked: boolean;
  onSetupPasscode: (passcode: string) => Promise<boolean>;
  onUnlock: (passcode: string) => Promise<boolean>;
  onUpload: (item: {
    title: string;
    content?: string;
    content_type: VaultItemType;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
  }) => Promise<void>;
  onApprove: (itemId: string) => Promise<void>;
  onDelete?: (itemId: string) => Promise<void>;
  onUploadFile?: (uri: string, fileName: string, mimeType: string) => Promise<string>; // Returns URL
  loading?: boolean;
}

// ============================================
// PASSCODE SETUP COMPONENT
// ============================================

interface PasscodeSetupProps {
  onComplete: (passcode: string) => void;
  partnerHasPasscode: boolean;
}

function PasscodeSetup({ onComplete, partnerHasPasscode }: PasscodeSetupProps) {
  const [step, setStep] = useState<'intro' | 'enter' | 'confirm'>('intro');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');

  const handlePasscodeEntry = (digit: string | number) => {
    Haptics.selectionAsync();
    const currentCode = step === 'enter' ? passcode : confirmPasscode;
    const setter = step === 'enter' ? setPasscode : setConfirmPasscode;
    
    if (digit === 'del') {
      setter(currentCode.slice(0, -1));
      setError('');
    } else if (typeof digit === 'number' && currentCode.length < 6) {
      const newCode = currentCode + digit;
      setter(newCode);
      setError('');
      
      if (newCode.length === 6) {
        if (step === 'enter') {
          setTimeout(() => setStep('confirm'), 200);
        } else {
          // Confirm step
          if (newCode === passcode) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete(newCode);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError('Passcodes don\'t match');
            setConfirmPasscode('');
          }
        }
      }
    }
  };

  const renderNumpad = () => (
    <View style={styles.numpad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.numpadBtn, num === null && styles.numpadBtnEmpty]}
          onPress={() => num !== null && handlePasscodeEntry(num)}
          disabled={num === null}
        >
          <Text style={styles.numpadText}>
            {num === 'del' ? '⌫' : num}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDots = (code: string) => (
    <View style={styles.pinDots}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[styles.pinDot, code[i] && styles.pinDotFilled]} />
      ))}
    </View>
  );

  if (step === 'intro') {
    return (
      <View style={styles.setupContainer}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.setupContent}>
          <Text style={styles.setupIcon}>🔐</Text>
          <Text style={styles.setupTitle}>Setup Your Vault</Text>
          <Text style={styles.setupSubtitle}>
            Create a 6-digit passcode to protect your shared secrets
          </Text>
          
          <View style={styles.setupInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🔒</Text>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>End-to-End Encrypted</Text>
                <Text style={styles.infoDesc}>Only you and your partner can access</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>👥</Text>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Double Consent Required</Text>
                <Text style={styles.infoDesc}>Both must approve before items are visible</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📁</Text>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Store Anything</Text>
                <Text style={styles.infoDesc}>Notes, photos, documents, passwords</Text>
              </View>
            </View>
          </View>

          {!partnerHasPasscode && (
            <View style={styles.waitingNote}>
              <Text style={styles.waitingNoteText}>
                ⏳ Your partner hasn't set up their passcode yet
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setStep('enter');
            }}
          >
            <Text style={styles.setupButtonText}>Create Passcode</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.passcodeContainer}>
      <Text style={styles.lockIcon}>🔐</Text>
      <Text style={styles.passcodeTitle}>
        {step === 'enter' ? 'Create Passcode' : 'Confirm Passcode'}
      </Text>
      <Text style={styles.passcodeSubtitle}>
        {step === 'enter' 
          ? 'Enter a 6-digit passcode' 
          : 'Re-enter your passcode'}
      </Text>

      {renderDots(step === 'enter' ? passcode : confirmPasscode)}

      {error && (
        <Animated.Text entering={FadeIn} style={styles.errorText}>
          {error}
        </Animated.Text>
      )}

      {renderNumpad()}

      {step === 'confirm' && (
        <TouchableOpacity 
          style={styles.backLink}
          onPress={() => {
            setStep('enter');
            setPasscode('');
            setConfirmPasscode('');
            setError('');
          }}
        >
          <Text style={styles.backLinkText}>Start over</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// PASSCODE ENTRY COMPONENT
// ============================================

interface PasscodeEntryProps {
  onUnlock: (passcode: string) => Promise<boolean>;
}

function PasscodeEntry({ onUnlock }: PasscodeEntryProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasscodeEntry = async (digit: string | number) => {
    Haptics.selectionAsync();
    
    if (digit === 'del') {
      setPasscode(passcode.slice(0, -1));
      setError('');
    } else if (typeof digit === 'number' && passcode.length < 6) {
      const newCode = passcode + digit;
      setPasscode(newCode);
      setError('');
      
      if (newCode.length === 6) {
        setLoading(true);
        try {
          const success = await onUnlock(newCode);
          if (!success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError('Incorrect passcode');
            setPasscode('');
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (e) {
          setError('Something went wrong');
          setPasscode('');
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <View style={styles.passcodeContainer}>
      <Text style={styles.lockIcon}>🔐</Text>
      <Text style={styles.passcodeTitle}>The Vault</Text>
      <Text style={styles.passcodeSubtitle}>Enter your passcode</Text>

      <View style={styles.pinDots}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.pinDot, passcode[i] && styles.pinDotFilled]} />
        ))}
      </View>

      {error && (
        <Animated.Text entering={FadeIn} style={styles.errorText}>
          {error}
        </Animated.Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#e17055" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.numpad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((num, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.numpadBtn, num === null && styles.numpadBtnEmpty]}
              onPress={() => num !== null && handlePasscodeEntry(num)}
              disabled={num === null}
            >
              <Text style={styles.numpadText}>
                {num === 'del' ? '⌫' : num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================
// ADD ITEM MODAL
// ============================================

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: {
    title: string;
    content?: string;
    content_type: VaultItemType;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    mime_type?: string;
  }) => Promise<void>;
  onUploadFile?: (uri: string, fileName: string, mimeType: string) => Promise<string>;
}

function AddItemModal({ visible, onClose, onSubmit, onUploadFile }: AddItemModalProps) {
  const [itemType, setItemType] = useState<VaultItemType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    mimeType: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const itemTypes: { value: VaultItemType; label: string; icon: string }[] = [
    { value: 'note', label: 'Note', icon: '📝' },
    { value: 'image', label: 'Image', icon: '🖼️' },
    { value: 'document', label: 'Document', icon: '📄' },
    { value: 'password', label: 'Password', icon: '🔑' },
    { value: 'account', label: 'Account', icon: '🏦' },
  ];

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        size: asset.fileSize,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets?.[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType || 'application/octet-stream',
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick document');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title');
      return;
    }

    if ((itemType === 'note' || itemType === 'password' || itemType === 'account') && !content.trim()) {
      Alert.alert('Content required', 'Please enter content');
      return;
    }

    if ((itemType === 'image' || itemType === 'document') && !selectedFile) {
      Alert.alert('File required', 'Please select a file');
      return;
    }

    setUploading(true);
    try {
      let fileUrl: string | undefined;
      
      if (selectedFile && onUploadFile) {
        fileUrl = await onUploadFile(selectedFile.uri, selectedFile.name, selectedFile.mimeType);
      }

      await onSubmit({
        title: title.trim(),
        content: content.trim() || undefined,
        content_type: itemType,
        file_url: fileUrl,
        file_name: selectedFile?.name,
        file_size: selectedFile?.size,
        mime_type: selectedFile?.mimeType,
      });

      // Reset form
      setTitle('');
      setContent('');
      setSelectedFile(null);
      setItemType('note');
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setSelectedFile(null);
    setItemType('note');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Animated.View 
          entering={FadeInDown.duration(300)}
          style={styles.addModalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Vault</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            Your partner must approve before content becomes visible
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Type Selector */}
            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.typeSelector}
            >
              {itemTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeChip,
                    itemType === type.value && styles.typeChipSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setItemType(type.value);
                    setSelectedFile(null);
                    setContent('');
                  }}
                >
                  <Text style={styles.typeChipIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeChipText,
                    itemType === type.value && styles.typeChipTextSelected,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Title */}
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Give it a name"
              placeholderTextColor="#666"
              value={title}
              onChangeText={setTitle}
            />

            {/* Content based on type */}
            {(itemType === 'note' || itemType === 'password' || itemType === 'account') && (
              <>
                <Text style={styles.fieldLabel}>
                  {itemType === 'password' ? 'Password' : itemType === 'account' ? 'Account Details' : 'Content'}
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder={
                    itemType === 'password' 
                      ? 'Enter the password'
                      : itemType === 'account'
                        ? 'Username, password, notes...'
                        : 'Write your note...'
                  }
                  placeholderTextColor="#666"
                  multiline
                  secureTextEntry={itemType === 'password'}
                  value={content}
                  onChangeText={setContent}
                />
              </>
            )}

            {/* File Picker for Image/Document */}
            {(itemType === 'image' || itemType === 'document') && (
              <View style={styles.filePicker}>
                {selectedFile ? (
                  <View style={styles.selectedFile}>
                    {itemType === 'image' && (
                      <Image 
                        source={{ uri: selectedFile.uri }} 
                        style={styles.previewImage}
                      />
                    )}
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      {selectedFile.size && (
                        <Text style={styles.fileSize}>
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity 
                      onPress={() => setSelectedFile(null)}
                      style={styles.removeFileBtn}
                    >
                      <Text style={styles.removeFileBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.pickFileBtn}
                    onPress={itemType === 'image' ? handlePickImage : handlePickDocument}
                  >
                    <Text style={styles.pickFileIcon}>
                      {itemType === 'image' ? '🖼️' : '📄'}
                    </Text>
                    <Text style={styles.pickFileText}>
                      {itemType === 'image' ? 'Select Image' : 'Select Document'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Save to Vault</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================
// VAULT ITEM CARD
// ============================================

interface VaultItemCardProps {
  item: VaultItem;
  currentUserId: string;
  onApprove: (itemId: string) => void;
}

function VaultItemCard({ item, currentUserId, onApprove }: VaultItemCardProps) {
  const isUploader = item.uploaded_by === currentUserId;
  const myApproval = isUploader ? item.approved_by_uploader : item.approved_by_partner;
  const theirApproval = isUploader ? item.approved_by_partner : item.approved_by_uploader;
  const isVisible = item.status === 'visible';

  const typeIcons: Record<VaultItemType, string> = {
    note: '📝',
    image: '🖼️',
    document: '📄',
    password: '🔑',
    account: '🏦',
  };

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemTypeIcon}>{typeIcons[item.content_type]}</Text>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={[styles.statusBadge, isVisible ? styles.statusVisible : styles.statusPending]}>
          <Text style={styles.statusText}>
            {isVisible ? '✓ Shared' : '⏳ Pending'}
          </Text>
        </View>
      </View>

      {isVisible ? (
        <View style={styles.contentBox}>
          {item.content_type === 'image' && item.file_url && (
            <Image 
              source={{ uri: item.file_url }} 
              style={styles.contentImage}
              resizeMode="cover"
            />
          )}
          {item.content_type === 'document' && (
            <View style={styles.documentInfo}>
              <Text style={styles.documentIcon}>📄</Text>
              <Text style={styles.documentName}>{item.file_name}</Text>
            </View>
          )}
          {(item.content_type === 'note' || item.content_type === 'password' || item.content_type === 'account') && (
            <Text style={styles.contentText}>{item.encrypted_content}</Text>
          )}
        </View>
      ) : (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingText}>🔒 Requires mutual approval</Text>
          <View style={styles.approvalStatus}>
            <View style={[styles.approvalBadge, myApproval && styles.approvalBadgeDone]}>
              <Text style={styles.approvalBadgeText}>
                {myApproval ? '✓' : '○'} You
              </Text>
            </View>
            <View style={[styles.approvalBadge, theirApproval && styles.approvalBadgeDone]}>
              <Text style={styles.approvalBadgeText}>
                {theirApproval ? '✓' : '○'} Partner
              </Text>
            </View>
          </View>
          {!myApproval && (
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onApprove(item.id);
              }}
            >
              <Text style={styles.approveBtnText}>
                {isUploader ? 'Confirm Share' : 'Approve'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Animated.View>
  );
}

// ============================================
// MAIN VAULT COMPONENT
// ============================================

export default function VaultEnhanced({
  capsuleId,
  currentUserId,
  items,
  hasPasscode,
  partnerHasPasscode,
  isUnlocked,
  onSetupPasscode,
  onUnlock,
  onUpload,
  onApprove,
  onDelete,
  onUploadFile,
  loading,
}: VaultEnhancedProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  // Step 1: If user hasn't set up their passcode
  if (!hasPasscode) {
    return (
      <PasscodeSetup 
        onComplete={onSetupPasscode}
        partnerHasPasscode={partnerHasPasscode}
      />
    );
  }

  // Step 2: If vault is locked, show PIN entry
  if (!isUnlocked) {
    return <PasscodeEntry onUnlock={onUnlock} />;
  }

  // Step 3: Vault is unlocked - show content
  const pendingItems = items.filter(i => i.status === 'pending');
  const visibleItems = items.filter(i => i.status === 'visible');

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>🔐 The Vault</Text>
          <Text style={styles.subtitle}>Double-key protected</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{visibleItems.length}</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
          <View style={[styles.statBadge, styles.statBadgePending]}>
            <Text style={styles.statNumber}>{pendingItems.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </Animated.View>

      {/* Items List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VaultItemCard 
            item={item} 
            currentUserId={currentUserId}
            onApprove={onApprove}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View entering={FadeIn.delay(200)} style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyText}>Your vault is empty</Text>
            <Text style={styles.emptySubtext}>
              Add notes, images, documents, or passwords that only you two can access
            </Text>
          </Animated.View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAddModal(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add to Vault</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={onUpload}
        onUploadFile={onUploadFile}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
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
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  statBadgePending: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#8B8B9E',
    textTransform: 'uppercase',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 12,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  itemTypeIcon: {
    fontSize: 20,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusVisible: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  contentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  contentText: {
    padding: 14,
    color: '#E0E0E0',
    fontSize: 15,
    lineHeight: 22,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  documentIcon: {
    fontSize: 32,
  },
  documentName: {
    fontSize: 14,
    color: '#E0E0E0',
    flex: 1,
  },
  pendingBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  pendingText: {
    color: '#8B8B9E',
    fontSize: 14,
    marginBottom: 12,
  },
  approvalStatus: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  approvalBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  approvalBadgeDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  approvalBadgeText: {
    color: '#fff',
    fontSize: 13,
  },
  approveBtn: {
    backgroundColor: '#e17055',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  approveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#e17055',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B8B9E',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Setup styles
  setupContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  setupContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  setupIcon: {
    fontSize: 72,
    marginBottom: 24,
  },
  setupTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  setupSubtitle: {
    fontSize: 16,
    color: '#8B8B9E',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  setupInfo: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    color: '#8B8B9E',
    lineHeight: 18,
  },
  waitingNote: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
    width: '100%',
  },
  waitingNoteText: {
    color: '#FBBF24',
    fontSize: 14,
    textAlign: 'center',
  },
  setupButton: {
    backgroundColor: '#e17055',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Passcode entry styles
  passcodeContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  passcodeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  passcodeSubtitle: {
    fontSize: 15,
    color: '#8B8B9E',
    marginBottom: 32,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pinDotFilled: {
    backgroundColor: '#e17055',
    borderColor: '#e17055',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 260,
    gap: 16,
    justifyContent: 'center',
    marginTop: 24,
  },
  numpadBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadBtnEmpty: {
    backgroundColor: 'transparent',
  },
  numpadText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '500',
  },
  backLink: {
    marginTop: 24,
  },
  backLinkText: {
    color: '#8B8B9E',
    fontSize: 15,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  addModalContent: {
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
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: '#8B8B9E',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#8B8B9E',
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B8B9E',
    marginBottom: 10,
    marginTop: 16,
  },
  typeSelector: {
    marginBottom: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeChipSelected: {
    backgroundColor: 'rgba(225, 112, 85, 0.2)',
    borderColor: '#e17055',
  },
  typeChipIcon: {
    fontSize: 18,
  },
  typeChipText: {
    fontSize: 15,
    color: '#8B8B9E',
    fontWeight: '500',
  },
  typeChipTextSelected: {
    color: '#e17055',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  filePicker: {
    marginTop: 16,
  },
  pickFileBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  pickFileIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  pickFileText: {
    fontSize: 15,
    color: '#8B8B9E',
  },
  selectedFile: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#8B8B9E',
    marginTop: 2,
  },
  removeFileBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFileBtnText: {
    color: '#EF4444',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#e17055',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
