/**
 * DailyAgenda Component
 * 
 * The unified "Daily Flow" view that aggregates all three circles
 * into a single chronological agenda with swipe gestures.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  interpolateColor,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, Heading, Subheading, Label, Caption } from '@/components/ui';
import { colors, spacing, borderRadius } from '@/constants/theme';
import {
  useDailyFlow,
  useCompleteFlowItem,
  useSnoozeFlowItem,
  useBacklogItems,
  useAddToToday,
  DailyFlowItem,
  DailyFlowData,
} from '@/hooks/useDailyFlow';
import haptics from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

// ============================================
// CIRCLE COLORS
// ============================================

const circleColors = {
  SELF: colors.self,
  RELATIONSHIPS: colors.relationships,
  HOME: colors.home,
};

const circleLabels = {
  SELF: 'Self',
  RELATIONSHIPS: 'Relationships',
  HOME: 'Home',
};

// ============================================
// SWIPEABLE ITEM COMPONENT
// ============================================

interface SwipeableItemProps {
  item: DailyFlowItem;
  onComplete: () => void;
  onSnooze: () => void;
  onPress: () => void;
}

function SwipeableItem({ item, onComplete, onSnooze, onPress }: SwipeableItemProps) {
  const translateX = useSharedValue(0);
  const rowHeight = useSharedValue(64);
  const opacity = useSharedValue(1);
  const [isCompleted, setIsCompleted] = useState(item.status === 'COMPLETED');
  
  const handleComplete = useCallback(() => {
    setIsCompleted(true);
    haptics.success();
    onComplete();
  }, [onComplete]);
  
  const handleSnooze = useCallback(() => {
    haptics.selection();
    onSnooze();
  }, [onSnooze]);
  
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      translateX.value = Math.max(-SCREEN_WIDTH * 0.4, Math.min(SCREEN_WIDTH * 0.4, event.translationX));
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right -> Complete
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        rowHeight.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(handleComplete)();
        });
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left -> Snooze
        translateX.value = withSequence(
          withTiming(-SCREEN_WIDTH, { duration: 200 }),
          withTiming(0, { duration: 0 })
        );
        runOnJS(handleSnooze)();
      } else {
        translateX.value = withSpring(0);
      }
    });
  
  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
    height: rowHeight.value,
  }));
  
  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 20 ? 1 : 0,
    transform: [{ scale: translateX.value > SWIPE_THRESHOLD ? 1.1 : 1 }],
  }));
  
  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? 1 : 0,
    transform: [{ scale: translateX.value < -SWIPE_THRESHOLD ? 1.1 : 1 }],
  }));
  
  const circleColor = circleColors[item.circle];
  
  if (isCompleted && item.status !== 'COMPLETED') {
    return null; // Hide after animation completes
  }
  
  return (
    <View style={styles.swipeContainer}>
      {/* Left action (Complete - Green) */}
      <Animated.View style={[styles.swipeAction, styles.swipeActionLeft, leftActionStyle]}>
        <Text style={styles.swipeActionIcon}>✓</Text>
        <Text style={styles.swipeActionText}>Done</Text>
      </Animated.View>
      
      {/* Right action (Snooze - Yellow) */}
      <Animated.View style={[styles.swipeAction, styles.swipeActionRight, rightActionStyle]}>
        <Text style={styles.swipeActionIcon}>⏰</Text>
        <Text style={styles.swipeActionText}>Tomorrow</Text>
      </Animated.View>
      
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedRowStyle}>
          <TouchableOpacity
            style={[styles.itemRow, { borderLeftColor: circleColor }]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text 
                  style={[
                    styles.itemTitle,
                    isCompleted && styles.itemTitleCompleted
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
              {item.description && (
                <Text style={styles.itemDescription} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
            </View>
            
            <View style={styles.itemMeta}>
              <View style={[styles.circleBadge, { backgroundColor: circleColor + '20' }]}>
                <Text style={[styles.circleBadgeText, { color: circleColor }]}>
                  {circleLabels[item.circle]}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// ============================================
// TIMELINE ITEM COMPONENT
// ============================================

interface TimelineItemProps {
  item: DailyFlowItem;
  onPress: () => void;
}

function TimelineItem({ item, onPress }: TimelineItemProps) {
  const circleColor = circleColors[item.circle];
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  return (
    <Animated.View entering={FadeInRight.delay(100)}>
      <TouchableOpacity
        style={[styles.timelineItem, { borderLeftColor: circleColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>
            {item.startTime ? formatTime(item.startTime) : '--:--'}
          </Text>
          {item.endTime && (
            <Text style={styles.timeEndText}>
              {formatTime(item.endTime)}
            </Text>
          )}
        </View>
        
        <View style={styles.timelineContent}>
          <View style={styles.timelineHeader}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={styles.timelineTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          {item.description && (
            <Text style={styles.timelineDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          {item.relatedPersonName && (
            <Text style={styles.personTag}>
              👤 {item.relatedPersonName}
            </Text>
          )}
        </View>
        
        <View style={[styles.circleIndicator, { backgroundColor: circleColor }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// BACKLOG MODAL
// ============================================

interface BacklogModalProps {
  visible: boolean;
  onClose: () => void;
}

function BacklogModal({ visible, onClose }: BacklogModalProps) {
  const { data: backlog, isLoading } = useBacklogItems();
  const addToToday = useAddToToday();
  
  const handleAddToToday = async (itemId: string) => {
    // Extract the actual ID (remove 'backlog-' prefix)
    const realId = itemId.replace('backlog-', '');
    await addToToday.mutateAsync(realId);
    haptics.success();
  };
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      entering={FadeIn.duration(200)}
      style={styles.modalOverlay}
    >
      <TouchableOpacity style={styles.modalBackdrop} onPress={onClose} />
      <Animated.View 
        entering={SlideInRight.duration(300)}
        style={styles.backlogModal}
      >
        <View style={styles.backlogHeader}>
          <Heading size="xl">📋 Backlog</Heading>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.backlogSubtitle}>
          Tap an item to add it to today
        </Text>
        
        <ScrollView style={styles.backlogList}>
          {isLoading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : backlog && backlog.length > 0 ? (
            backlog.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.backlogItem, { borderLeftColor: circleColors[item.circle] }]}
                onPress={() => handleAddToToday(item.id)}
              >
                <Text style={styles.backlogItemIcon}>{item.icon}</Text>
                <View style={styles.backlogItemContent}>
                  <Text style={styles.backlogItemTitle}>{item.title}</Text>
                  <Text style={styles.backlogItemCircle}>
                    {circleLabels[item.circle]}
                  </Text>
                </View>
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyText}>Backlog is clear!</Text>
              <Text style={styles.emptySubtext}>
                All tasks are scheduled
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DailyAgenda() {
  const router = useRouter();
  const { data, isLoading, error } = useDailyFlow();
  const completeItem = useCompleteFlowItem();
  const snoozeItem = useSnoozeFlowItem();
  const [showBacklog, setShowBacklog] = useState(false);
  
  const handleComplete = useCallback((item: DailyFlowItem) => {
    completeItem.mutate(item);
  }, [completeItem]);
  
  const handleSnooze = useCallback((item: DailyFlowItem) => {
    snoozeItem.mutate({ item, days: 1 });
  }, [snoozeItem]);
  
  const handleItemPress = useCallback((item: DailyFlowItem) => {
    haptics.selection();
    
    // Deep link based on source
    if (item.relatedCapsuleId) {
      router.push(`/capsule/${item.relatedCapsuleId}`);
    } else if (item.circle === 'HOME') {
      // Navigate to home section
      // router.push('/home');
    } else if (item.circle === 'SELF') {
      // Navigate to self section
      // router.push('/self');
    }
  }, [router]);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your day...</Text>
      </View>
    );
  }
  
  if (error || !data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Couldn't load your agenda</Text>
        <Text style={styles.errorSubtext}>Pull down to retry</Text>
      </View>
    );
  }
  
  const { 
    dayName, 
    formattedDate, 
    weather, 
    timedItems, 
    anytimeItems,
    totalEvents,
    remainingTasks,
    freeTimeHours,
    selfCount,
    relationshipsCount,
    homeCount,
  } = data;
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Heading size="3xl">{dayName}</Heading>
              <Subheading style={styles.dateText}>{formattedDate}</Subheading>
            </View>
            
            {weather && (
              <View style={styles.weatherWidget}>
                <Text style={styles.weatherIcon}>{weather.icon}</Text>
                <Text style={styles.weatherTemp}>{weather.temp}°</Text>
              </View>
            )}
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {totalEvents > 0 ? `${totalEvents} events` : 'No events'} • {remainingTasks} tasks remaining
            </Text>
            {freeTimeHours > 0 && (
              <Text style={styles.freeTimeText}>
                ~{freeTimeHours}h free
              </Text>
            )}
          </View>
          
          {/* Circle breakdown dots */}
          <View style={styles.circleBreakdown}>
            {selfCount > 0 && (
              <View style={styles.breakdownDot}>
                <View style={[styles.dot, { backgroundColor: colors.self }]} />
                <Text style={styles.dotCount}>{selfCount}</Text>
              </View>
            )}
            {relationshipsCount > 0 && (
              <View style={styles.breakdownDot}>
                <View style={[styles.dot, { backgroundColor: colors.relationships }]} />
                <Text style={styles.dotCount}>{relationshipsCount}</Text>
              </View>
            )}
            {homeCount > 0 && (
              <View style={styles.breakdownDot}>
                <View style={[styles.dot, { backgroundColor: colors.home }]} />
                <Text style={styles.dotCount}>{homeCount}</Text>
              </View>
            )}
          </View>
        </Animated.View>
        
        {/* Timeline Section */}
        {timedItems.length > 0 && (
          <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📅</Text>
              <Text style={styles.sectionTitle}>Timeline</Text>
            </View>
            
            <View style={styles.timelineContainer}>
              {/* Vertical line */}
              <View style={styles.timelineLine} />
              
              {timedItems.map((item) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  onPress={() => handleItemPress(item)}
                />
              ))}
            </View>
          </Animated.View>
        )}
        
        {/* Anytime Section */}
        {anytimeItems.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>☑️</Text>
              <Text style={styles.sectionTitle}>Anytime</Text>
              <Text style={styles.sectionHint}>Swipe to complete or snooze</Text>
            </View>
            
            <View style={styles.anytimeList}>
              {anytimeItems.map((item) => (
                <SwipeableItem
                  key={item.id}
                  item={item}
                  onComplete={() => handleComplete(item)}
                  onSnooze={() => handleSnooze(item)}
                  onPress={() => handleItemPress(item)}
                />
              ))}
            </View>
          </Animated.View>
        )}
        
        {/* Empty State */}
        {timedItems.length === 0 && anytimeItems.length === 0 && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.emptyDayContainer}>
            <Text style={styles.emptyDayIcon}>🌟</Text>
            <Text style={styles.emptyDayTitle}>Clear Day Ahead</Text>
            <Text style={styles.emptyDayText}>
              No tasks or events scheduled. Enjoy or plan something!
            </Text>
          </Animated.View>
        )}
        
        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Backlog Modal */}
      <BacklogModal
        visible={showBacklog}
        onClose={() => setShowBacklog(false)}
      />
    </GestureHandlerRootView>
  );
}

// ============================================
// STYLES
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  
  // Header
  header: {
    marginBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  weatherWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  weatherIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  weatherTemp: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  freeTimeText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  circleBreakdown: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  breakdownDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  
  // Sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionHint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 'auto',
  },
  anytimeList: {
    gap: spacing.xs,
  },
  
  // Timeline
  timelineContainer: {
    position: 'relative',
    paddingLeft: spacing.sm,
  },
  timelineLine: {
    position: 'absolute',
    left: 75,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border,
  },
  timelineItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  timeColumn: {
    width: 70,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timeEndText: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.xs,
  },
  timelineDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: 24,
  },
  personTag: {
    fontSize: 12,
    color: colors.relationships,
    marginTop: spacing.xs,
    marginLeft: 24,
  },
  circleIndicator: {
    width: 4,
    borderTopRightRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  
  // Swipeable Items
  swipeContainer: {
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  swipeAction: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  swipeActionLeft: {
    left: 0,
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.lg,
  },
  swipeActionRight: {
    right: 0,
    backgroundColor: colors.warning + '20',
    borderRadius: borderRadius.lg,
  },
  swipeActionIcon: {
    fontSize: 20,
  },
  swipeActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    height: 64,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    flex: 1,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginLeft: 28,
  },
  itemMeta: {
    marginLeft: spacing.sm,
  },
  circleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  circleBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  
  // Empty states
  emptyDayContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'] * 2,
  },
  emptyDayIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyDayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDayText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // Floating button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dashboard,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    shadowColor: colors.dashboard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingButtonIcon: {
    fontSize: 16,
  },
  floatingButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Backlog Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backlogModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  backlogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textSecondary,
    padding: spacing.sm,
  },
  backlogSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  backlogList: {
    flex: 1,
  },
  backlogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  backlogItemIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  backlogItemContent: {
    flex: 1,
  },
  backlogItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  backlogItemCircle: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  addIcon: {
    fontSize: 24,
    color: colors.success,
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  
  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  bottomPadding: {
    height: 100,
  },
});
