import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import PulseCheckIn from './PulseCheckIn';
import PlanModule from './PlanModule';
import DecideModule from './DecideModule';
import ResolveModule from './ResolveModule';
import VaultEnhanced from './VaultEnhanced';
import SignalChat from './SignalChat';
import {
  useCapsuleMessages,
  useSendMessage,
  useSharedTasks,
  useCreateSharedTask,
  useToggleSharedTask,
  useEmotionalLogs,
  useLogEmotion,
  useOpenLoops,
  useCreateOpenLoop,
} from '@/hooks/useCapsules';
import { useVaultState } from '@/hooks/useVault';

// Import custom icons
import {
  PulseIcon,
  PlanIcon,
  DecideIcon,
  ResolveIcon,
  VaultIcon,
  SignalIcon,
} from '@/components/icons';

import { MoodEmoji } from '@/types/relationships';

const { width } = Dimensions.get('window');

type CapsuleZone = 'home' | 'pulse' | 'plan' | 'decide' | 'resolve' | 'vault' | 'chat';

interface CapsuleData {
  id: string;
  name?: string;
  invite_code?: string;
  partner_id?: string;
}

interface CapsuleViewProps {
  capsuleId?: string;
  userId: string;
  capsule?: CapsuleData;
  onCreateCapsule?: () => Promise<void>;
  onJoinCapsule?: (code: string) => Promise<boolean>;
}

