/**
 * SelfView - Tile-Based Personal Management
 * 
 * Clean tile navigation that expands to full screen when selected.
 * Tiles: Daily 3, Mental, Physical, Emotional, Practical, Professional
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInRight,
  SlideOutRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../providers/ThemeProvider';
import { spacing, borderRadius } from '../constants/theme';

// Import all Self modules
import {
  DailyIntentions,
  MentalModule,
  PhysicalModule,
  EmotionalModule,
  PracticalModule,
  ProfessionalModule,
} from '../components/self';

// Import custom icons
import {
  Daily3Icon,
  MentalIcon,
  PhysicalIcon,
  EmotionalIcon,
  PracticalIcon,
  ProfessionalIcon,
} from '../components/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_GAP = 12;
const TILE_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - TILE_GAP) / 2;

// ============================================
// TYPES & CONFIGURATION
// ============================================

type TabType = 'daily3' | 'mental' | 'physical' | 'emotional' | 'practical' | 'professional' | null;

interface TileConfig {
  key: Exclude<TabType, null>;
  label: string;
  IconComponent: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
}

const TILES: TileConfig[] = [
  { key: 'daily3', label: 'Daily 3', IconComponent: Daily3Icon, color: '#10B981' },
  { key: 'mental', label: 'Mental', IconComponent: MentalIcon, color: '#8B5CF6' },
  { key: 'physical', label: 'Physical', IconComponent: PhysicalIcon, color: '#EF4444' },
  { key: 'emotional', label: 'Emotional', IconComponent: EmotionalIcon, color: '#EC4899' },
  { key: 'practical', label: 'Practical', IconComponent: PracticalIcon, color: '#F59E0B' },
  { key: 'professional', label: 'Professional', IconComponent: ProfessionalIcon, color: '#3B82F6' },
];

// ============================================
// TILE COMPONENT
// ============================================

interface TileProps {
  config: TileConfig;
  index: number;
  onPress: () => void;
  colors: any;
}

function Tile({ config, index, onPress, colors }: TileProps) {
  const { IconComponent } = config;
  
  return (
    <Animated.View entering={FadeInUp.delay(50 + index * 50).duration(300)}>
      <TouchableOpacity
        style={[
          styles.tile,
          { backgroundColor: `${config.color}15` },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.tileIconContainer}>
          <IconComponent size={44} color={config.color} />
        </View>
        <Text style={[styles.tileLabel, { color: config.color }]}>{config.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SelfView() {
  const { colors } = useTheme();
  const ACCENT = colors.self;
  const [activeTab, setActiveTab] = useState<TabType>(null);

  const handleBack = useCallback(() => {
    Haptics.selectionAsync();
    setActiveTab(null);
  }, []);

  // ============================================
  // RENDER FUNCTIONS FOR EACH TAB
  // ============================================

  const renderDaily3 = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>🎯 Daily 3</Text>
        <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>Set your intentions for today</Text>
      </View>
      <DailyIntentions />
    </Animated.View>
  );

  const renderMental = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>🧠 Mental</Text>
        <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>Read • Learn • Focus</Text>
      </View>
      <MentalModule />
    </Animated.View>
  );

  const renderPhysical = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>💪 Physical</Text>
        <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>Health Dashboard • Goals</Text>
      </View>
      <PhysicalModule />
    </Animated.View>
  );

  const renderEmotional = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>💜 Emotional</Text>
        <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>Vibe • Burn • Gratitude</Text>
      </View>
      <EmotionalModule />
    </Animated.View>
  );

  const renderPractical = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>🛠️ Practical</Text>
        <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>Tasks • Lists • Spending</Text>
      </View>
      <PracticalModule />
    </Animated.View>
  );

  const renderProfessional = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Text style={[styles.tabTitle, { color: colors.textPrimary }]}>💼 Professional</Text>
        <Text style={[styles.tabSubtitle, { color: colors.textSecondary }]}>Goals • Network • Ideas</Text>
      </View>
      <ProfessionalModule />
    </Animated.View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'daily3':
        return renderDaily3();
      case 'mental':
        return renderMental();
      case 'physical':
        return renderPhysical();
      case 'emotional':
        return renderEmotional();
      case 'practical':
        return renderPractical();
      case 'professional':
        return renderProfessional();
      default:
        return null;
    }
  };

  // ============================================
  // TILE GRID VIEW (HOME STATE)
  // ============================================

  const renderTileGrid = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(300)}>
        {/* Tile Grid */}
        <View style={styles.tileGrid}>
          {TILES.map((tile, index) => (
            <Tile
              key={tile.key}
              config={tile}
              index={index}
              onPress={() => setActiveTab(tile.key)}
              colors={colors}
            />
          ))}
        </View>
      </Animated.View>
      
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  // ============================================
  // FULL SCREEN TAB VIEW
  // ============================================

  const renderFullScreenTab = () => (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutRight.duration(300)}
      style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}
    >
      {/* Back Header */}
      <View style={[styles.backHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backIcon, { color: ACCENT }]}>←</Text>
          <Text style={[styles.backText, { color: ACCENT }]}>Self</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderActiveTab()}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </Animated.View>
  );

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - only show when no tab active */}
      {activeTab === null && (
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>🧘</Text>
            <View>
              <Text style={[styles.title, { color: ACCENT }]}>Self</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your personal space</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Content */}
      {activeTab === null ? renderTileGrid() : renderFullScreenTab()}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 120,
  },
  
  // Tile Grid
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  tileIconContainer: {
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Full Screen Tab
  fullScreenContainer: {
    flex: 1,
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabScrollView: {
    flex: 1,
  },
  tabScrollContent: {
    padding: spacing.lg,
  },
  tabContent: {
    flex: 1,
  },
  tabHeader: {
    marginBottom: spacing.lg,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  tabSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  
  // Bottom spacer
  bottomSpacer: {
    height: 100,
  },
});
