/**
 * DashboardView - The "Daily Flow" Hub
 * 
 * A unified view that aggregates data from all three circles (Self, Relationships, Home)
 * into a single chronological agenda with the Pulse sync button at the top.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { usePulse, useLastSyncedText } from '@/hooks/usePulse';
import { getGreeting } from '@/services/pulseService';
import { Text, Heading } from '@/components/ui';
import { DailyAgenda, StickyNotes } from '@/components/dashboard';
import { colors, spacing, borderRadius } from '@/constants/theme';
import haptics from '@/lib/haptics';

type ViewMode = 'agenda' | 'notes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SYNC_BUTTON_SIZE = 60;

// ============================================
// MAIN COMPONENT
// ============================================

export default function DashboardView() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  
  const {
    isSyncing,
    bioMetrics,
    homeStatus,
    relationshipContext,
    lastSyncedAt,
    errors,
    triggerSync,
    sources,
    isUsingRealData,
  } = usePulse();
  
  const lastSyncedText = useLastSyncedText(lastSyncedAt);

  // Breathing animation for sync button
  const breatheScale = useSharedValue(1);
  const breatheOpacity = useSharedValue(0.3);
  const spinRotation = useSharedValue(0);

  useEffect(() => {
    if (isSyncing) {
      // Spinning animation when syncing
      spinRotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      // Gentle breathing when idle
      spinRotation.value = withTiming(0, { duration: 300 });
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      breatheOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isSyncing]);

  const syncButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breatheScale.value },
      { rotate: `${spinRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: breatheOpacity.value,
    transform: [{ scale: breatheScale.value * 1.3 }],
  }));

  const handleSync = () => {
    haptics.tapHeavy();
    triggerSync();
  };

  const handleOpenSettings = () => {
    haptics.selection();
    router.push('/settings');
  };

  const handleToggleView = (mode: ViewMode) => {
    haptics.selection();
    setViewMode(mode);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await triggerSync();
    setRefreshing(false);
  };

  const greeting = getGreeting();

  return (
    <View style={styles.container}>
      {/* Fixed Header with Sync Button */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={styles.headerRow}>
          {/* Left: Greeting */}
          <View style={styles.headerLeft}>
            <Heading size="2xl">{greeting}</Heading>
            {!isUsingRealData && (
              <TouchableOpacity onPress={handleOpenSettings} style={styles.mockDataPill}>
                <Text style={styles.mockDataText}>📊 Demo Mode</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Right: Sync Button */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleSync}
              disabled={isSyncing}
              activeOpacity={0.8}
              style={styles.syncTouchable}
            >
              {/* Glow effect */}
              <Animated.View style={[styles.syncGlow, glowStyle]} />
              
              {/* Main button */}
              <Animated.View style={[styles.syncButton, syncButtonStyle]}>
                <Text style={styles.syncIcon}>{isSyncing ? '↻' : '◉'}</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Sync Status */}
        <Text style={styles.syncStatus}>
          {isSyncing ? 'Syncing your world...' : `Updated ${lastSyncedText}`}
        </Text>
        
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'agenda' && styles.toggleButtonActive,
            ]}
            onPress={() => handleToggleView('agenda')}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === 'agenda' && styles.toggleTextActive,
              ]}
            >
              📅 Daily Flow
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'notes' && styles.toggleButtonActive,
            ]}
            onPress={() => handleToggleView('notes')}
          >
            <Text
              style={[
                styles.toggleText,
                viewMode === 'notes' && styles.toggleTextActive,
              ]}
            >
              📝 Sticky Notes
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Content based on view mode */}
      {viewMode === 'agenda' ? (
        <DailyAgenda />
      ) : (
        <StickyNotes title="Sticky Notes" />
      )}
    </View>
  );
}

// ============================================
// MAIN STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: spacing.lg,
  },
  
  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  syncTouchable: {
    position: 'relative',
    width: SYNC_BUTTON_SIZE,
    height: SYNC_BUTTON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncGlow: {
    position: 'absolute',
    width: SYNC_BUTTON_SIZE * 1.3,
    height: SYNC_BUTTON_SIZE * 1.3,
    borderRadius: SYNC_BUTTON_SIZE,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  syncButton: {
    width: SYNC_BUTTON_SIZE,
    height: SYNC_BUTTON_SIZE,
    borderRadius: SYNC_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncIcon: {
    fontSize: 24,
    color: colors.self,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  settingsIcon: {
    fontSize: 20,
  },
  mockDataPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  mockDataText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  syncStatus: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  
  // View Toggle
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginTop: spacing.md,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.surfaceElevated,
  },
  toggleText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  
  // Widgets
  widgetGrid: {
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  widget: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selfWidget: {
    borderLeftWidth: 4,
    borderLeftColor: colors.self,
  },
  homeWidget: {
    borderLeftWidth: 4,
    borderLeftColor: colors.home,
  },
  relWidget: {
    borderLeftWidth: 4,
    borderLeftColor: colors.relationships,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  widgetEmoji: {
    fontSize: 20,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  recoveryRing: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recoveryProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryScore: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.textPrimary,
  },
  recoveryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  widgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '300',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  homeMain: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '200',
    color: colors.textPrimary,
  },
  condition: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  securityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  securityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  securityText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  relItem: {
    marginBottom: spacing.sm,
  },
  relWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  relLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  relValue: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  hintContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: 160, // Extra space for orbital control
  },
  hint: {
    fontSize: 14,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
});
