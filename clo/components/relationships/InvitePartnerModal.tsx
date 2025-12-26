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
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCreateCapsule } from '@/hooks/useCapsules';

interface InvitePartnerModalProps {
  visible: boolean;
  onClose: () => void;
}

const ACCENT = '#e17055';

export default function InvitePartnerModal({ visible, onClose }: InvitePartnerModalProps) {
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'success'>('input');
  
  const { mutate: createCapsule, isPending } = useCreateCapsule();
  
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
          setStep('success');
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to create invite');
        },
      }
    );
  };

  const handleCopyCode = async () => {
    if (inviteCode) {
      // Use Share API as a cross-platform solution
      await Share.share({
        message: `Join my relationship capsule! Use code: ${inviteCode}`,
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
                <Text style={styles.successEmoji}>💌</Text>
              </View>
              <Text style={styles.title}>Invite Created!</Text>
              <Text style={styles.subtitle}>
                Share this code with {email} to connect your capsule
              </Text>

              <TouchableOpacity style={styles.codeContainer} onPress={handleCopyCode}>
                <Text style={styles.codeLabel}>Invite Code</Text>
                <Text style={styles.code}>{inviteCode?.slice(0, 8)}...</Text>
                <Text style={styles.copyHint}>Tap to copy</Text>
              </TouchableOpacity>

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
    marginBottom: 24,
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
