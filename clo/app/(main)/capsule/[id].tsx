import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCapsule } from '@/hooks/useCapsules';
import {
  CapsulePulse,
  CapsulePlan,
  CapsuleChat,
  CapsuleVault,
} from '@/components/relationships';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACCENT = '#e17055';

type CapsuleZone = 'pulse' | 'plan' | 'chat' | 'vault';

const ZONES: { key: CapsuleZone; label: string; icon: string }[] = [
  { key: 'pulse', label: 'Pulse', icon: '💓' },
  { key: 'plan', label: 'Plan', icon: '📋' },
  { key: 'chat', label: 'Chat', icon: '💬' },
  { key: 'vault', label: 'Vault', icon: '🔐' },
];

export default function CapsuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeZone, setActiveZone] = useState<CapsuleZone>('pulse');
  
  const { data: capsule, isLoading, error } = useCapsule(id || '');

  const handleZoneChange = (zone: CapsuleZone, index: number) => {
    Haptics.selectionAsync();
    setActiveZone(zone);
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const zoneIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (ZONES[zoneIndex] && ZONES[zoneIndex].key !== activeZone) {
      setActiveZone(ZONES[zoneIndex].key);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  if (error || !capsule) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Capsule not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const partnerName = capsule.partner?.display_name || capsule.invite_email || 'Partner';

  return (
    <>
      <Stack.Screen
        options={{
          title: partnerName,
          headerStyle: { backgroundColor: '#121212' },
          headerTintColor: '#E0E0E0',
          headerBackTitle: 'Back',
        }}
      />
      
      <View style={styles.container}>
        {/* Zone Tabs */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.zoneTabs}>
          {ZONES.map((zone, index) => (
            <TouchableOpacity
              key={zone.key}
              style={[
                styles.zoneTab,
                activeZone === zone.key && styles.zoneTabActive,
              ]}
              onPress={() => handleZoneChange(zone.key, index)}
            >
              <Text style={styles.zoneIcon}>{zone.icon}</Text>
              <Text
                style={[
                  styles.zoneLabel,
                  activeZone === zone.key && styles.zoneLabelActive,
                ]}
              >
                {zone.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Horizontal Pager */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.pager}
        >
          <View style={styles.page}>
            <CapsulePulse capsuleId={id || ''} capsule={capsule} />
          </View>
          <View style={styles.page}>
            <CapsulePlan capsuleId={id || ''} />
          </View>
          <View style={styles.page}>
            <CapsuleChat capsuleId={id || ''} />
          </View>
          <View style={styles.page}>
            <CapsuleVault capsuleId={id || ''} />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#E0E0E0',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: ACCENT,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  zoneTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 4,
  },
  zoneTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  zoneTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  zoneIcon: {
    fontSize: 14,
  },
  zoneLabel: {
    fontSize: 13,
    color: '#888',
  },
  zoneLabelActive: {
    color: ACCENT,
    fontWeight: '500',
  },
  pager: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
});
