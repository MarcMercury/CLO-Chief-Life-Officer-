import React, { useState } from 'react';
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
} from 'react-native';
import PulseCheckIn from './PulseCheckIn';
import PlanModule from './PlanModule';
import DecideModule from './DecideModule';
import ResolveModule from './ResolveModule';
import VaultModule from './VaultModule';
import SignalChat from './SignalChat';

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
  
  // Local state for demo data
  const [planItems, setPlanItems] = useState<any[]>([]);
  const [decideItems, setDecideItems] = useState<any[]>([]);
  const [resolveItems, setResolveItems] = useState<any[]>([]);
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [hasPulseToday, setHasPulseToday] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

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
              console.log('Pulse submitted:', moods);
              setHasPulseToday(true);
              setActiveZone('home');
            }}
          />
        );
      case 'plan':
        return (
          <PlanModule
            items={planItems}
            onCreateItem={(title: string, description?: string, category?: string) => {
              setPlanItems([...planItems, { 
                id: Date.now().toString(), 
                title, 
                description,
                category: category || 'general', 
                vote_a: null,
                vote_b: null,
                status: 'planning',
                created_at: new Date().toISOString(),
              }]);
            }}
            onVote={(id: string, vote: boolean) => {
              setPlanItems(planItems.map((item: any) => 
                item.id === id 
                  ? { ...item, vote_a: vote }
                  : item
              ));
            }}
            onPromote={(id: string) => {
              const item = planItems.find((p: any) => p.id === id);
              if (item) {
                setDecideItems([...decideItems, {
                  id: Date.now().toString(),
                  title: item.title,
                  description: item.description,
                  status: 'pending',
                  confirmed_by_initiator: false,
                  confirmed_by_partner: false,
                  promoted_from_plan_id: id,
                  created_at: new Date().toISOString(),
                }]);
                setPlanItems(planItems.filter((p: any) => p.id !== id));
              }
            }}
            isUserA={true}
          />
        );
      case 'decide':
        return (
          <DecideModule
            items={decideItems}
            onConfirm={(id: string) => {
              setDecideItems(decideItems.map((item: any) =>
                item.id === id
                  ? { ...item, confirmed_by_initiator: true }
                  : item
              ));
            }}
            onComplete={(id: string) => {
              setDecideItems(decideItems.map((item: any) =>
                item.id === id
                  ? { ...item, status: 'completed' }
                  : item
              ));
            }}
            onAddItem={(title: string, description: string) => {
              setDecideItems([...decideItems, {
                id: Date.now().toString(),
                title,
                description,
                status: 'pending',
                confirmed_by_initiator: true,
                confirmed_by_partner: false,
                created_at: new Date().toISOString(),
              }]);
            }}
            currentUserId={userId}
          />
        );
      case 'resolve':
        return (
          <ResolveModule
            items={resolveItems}
            onCreateIssue={(issue: string) => {
              setResolveItems([...resolveItems, {
                id: Date.now().toString(),
                issue,
                status: 'open',
                initiator_id: userId,
                created_at: new Date().toISOString(),
              }]);
            }}
            onSubmitPerspective={(resolveId: string, feeling: string, need: string, willing: string, compromise: string) => {
              setResolveItems(resolveItems.map((item: any) =>
                item.id === resolveId
                  ? { 
                      ...item, 
                      perspective_a: { feeling, need, willing, compromise }
                    }
                  : item
              ));
            }}
            onAcceptCompromise={(id: string) => {
              setResolveItems(resolveItems.map((item: any) =>
                item.id === id
                  ? { ...item, status: 'resolved', partner_accepted: true }
                  : item
              ));
            }}
            isUserA={true}
            userId={userId}
          />
        );
      case 'vault':
        return (
          <VaultModule
            items={vaultItems}
            onUpload={(title: string, content: string, contentType: string) => {
              setVaultItems([...vaultItems, {
                id: Date.now().toString(),
                title,
                content_type: contentType,
                encrypted_content: content,
                uploaded_by: userId,
                approved_by_uploader: true,
                approved_by_partner: false,
                status: 'pending',
                created_at: new Date().toISOString(),
              }]);
            }}
            onApprove={(id: string) => {
              setVaultItems(vaultItems.map((item: any) =>
                item.id === id
                  ? { ...item, approved_by_partner: true, status: 'visible' }
                  : item
              ));
            }}
            currentUserId={userId}
            isUnlocked={isVaultUnlocked}
            onUnlock={(pin: string) => {
              if (pin.length === 4) {
                setIsVaultUnlocked(true);
                return true;
              }
              return false;
            }}
          />
        );
      case 'chat':
        return (
          <SignalChat
            messages={messages}
            onSendMessage={(text: string) => {
              setMessages([...messages, {
                id: Date.now().toString(),
                text,
                senderId: userId,
                timestamp: new Date(),
              }]);
            }}
            currentUserId={userId}
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
          <Text style={styles.zoneIcon}>💓</Text>
          <Text style={styles.zoneTitle}>Pulse</Text>
          <Text style={styles.zoneDesc}>Daily check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zonePlan]} onPress={() => setActiveZone('plan')}>
          <Text style={styles.zoneIcon}>💡</Text>
          <Text style={styles.zoneTitle}>Plan</Text>
          <Text style={styles.zoneDesc}>Ideas & brainstorm</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zoneDecide]} onPress={() => setActiveZone('decide')}>
          <Text style={styles.zoneIcon}>��</Text>
          <Text style={styles.zoneTitle}>Decide</Text>
          <Text style={styles.zoneDesc}>Finalize together</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zoneResolve]} onPress={() => setActiveZone('resolve')}>
          <Text style={styles.zoneIcon}>🤝</Text>
          <Text style={styles.zoneTitle}>Resolve</Text>
          <Text style={styles.zoneDesc}>Work through issues</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zoneVault]} onPress={() => setActiveZone('vault')}>
          <Text style={styles.zoneIcon}>🔐</Text>
          <Text style={styles.zoneTitle}>Vault</Text>
          <Text style={styles.zoneDesc}>Private storage</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.zoneCard, styles.zoneChat]} onPress={() => setActiveZone('chat')}>
          <Text style={styles.zoneIcon}>💬</Text>
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
  zoneIcon: { fontSize: 32, marginBottom: 8 },
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
