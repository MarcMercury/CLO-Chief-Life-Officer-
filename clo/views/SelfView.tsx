/**
 * SelfView - Tile-Based Personal Space
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
import { colors, spacing, borderRadius } from '../constants/theme';
import { useDailyIntentions } from '@/hooks/useSelf';

// Import all Self modules
import {
  DailyIntentions,
  MentalModule,
  PhysicalModule,
  EmotionalModule,
  PracticalModule,
  ProfessionalModule,
} from '../components/self';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_GAP = 12;
const TILE_SIZE = (SCREEN_WIDTH - spacing.lg * 2 - TILE_GAP) / 2;

// ============================================
// TYPES
// ============================================

type ModuleKey = 'daily3' | 'mental' | 'physical' | 'emotional' | 'practical' | 'professional' | null;

interface TileConfig {
  key: Exclude<ModuleKey, null>;
  label: string;
  icon: string;
  color: string;
  description: string;
}

// ============================================
// TILE CONFIGURATION
// ============================================

const TILES: TileConfig[] = [
  { 
    key: 'daily3', 
    label: 'Daily 3', 
    icon: '🎯', 
    color: '#10B981',
    description: 'Your intentions'
  },
  { 
    key: 'mental', 
    label: 'Mental', 
    icon: '🧠', 
    color: '#8B5CF6',
    description: 'Read • Learn • Focus'
  },
  { 
    key: 'physical', 
    label: 'Physical', 
    icon: '💪', 
    color: '#EF4444',
    description: 'Health & Goals'
  },
  { 
    key: 'emotional', 
    label: 'Emotional', 
    icon: '💜', 
    color: '#EC4899',
    description: 'Vibe • Burn • Gratitude'
  },
  { 
    key: 'practical', 
    label: 'Practical', 
    icon: '🛠️', 
    color: '#F59E0B',
    description: 'Tasks • Lists'
  },
  { 
    key: 'professional', 
    label: 'Professional', 
    icon: '💼', 
    color: '#3B82F6',
    description: 'Goals • Network'
  },
];

// ============================================
// TILE COMPONENT
// ============================================

interface TileProps {
  config: TileConfig;
  index: number;
  onPress: () => void;
  checkmarks?: number; // For Daily 3: 0-3 checkmarks
}

function Tile({ config, index, onPress, checkmarks }: TileProps) {
  return (
    <Animated.View 
      entering={FadeInUp.delay(50 + index * 50).duration(300)}
    >
      <TouchableOpacity
        style={[styles.tile, { backgroundColor: `${config.color}15` }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.tileIcon}>{config.icon}</Text>
        <Text style={[styles.tileLabel, { color: config.color }]}>{config.label}</Text>
        <Text style={styles.tileDescription}>{config.description}</Text>
        
        {/* Checkmarks for Daily 3 */}
        {checkmarks !== undefined && (
          <View style={styles.checkmarksRow}>
            {[0, 1, 2].map(i => (
              <Text 
                key={i} 
                style={[
                  styles.checkmark,
                  { opacity: i < checkmarks ? 1 : 0.3 }
                ]}
              >
                {i < checkmarks ? '✓' : '○'}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// FULL SCREEN MODULE WRAPPER
// ============================================

interface ModuleScreenProps {
  config: TileConfig;
  onBack: () => void;
  children: React.ReactNode;
}

function ModuleScreen({ config, onBack, children }: ModuleScreenProps) {
  return (
    <Animated.View 
      entering={SlideInRight.duration(250)}
      exiting={SlideOutRight.duration(200)}
      style={styles.moduleScreen}
    >
      {/* Header */}
      <View style={[styles.moduleHeader, { borderBottomColor: `${config.color}30` }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Haptics.selectionAsync();
            onBack();
          }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.moduleTitleContainer}>
          <Text style={styles.moduleHeaderIcon}>{config.icon}</Text>
          <Text style={[styles.moduleTitle, { color: config.color }]}>{config.label}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.moduleContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.moduleContentContainer}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SelfView() {
  const [activeModule, setActiveModule] = useState<ModuleKey>(null);
  
  // Get daily intentions to show checkmarks on tile
  const { data: intentions = [] } = useDailyIntentions();
  const completedCount = intentions.filter(i => i.is_completed).length;
  
  const handleOpenModule = useCallback((key: ModuleKey) => {
    setActiveModule(key);
  }, []);

  const handleBack = useCallback(() => {
    setActiveModule(null);
  }, []);
  
  const renderModuleContent = (key: ModuleKey) => {
    switch (key) {
      case 'daily3':
        return <DailyIntentions />;
      case 'mental':
        return <MentalModule />;
      case 'physical':
        return <PhysicalModule />;
      case 'emotional':
        return <EmotionalModule />;
      case 'practical':
        return <PracticalModule />;
      case 'professional':
        return <ProfessionalModule />;
      default:
        return null;
    }
  };

  // If a module is active, show full screen
  if (activeModule) {
    const config = TILES.find(t => t.key === activeModule)!;
    return (
      <View style={styles.container}>
        <ModuleScreen config={config} onBack={handleBack}>
          {renderModuleContent(activeModule)}
        </ModuleScreen>
      </View>
    );
  }

  // Default: Show tile grid
  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🧘</Text>
          <View>
            <Text style={styles.title}>Self</Text>
            <Text style={styles.subtitle}>Your personal space</Text>
          </View>
        </View>
      </Animated.View>

      {/* Tile Grid */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.tilesContainer}
      >
        <View style={styles.tilesGrid}>
          {TILES.map((tile, index) => (
            <Tile
              key={tile.key}
              config={tile}
              index={index}
              onPress={() => handleOpenModule(tile.key)}
              checkmarks={tile.key === 'daily3' ? completedCount : undefined}
            />
          ))}
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Scroll & Grid
  scrollView: {
    flex: 1,
  },
  tilesContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TILE_GAP,
  },

  // Tile
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tileIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tileDescription: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  checkmarksRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
  },
  checkmark: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },

  // Module Screen (Full Screen View)
  moduleScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: spacing.sm,
    minWidth: 70,
  },
  backText: {
    color: colors.self,
    fontSize: 16,
    fontWeight: '500',
  },
  moduleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moduleHeaderIcon: {
    fontSize: 24,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    minWidth: 70,
  },
  moduleContent: {
    flex: 1,
  },
  moduleContentContainer: {
    padding: spacing.lg,
    paddingBottom: 160,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 160,
  },
});
