import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCreateCapsule, useResendInviteEmail } from '@/hooks/useCapsules';

interface InvitePartnerModalProps {
  visible: boolean;
  onClose: () => void;
}

const ACCENT = '#e17055';

export default function InvitePartnerModal({ visible, onClose }: InvitePartnerModalProps) {
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [capsuleId, setCapsuleId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [step, setStep] = useState<'input' | 'success'>('input');
  
  const { mutate: createCapsule, isPending } = useCreateCapsule();
  const { mutate: resendEmail, isPending: isResending } = useResendInviteEmail();
  
  const translateY = useSharedValue(300);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(300, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
      // Reset state when closing
      setTimeout(() => {
        setStep('input');
        setEmail('');
        setInviteCode(null);
        setCapsuleId(null);
        setEmailSent(false);
      }, 300);
    }
  }, [visible]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendInvite = () => {
    if (!email.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    if (!validateEmail(email.trim())) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    Keyboard.dismiss();

    createCapsule(
      { partner_email: email.trim() },
      {
        onSuccess: (capsule) => {
          const code = (capsule as any).invite_token;
          setInviteCode(code);
          setCapsuleId(capsule.id);
          setEmailSent((capsule as any).emailSent || false);
          setStep('success');
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to create invite');
        },
      }
    );
  };

  const handleResendEmail = () => {
    if (!inviteCode || !capsuleId) return;
    
    resendEmail(
      {
        invitee_email: email.trim(),
        invite_token: inviteCode,
        capsule_id: capsuleId,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setEmailSent(true);
            Alert.alert('Success', 'Invite email sent!');
          } else {
            Alert.alert('Error', result.message || 'Failed to send email');
          }
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to send email');
        },
      }
    );
  };

  const handleCopyCode = async () => {
    if (inviteCode) {
      // Use Share API as a cross-platform solution
      await Share.share({
        message: `Join my relationship capsule on CLO! Use this invite code: ${inviteCode.substring(0, 8).toUpperCase()}\n\nDownload CLO and enter this code to connect with me.`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={styles.overlayPress} onPress={handleClose} />
        </Animated.View>

        <Animated.View style={[styles.container, animatedContainerStyle]}>
          <View style={styles.handleBar} />

          {step === 'input' ? (
            <>
              <Text style={styles.title}>Invite Partner</Text>
              <Text style={styles.subtitle}>
                Create a private capsule to share tasks, memories, and stay connected
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Partner's Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="partner@example.com"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.sendButton, isPending && styles.buttonDisabled]}
                onPress={handleSendInvite}
                disabled={isPending}
              >
                <Text style={styles.sendButtonText}>
                  {isPending ? 'Creating...' : 'Create Invite'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.successIcon}>
                <Text style={styles.successEmoji}>{emailSent ? '✉️' : '💌'}</Text>
              </View>
              <Text style={styles.title}>
                {emailSent ? 'Invite Sent!' : 'Invite Created!'}
              </Text>
              
              {/* Email status message */}
              {emailSent ? (
                <Text style={styles.subtitle}>
                  We've sent an invitation to <Text style={styles.emailHighlight}>{email}</Text>
                </Text>
              ) : (
                <Text style={styles.subtitle}>
                  Share the invite code below with {email} to connect your capsule
                </Text>
              )}

              {/* Email sent confirmation badge */}
              {emailSent && (
                <View style={styles.emailSentBadge}>
                  <Text style={styles.emailSentText}>📬 Email invitation sent</Text>
                </View>
              )}

              <TouchableOpacity style={styles.codeContainer} onPress={handleCopyCode}>
                <Text style={styles.codeLabel}>Invite Code</Text>
                <Text style={styles.code}>{inviteCode?.slice(0, 8).toUpperCase()}</Text>
                <Text style={styles.copyHint}>Tap to share</Text>
              </TouchableOpacity>

              {/* Resend email button if email wasn't sent */}
              {!emailSent && (
                <TouchableOpacity
                  style={[styles.resendButton, isResending && styles.buttonDisabled]}
                  onPress={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? (
                    <ActivityIndicator size="small" color={ACCENT} />
                  ) : (
                    <Text style={styles.resendButtonText}>📧 Send Email Invite</Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayPress: {
    flex: 1,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: '#E0E0E0',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  emailHighlight: {
    color: ACCENT,
    fontWeight: '500',
  },
  emailSentBadge: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  emailSentText: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: '#E0E0E0',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 48,
  },
  codeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: ACCENT,
  },
  codeLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  code: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: ACCENT,
    letterSpacing: 2,
  },
  copyHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  resendButton: {
    backgroundColor: 'rgba(225, 112, 85, 0.15)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(225, 112, 85, 0.3)',
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: ACCENT,
  },
  doneButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E0E0E0',
  },
});
