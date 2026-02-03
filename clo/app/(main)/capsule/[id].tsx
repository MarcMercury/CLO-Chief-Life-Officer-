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
import { useTheme } from '@/providers/ThemeProvider';

export default function CapsuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const ACCENT = colors.relationships;
  
  const { data: capsule, isLoading, error } = useCapsule(id || '');

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading capsule...</Text>
      </View>
    );
  }

  if (error || !capsule) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorIcon}>💫</Text>
        <Text style={[styles.errorText, { color: colors.textPrimary }]}>Capsule not found</Text>
        <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
          This capsule may have been deleted or you don't have access
        </Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: ACCENT }]} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.background }]}>Go Back</Text>
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
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
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
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
