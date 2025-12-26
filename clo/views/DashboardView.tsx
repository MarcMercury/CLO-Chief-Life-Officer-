import React, { useEffect } from 'react';
import {
  View,
  Text as RNText,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { usePulse, useLastSyncedText } from '@/hooks/usePulse';
import {
  getGreeting,
  getMoodEmoji,
  getWeatherEmoji,
  formatTime,
} from '@/services/pulseService';
import { Text, Heading, Subheading, Label, Caption } from '@/components/ui';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import haptics from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SYNC_BUTTON_SIZE = 100;

export default function DashboardView() {
  const router = useRouter();
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
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      breatheOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
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
    router.push('/settings/integrations');
  };

  const greeting = getGreeting();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Heading size="4xl">{greeting}</Heading>
            <Subheading style={styles.subtitle}>Your Life at a Glance</Subheading>
          </View>
          <TouchableOpacity 
            onPress={handleOpenSettings} 
            style={styles.settingsButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        
        {/* Data Source Indicator */}
        {!isUsingRealData && (
          <TouchableOpacity onPress={handleOpenSettings} style={styles.mockDataBanner}>
            <Text style={styles.mockDataText}>
              📊 Using demo data • Tap to connect real services
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Sync Button */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.syncContainer}>
        <TouchableOpacity
          onPress={handleSync}
          disabled={isSyncing}
          activeOpacity={0.8}
        >
          {/* Glow effect */}
          <Animated.View style={[styles.syncGlow, glowStyle]} />
          
          {/* Main button */}
          <Animated.View style={[styles.syncButton, syncButtonStyle]}>
            <View style={styles.syncInner}>
              <Text style={styles.syncIcon}>{isSyncing ? '↻' : '◉'}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
        
        <Text style={styles.syncStatus}>
          {isSyncing ? 'Syncing your world...' : `Updated ${lastSyncedText}`}
        </Text>
      </Animated.View>

      {/* Widget Grid */}
      <View style={styles.widgetGrid}>
        {/* Self / Bio Widget */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <TouchableOpacity style={[styles.widget, styles.selfWidget]} activeOpacity={0.7}>
            {bioMetrics ? (
              <>
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetEmoji}>{getMoodEmoji(bioMetrics.mood)}</Text>
                  <Text style={[styles.widgetTitle, { color: colors.self }]}>Self</Text>
                </View>
                <View style={styles.recoveryRing}>
                  <View style={[
                    styles.recoveryProgress,
                    { 
                      borderColor: colors.self,
                      borderWidth: 3,
                    }
                  ]}>
                    <Text style={styles.recoveryScore}>{bioMetrics.recoveryScore}</Text>
                    <Text style={styles.recoveryLabel}>Recovery</Text>
                  </View>
                </View>
                <View style={styles.widgetStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{bioMetrics.sleepHours}h</Text>
                    <Text style={styles.statLabel}>Sleep</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{bioMetrics.heartRateResting}</Text>
                    <Text style={styles.statLabel}>BPM</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{bioMetrics.stepsToday}</Text>
                    <Text style={styles.statLabel}>Steps</Text>
                  </View>
                </View>
              </>
            ) : (
              <WidgetSkeleton accentColor={colors.self} error={errors.bioMetrics} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Home Widget */}
        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <TouchableOpacity style={[styles.widget, styles.homeWidget]} activeOpacity={0.7}>
            {homeStatus ? (
              <>
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetEmoji}>{getWeatherEmoji(homeStatus.condition)}</Text>
                  <Text style={[styles.widgetTitle, { color: colors.home }]}>Home</Text>
                </View>
                <View style={styles.homeMain}>
                  <Text style={styles.temperature}>{homeStatus.temperature}°</Text>
                  <Text style={styles.condition}>{homeStatus.condition}</Text>
                </View>
                <View style={styles.securityStatus}>
                  <View style={[
                    styles.securityDot,
                    { backgroundColor: homeStatus.securityStatus === 'secure' ? '#22c55e' : '#ef4444' }
                  ]} />
                  <Text style={styles.securityText}>
                    {homeStatus.securityStatus === 'secure' ? 'Home is Secure' : 'Alert Active'}
                  </Text>
                </View>
              </>
            ) : (
              <WidgetSkeleton accentColor={colors.home} error={errors.homeStatus} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Relationships Widget */}
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <TouchableOpacity style={[styles.widget, styles.relWidget]} activeOpacity={0.7}>
            {relationshipContext ? (
              <>
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetEmoji}>❤️</Text>
                  <Text style={[styles.widgetTitle, { color: colors.relationships }]}>Relationships</Text>
                </View>
                
                {relationshipContext.nextMeeting ? (
                  <View style={styles.relItem}>
                    <Text style={styles.relLabel}>Next Meeting</Text>
                    <Text style={styles.relValue}>
                      {relationshipContext.nextMeeting.name} at {formatTime(relationshipContext.nextMeeting.time)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.relItem}>
                    <Text style={styles.relLabel}>Calendar</Text>
                    <Text style={styles.relValue}>No meetings today</Text>
                  </View>
                )}

                {relationshipContext.overdueContact && (
                  <View style={[styles.relItem, styles.relWarning]}>
                    <Text style={styles.relLabel}>Overdue Contact</Text>
                    <Text style={styles.relValue}>
                      {relationshipContext.overdueContact.name} ({relationshipContext.overdueContact.daysSinceContact}d)
                    </Text>
                  </View>
                )}

                {relationshipContext.upcomingAnniversary && (
                  <View style={styles.relItem}>
                    <Text style={styles.relLabel}>Coming Up</Text>
                    <Text style={styles.relValue}>
                      🎂 {relationshipContext.upcomingAnniversary.name}'s anniversary in {relationshipContext.upcomingAnniversary.daysUntil}d
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <WidgetSkeleton accentColor={colors.relationships} error={errors.relationshipContext} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Bottom hint */}
      <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.hintContainer}>
        <Text style={styles.hint}>Swipe the orb to explore circles</Text>
      </Animated.View>
    </ScrollView>
  );
}

// ============================================
// SKELETON LOADER COMPONENT
// ============================================

interface WidgetSkeletonProps {
  accentColor: string;
  error: string | null;
}

function WidgetSkeleton({ accentColor, error }: WidgetSkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.6]),
  }));

  if (error) {
    return (
      <View style={skeletonStyles.errorContainer}>
        <Text style={skeletonStyles.errorIcon}>⚠️</Text>
        <Text style={skeletonStyles.errorText}>Connection Lost</Text>
        <Text style={skeletonStyles.errorHint}>Pull to retry</Text>
      </View>
    );
  }

  return (
    <View style={skeletonStyles.container}>
      <Animated.View style={[skeletonStyles.line, skeletonStyles.lineShort, shimmerStyle]} />
      <Animated.View style={[skeletonStyles.circle, shimmerStyle]} />
      <Animated.View style={[skeletonStyles.line, shimmerStyle]} />
      <Animated.View style={[skeletonStyles.line, skeletonStyles.lineMedium, shimmerStyle]} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  line: {
    height: 12,
    width: '80%',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  lineShort: {
    width: '40%',
    alignSelf: 'flex-start',
  },
  lineMedium: {
    width: '60%',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  errorHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

// ============================================
// MAIN STYLES
// ============================================

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settingsButton: {
    padding: 8,
    marginTop: 4,
  },
  settingsIcon: {
    fontSize: 24,
  },
  mockDataBanner: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  mockDataText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  syncContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  syncGlow: {
    position: 'absolute',
    width: SYNC_BUTTON_SIZE * 1.5,
    height: SYNC_BUTTON_SIZE * 1.5,
    borderRadius: SYNC_BUTTON_SIZE,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    top: -SYNC_BUTTON_SIZE * 0.25,
    left: -SYNC_BUTTON_SIZE * 0.25,
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
  syncInner: {
    width: SYNC_BUTTON_SIZE - 20,
    height: SYNC_BUTTON_SIZE - 20,
    borderRadius: (SYNC_BUTTON_SIZE - 20) / 2,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncIcon: {
    fontSize: 32,
    color: colors.self,
  },
  syncStatus: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
  },
  widgetGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  widget: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  selfWidget: {
    borderLeftWidth: 3,
    borderLeftColor: colors.self,
  },
  homeWidget: {
    borderLeftWidth: 3,
    borderLeftColor: colors.home,
  },
  relWidget: {
    borderLeftWidth: 3,
    borderLeftColor: colors.relationships,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '200',
    color: colors.textPrimary,
  },
  condition: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  securityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    marginBottom: 12,
  },
  relWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  relLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  relValue: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  hintContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    letterSpacing: 0.5,
  },
});
