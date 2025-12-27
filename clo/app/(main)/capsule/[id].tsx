import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useCapsule } from '@/hooks/useCapsules';
import { useAuth } from '@/providers/AuthProvider';
import CapsuleView from '@/components/relationships/CapsuleView';

const ACCENT = '#e17055';

export default function CapsuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const { data: capsule, isLoading, error } = useCapsule(id || '');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>Loading capsule...</Text>
      </View>
    );
  }

  if (error || !capsule) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>💫</Text>
        <Text style={styles.errorText}>Capsule not found</Text>
        <Text style={styles.errorSubtext}>
          This capsule may have been deleted or you don't have access
        </Text>
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
      
      {/* Full CapsuleView with all 6 zones: Pulse, Plan, Decide, Resolve, Vault, Chat */}
      <CapsuleView
        capsuleId={id || ''}
        userId={user?.id || ''}
        capsule={{
          id: capsule.id,
          name: partnerName,
          invite_code: capsule.invite_code || undefined,
          partner_id: capsule.partner?.id,
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
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
});