export default function CapsuleView({ 
  capsuleId, 
  userId, 
  capsule,
  onCreateCapsule,
  onJoinCapsule,
}: CapsuleViewProps) {
  const [activeZone, setActiveZone] = useState<CapsuleZone>('home');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  
  // Real database hooks - data persists!
  const { data: messages = [], isLoading: messagesLoading } = useCapsuleMessages(capsuleId || '');
  const { mutate: sendMessage } = useSendMessage();
  
  const { data: sharedTasks = [], isLoading: tasksLoading } = useSharedTasks(capsuleId || '');
  const { mutate: createTask } = useCreateSharedTask();
  const { mutate: toggleTask } = useToggleSharedTask();
  
  const { data: emotionalLogs = [] } = useEmotionalLogs(capsuleId || '');
  const { mutate: logEmotion } = useLogEmotion();
  
  const { data: openLoops = [] } = useOpenLoops(capsuleId || '');
  const { mutate: createLoop } = useCreateOpenLoop();
  
  // Derive plan items from shared tasks with status 'planning'
  const planItems = useMemo(() => 
    sharedTasks.filter((t: any) => t.status === 'planning' || !t.status),
    [sharedTasks]
  );
  
  // Derive decide items from shared tasks with status 'pending'
  const decideItems = useMemo(() => 
    sharedTasks.filter((t: any) => t.status === 'pending'),
    [sharedTasks]
  );
  
  // Use vault state hook for proper persistence
  const vaultState = useVaultState(capsuleId || '');
  
  // Check if pulse done today
  const hasPulseToday = useMemo(() => {
    const today = new Date().toDateString();
    return emotionalLogs.some((log: any) => 
      new Date(log.logged_at || log.created_at).toDateString() === today &&
      log.user_id === userId
    );
  }, [emotionalLogs, userId]);

  // Get partner's mood for today
  const partnerMoodsToday = useMemo(() => {
    const today = new Date().toDateString();
    const partnerLog = emotionalLogs.find((log: any) => 
      new Date(log.logged_at || log.created_at).toDateString() === today &&
      log.user_id !== userId
    );
    
    if (partnerLog) {
      return {
        self: partnerLog.mood_self as MoodEmoji | undefined,
        partner: partnerLog.mood_partner as MoodEmoji | undefined,
        us: partnerLog.mood_relationship as MoodEmoji | undefined,
        logged_at: partnerLog.logged_at || partnerLog.created_at,
      };
    }
    return undefined;
  }, [emotionalLogs, userId]);

  // If no capsule exists, show onboarding
  if (!capsuleId && !capsule) {
    return (
      <View style={styles.container}>
        <View style={styles.onboarding}>
          <Text style={styles.onboardingIcon}>💑</Text>
          <Text style={styles.onboardingTitle}>Relationship Capsule</Text>
          <Text style={styles.onboardingSubtitle}>
            A private space for two people to align, plan, and grow together
          </Text>

          <View style={styles.onboardingActions}>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={onCreateCapsule}
            >
              <Text style={styles.createBtnText}>Create New Capsule</Text>
              <Text style={styles.createBtnSubtext}>Get invite code for your partner</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => setShowJoinModal(true)}
            >
              <Text style={styles.joinBtnText}>Join with Code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Join Modal */}
        <Modal visible={showJoinModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Invite Code</Text>
              <Text style={styles.modalSubtitle}>
                Ask your partner for their 6-character code
              </Text>

              <TextInput
                style={styles.codeInput}
                placeholder="ABC123"
                placeholderTextColor="#666"
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowJoinModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, inviteCode.length !== 6 && styles.submitBtnDisabled]}
                  onPress={async () => {
                    if (onJoinCapsule) {
                      const result = await onJoinCapsule(inviteCode);
                      if (result) {
                        setShowJoinModal(false);
                        Alert.alert('Success!', 'You joined the capsule');
                      } else {
                        Alert.alert('Invalid Code', 'Please check the code and try again');
                      }
                    }
                  }}
                  disabled={inviteCode.length !== 6}
                >
                  <Text style={styles.submitBtnText}>Join</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Waiting for partner
  if (capsule && !capsule.partner_id) {
    return (
      <View style={styles.container}>
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingIcon}>⏳</Text>
          <Text style={styles.waitingTitle}>Waiting for Partner</Text>
          <Text style={styles.waitingSubtitle}>
            Share this code with your partner:
          </Text>

          <View style={styles.codeDisplay}>
            <Text style={styles.codeText}>{capsule.invite_code || '------'}</Text>
          </View>

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => {
              Alert.alert('Code Copied!', capsule.invite_code || 'No code');
            }}
          >
            <Text style={styles.shareBtnText}>📋 Copy Code</Text>
          </TouchableOpacity>

          <Text style={styles.waitingHint}>
            Once they join, you'll unlock all features together
          </Text>
        </View>
      </View>
    );
  }

  // Render active zone
  const renderZone = () => {
    switch (activeZone) {
      case 'pulse':
        return (
          <PulseCheckIn
            onSubmit={(moods) => {
              // Persist to database!
              if (capsuleId) {
                logEmotion({
                  capsule_id: capsuleId,
                  mood_self: moods.self || '😐',
                  mood_partner: moods.partner,
                  mood_relationship: moods.us, // 'us' is the relationship mood
                });
              }
              // Don't navigate away - show summary
            }}
            partnerMoods={partnerMoodsToday}
            partnerName={capsule?.name || 'Partner'}
          />
        );
      case 'plan':
        return (
          <PlanModule
            items={planItems as any}
            onCreateItem={(title: string, description?: string, category?: string) => {
              // Persist to database as shared task!
              if (capsuleId) {
                createTask({
                  capsule_id: capsuleId,
                  title,
                  description,
                });
              }
            }}
            onVote={(id: string, vote: boolean) => {
              // TODO: Add voting to shared_tasks table
              console.log('Vote:', id, vote);
            }}
            onPromote={(id: string) => {
              // Update task status to 'pending' (moves to Decide)
              if (capsuleId) {
                toggleTask({
                  taskId: id,
                  capsuleId,
                  isCompleted: false, // Not completed, just promoted
                });
              }
            }}
            isUserA={true}
          />
        );
      case 'decide':
        return (
          <DecideModule
            items={decideItems as any}
            onConfirm={(id: string) => {
              // Mark task as confirmed by current user
              console.log('Confirm decision:', id);
            }}
            onComplete={(id: string) => {
              // Mark task as completed in database!
              if (capsuleId) {
                toggleTask({
                  taskId: id,
                  capsuleId,
                  isCompleted: true,
                });
              }
            }}
            onAddItem={(title: string, description: string) => {
              // Add directly to pending (Decide zone)
              if (capsuleId) {
                createTask({
                  capsule_id: capsuleId,
                  title,
                  description,
                });
              }
            }}
            currentUserId={userId}
          />
        );
      case 'resolve':
        return (
          <ResolveModule
            items={openLoops as any[]}
            onCreateIssue={(issue: string) => {
              // Persist to database!
              if (capsuleId) {
                createLoop({
                  capsule_id: capsuleId,
                  title: issue,
                } as any);
              }
            }}
            onSubmitPerspective={(resolveId: string, feeling: string, need: string, willing: string, compromise: string) => {
              // TODO: Add perspective update mutation
              console.log('Perspective submitted:', { resolveId, feeling, need, willing, compromise });
            }}
            onAcceptCompromise={(id: string) => {
              // TODO: Add resolve mutation
              console.log('Compromise accepted:', id);
            }}
            isUserA={true}
            userId={userId}
          />
        );
      case 'vault':
        return (
          <VaultEnhanced
            items={vaultState.items}
            hasPasscode={vaultState.hasPasscode}
            partnerHasPasscode={vaultState.partnerHasPasscode}
            isUnlocked={vaultState.isUnlocked}
            onSetupPasscode={async (passcode: string) => {
              await vaultState.setupPasscode(passcode);
            }}
            onUnlock={async (passcode: string) => {
              return await vaultState.verifyPasscode(passcode);
            }}
            onUpload={async (title: string, content: string, contentType: any) => {
              await vaultState.uploadItem({
                title,
                content,
                content_type: contentType,
              });
            }}
            onUploadFile={async (uri: string, fileName: string, fileSize: number, mimeType: string, itemType: any, title: string) => {
              // Upload file to storage first
              const fileUrl = await vaultState.uploadFile(uri, fileName, mimeType);
              // Then create vault item
              await vaultState.uploadItem({
                title,
                content_type: itemType,
                file_url: fileUrl,
                file_name: fileName,
                file_size: fileSize,
                mime_type: mimeType,
              });
            }}
            onApprove={async (id: string) => {
              await vaultState.approveItem(id);
            }}
            currentUserId={userId}
          />
        );
      case 'chat':
        return (
          <SignalChat
            messages={messages.map((m: any) => ({
              id: m.id,
              sender_id: m.sender_id,
              encrypted_content: m.encrypted_content,
              created_at: m.created_at,
            }))}
            onSendMessage={(text: string) => {
              // Persist to database!
              if (capsuleId) {
                sendMessage({
                  capsule_id: capsuleId,
                  content: text,
                });
              }
            }}
            currentUserId={userId}
            loading={messagesLoading}
          />
        );
      default:
        return renderHome();
    }
  };

  const renderHome = () => (
    <ScrollView style={styles.homeScroll} contentContainerStyle={styles.homeContent}>
      <View style={styles.partnerHeader}>
        <View style={styles.partnerAvatars}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>You</Text>
          </View>
          <View style={styles.heartBadge}>
            <Text>💕</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Them</Text>
          </View>
        </View>
        <Text style={styles.capsuleName}>{capsule?.name || 'Our Capsule'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{hasPulseToday ? '✓' : '○'}</Text>
          <Text style={styles.statLabel}>Pulse Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{planItems.length}</Text>
          <Text style={styles.statLabel}>Ideas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{decideItems.filter((d: any) => d.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.zoneGrid}>
        <TouchableOpacity style={[styles.zoneCard, styles.zonePulse]} onPress={() => setActiveZone('pulse')}>
          <View style={styles.zoneIconContainer}>
            <PulseIcon size={36} color="#EC4899" />
          </View>
          <Text style={styles.zoneTitle}>Pulse</Text>
          <Text style={styles.zoneDesc}>Daily check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zonePlan]} onPress={() => setActiveZone('plan')}>
          <View style={styles.zoneIconContainer}>
            <PlanIcon size={36} color="#F59E0B" />
          </View>
          <Text style={styles.zoneTitle}>Plan</Text>
          <Text style={styles.zoneDesc}>Ideas & brainstorm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zoneDecide]} onPress={() => setActiveZone('decide')}>
          <View style={styles.zoneIconContainer}>
            <DecideIcon size={36} color="#10B981" />
          </View>
          <Text style={styles.zoneTitle}>Decide</Text>
          <Text style={styles.zoneDesc}>Finalize together</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zoneResolve]} onPress={() => setActiveZone('resolve')}>
          <View style={styles.zoneIconContainer}>
            <ResolveIcon size={36} color="#8B5CF6" />
          </View>
          <Text style={styles.zoneTitle}>Resolve</Text>
          <Text style={styles.zoneDesc}>Work through issues</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zoneVault]} onPress={() => setActiveZone('vault')}>
          <View style={styles.zoneIconContainer}>
            <VaultIcon size={36} color="#6366F1" />
          </View>
          <Text style={styles.zoneTitle}>Vault</Text>
          <Text style={styles.zoneDesc}>Private storage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zoneChat]} onPress={() => setActiveZone('chat')}>
          <View style={styles.zoneIconContainer}>
            <SignalIcon size={36} color="#06B6D4" />
          </View>
          <Text style={styles.zoneTitle}>Chat</Text>
          <Text style={styles.zoneDesc}>Quick messages</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {activeZone !== 'home' && (
        <TouchableOpacity style={styles.backButton} onPress={() => setActiveZone('home')}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      )}
      {renderZone()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  onboarding: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  onboardingIcon: { fontSize: 80, marginBottom: 24 },
  onboardingTitle: { fontSize: 28, fontWeight: '600', color: '#E0E0E0', marginBottom: 12, textAlign: 'center' },
  onboardingSubtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 48, lineHeight: 24 },
  onboardingActions: { width: '100%' },
  createBtn: { backgroundColor: '#e17055', padding: 20, borderRadius: 16, alignItems: 'center' },
  createBtnText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  createBtnSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#333' },
  dividerText: { color: '#666', marginHorizontal: 16 },
  joinBtn: { backgroundColor: '#2A2A2A', padding: 20, borderRadius: 16, alignItems: 'center' },
  joinBtnText: { color: '#E0E0E0', fontSize: 18, fontWeight: '500' },
  waitingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  waitingIcon: { fontSize: 60, marginBottom: 24 },
  waitingTitle: { fontSize: 24, fontWeight: '600', color: '#E0E0E0', marginBottom: 8 },
  waitingSubtitle: { fontSize: 16, color: '#888', marginBottom: 24 },
  codeDisplay: { backgroundColor: '#1E1E1E', paddingHorizontal: 32, paddingVertical: 20, borderRadius: 16, borderWidth: 2, borderColor: '#e17055', marginBottom: 16 },
  codeText: { fontSize: 36, fontWeight: '700', color: '#e17055', letterSpacing: 8, fontFamily: 'monospace' },
  shareBtn: { backgroundColor: '#2A2A2A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginBottom: 32 },
  shareBtnText: { color: '#E0E0E0', fontSize: 16 },
  waitingHint: { fontSize: 14, color: '#666', textAlign: 'center' },
  homeScroll: { flex: 1 },
  homeContent: { padding: 20 },
  partnerHeader: { alignItems: 'center', marginBottom: 24 },
  partnerAvatars: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#888', fontSize: 12 },
  heartBadge: { marginHorizontal: -8, zIndex: 1 },
  capsuleName: { fontSize: 20, fontWeight: '600', color: '#E0E0E0' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '600', color: '#e17055' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  zoneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  zoneCard: { width: (width - 52) / 2, padding: 20, borderRadius: 16, alignItems: 'center' },
  zonePulse: { backgroundColor: '#e1705533' },
  zonePlan: { backgroundColor: '#3498db33' },
  zoneDecide: { backgroundColor: '#f39c1233' },
  zoneResolve: { backgroundColor: '#9b59b633' },
  zoneVault: { backgroundColor: '#27ae6033' },
  zoneChat: { backgroundColor: '#1abc9c33' },
  zoneIconContainer: { marginBottom: 8, alignItems: 'center', justifyContent: 'center' },
  zoneTitle: { fontSize: 16, fontWeight: '600', color: '#E0E0E0', marginBottom: 4 },
  zoneDesc: { fontSize: 12, color: '#888' },
  backButton: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  backText: { color: '#e17055', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#E0E0E0' },
  modalSubtitle: { fontSize: 13, color: '#888', marginTop: 4, marginBottom: 20 },
  codeInput: { backgroundColor: '#2A2A2A', borderRadius: 12, padding: 20, color: '#E0E0E0', fontSize: 28, textAlign: 'center', fontFamily: 'monospace', letterSpacing: 8, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center' },
  cancelBtnText: { color: '#888', fontSize: 16 },
  submitBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#e17055', alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
