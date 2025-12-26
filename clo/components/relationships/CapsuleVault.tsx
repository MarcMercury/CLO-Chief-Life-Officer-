import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const ACCENT = '#e17055';

interface CapsuleVaultProps {
  capsuleId: string;
}

interface VaultItem {
  id: string;
  type: 'memory' | 'document' | 'secret' | 'promise';
  title: string;
  preview?: string;
  createdAt: string;
  icon: string;
}

// Placeholder vault items for UI demonstration
const DEMO_ITEMS: VaultItem[] = [
  {
    id: '1',
    type: 'memory',
    title: 'Our First Date',
    preview: 'That coffee shop on Main St...',
    createdAt: '2024-01-15',
    icon: '💝',
  },
  {
    id: '2',
    type: 'promise',
    title: 'Anniversary Promise',
    preview: 'Every year we will...',
    createdAt: '2024-02-14',
    icon: '🤝',
  },
  {
    id: '3',
    type: 'document',
    title: 'Shared Budget',
    preview: 'Monthly expenses...',
    createdAt: '2024-03-01',
    icon: '📄',
  },
];

export default function CapsuleVault({ capsuleId }: CapsuleVaultProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [showPinEntry, setShowPinEntry] = useState(false);
  
  const shakeX = useSharedValue(0);
  const lockScale = useSharedValue(1);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const lockStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lockScale.value }],
  }));

  const handleUnlockAttempt = () => {
    if (pin.length < 4) return;
    
    // Demo: any 4-digit PIN works for now
    if (pin === '1234' || pin.length === 4) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      lockScale.value = withSequence(
        withSpring(1.2),
        withSpring(0)
      );
      setTimeout(() => setIsLocked(false), 300);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shakeX.value = withSequence(
        withSpring(-10),
        withSpring(10),
        withSpring(-10),
        withSpring(10),
        withSpring(0)
      );
      setPin('');
    }
  };

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(handleUnlockAttempt, 200);
      }
    }
  };

  const handleDeletePin = () => {
    if (pin.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPin(pin.slice(0, -1));
    }
  };

  if (isLocked && !showPinEntry) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.lockedContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.lockedState}>
          <Animated.View style={lockStyle}>
            <Text style={styles.lockIcon}>🔐</Text>
          </Animated.View>
          <Text style={styles.lockedTitle}>Two-Key Vault</Text>
          <Text style={styles.lockedSubtitle}>
            Protected memories and secrets that require both partners to unlock
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💝</Text>
              <Text style={styles.featureText}>Shared memories</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🤝</Text>
              <Text style={styles.featureText}>Promises & commitments</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📄</Text>
              <Text style={styles.featureText}>Important documents</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔑</Text>
              <Text style={styles.featureText}>Shared secrets</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.unlockButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowPinEntry(true);
            }}
          >
            <Text style={styles.unlockButtonText}>Enter PIN to Unlock</Text>
          </TouchableOpacity>

          <View style={styles.e2eNote}>
            <Text style={styles.e2eIcon}>🔒</Text>
            <Text style={styles.e2eText}>
              End-to-end encryption • Neither of you can access alone
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    );
  }

  if (isLocked && showPinEntry) {
    return (
      <View style={styles.container}>
        <Animated.View 
          entering={FadeIn.duration(200)} 
          style={[styles.pinContainer, shakeStyle]}
        >
          <Text style={styles.pinTitle}>Enter Your PIN</Text>
          <Text style={styles.pinSubtitle}>Both partners must enter their PIN</Text>

          {/* PIN Dots */}
          <View style={styles.pinDots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  pin.length > i && styles.pinDotFilled
                ]}
              />
            ))}
          </View>

          {/* Keypad */}
          <View style={styles.keypad}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key) => (
              <TouchableOpacity
                key={key || 'empty'}
                style={[
                  styles.keypadButton,
                  !key && styles.keypadButtonEmpty
                ]}
                onPress={() => {
                  if (key === '⌫') {
                    handleDeletePin();
                  } else if (key) {
                    handlePinPress(key);
                  }
                }}
                disabled={!key}
              >
                <Text style={styles.keypadText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowPinEntry(false);
              setPin('');
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // Unlocked vault view
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(300)}>
        {/* Header */}
        <View style={styles.unlockedHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.unlockedIcon}>🔓</Text>
            <View>
              <Text style={styles.unlockedTitle}>Vault Unlocked</Text>
              <Text style={styles.unlockedSubtitle}>{DEMO_ITEMS.length} items</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.lockButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsLocked(true);
              setShowPinEntry(false);
              setPin('');
            }}
          >
            <Text style={styles.lockButtonText}>Lock</Text>
          </TouchableOpacity>
        </View>

        {/* Add New Item */}
        <TouchableOpacity style={styles.addItemButton}>
          <Text style={styles.addItemIcon}>+</Text>
          <Text style={styles.addItemText}>Add to Vault</Text>
        </TouchableOpacity>

        {/* Vault Items */}
        <View style={styles.itemsList}>
          {DEMO_ITEMS.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(index * 100).duration(300)}
            >
              <TouchableOpacity style={styles.vaultItem}>
                <View style={styles.itemIcon}>
                  <Text style={styles.itemEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemPreview}>{item.preview}</Text>
                </View>
                <Text style={styles.itemArrow}>›</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Coming Soon Note */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonIcon}>✨</Text>
          <Text style={styles.comingSoonText}>
            Full vault features with E2EE coming in a future update
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  lockedContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  lockedState: {
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  lockedSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  featureList: {
    marginTop: 32,
    gap: 16,
    width: '100%',
    maxWidth: 260,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#ccc',
  },
  unlockButton: {
    marginTop: 40,
    backgroundColor: ACCENT,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  e2eNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    opacity: 0.5,
  },
  e2eIcon: {
    fontSize: 12,
  },
  e2eText: {
    fontSize: 12,
    color: '#888',
  },
  pinContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pinTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  pinSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pinDotFilled: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    gap: 16,
    justifyContent: 'center',
  },
  keypadButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadButtonEmpty: {
    backgroundColor: 'transparent',
  },
  keypadText: {
    fontSize: 24,
    color: '#E0E0E0',
  },
  cancelButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelText: {
    fontSize: 15,
    color: '#888',
  },
  unlockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unlockedIcon: {
    fontSize: 28,
  },
  unlockedTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  unlockedSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  lockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lockButtonText: {
    fontSize: 13,
    color: '#E0E0E0',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(225, 112, 85, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(225, 112, 85, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
  },
  addItemIcon: {
    fontSize: 18,
    color: ACCENT,
  },
  addItemText: {
    fontSize: 15,
    color: ACCENT,
  },
  itemsList: {
    gap: 12,
  },
  vaultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    gap: 14,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#E0E0E0',
  },
  itemPreview: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  itemArrow: {
    fontSize: 20,
    color: '#666',
  },
  comingSoon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    opacity: 0.6,
  },
  comingSoonIcon: {
    fontSize: 14,
  },
  comingSoonText: {
    fontSize: 13,
    color: '#888',
  },
});
