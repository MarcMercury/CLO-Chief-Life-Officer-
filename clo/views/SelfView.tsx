/**
 * SelfView - Personal Space with 5 Category Tiles
 * 
 * Structure:
 * 1. Daily 3 (Intention Engine) - Always at top
 * 2. 5 Category Tiles that navigate to full-page views:
 *    - Mental (Read List, Learn List, Focus Timer)
 *    - Physical (Health Dashboard, Health Goals)
 *    - Emotional (Vibe Check, Burn Box, Gratitude)
 *    - Practical (Daily Tasks, List Maker, Financial Pulse)
 *    - Professional (Career Goals, Networking, Idea Vault)
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
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

// ============================================
// TYPES
// ============================================

type ModuleKey = 'mental' | 'physical' | 'emotional' | 'practical' | 'professional';

interface ModuleConfig {
  key: ModuleKey;
  label: string;
  icon: string;
  color: string;
  description: string;
}

// ============================================
// CONSTANTS
// ============================================

const MODULES: ModuleConfig[] = [
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
    description: 'Health Dashboard • Goals'
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
    description: 'Tasks • Lists • Spending'
  },
  { 
    key: 'professional', 
    label: 'Professional', 
    icon: '💼', 
    color: '#3B82F6',
    description: 'Goals • Network • Ideas'
  },
];

// ============================================
// MODULE TILE COMPONENT
// ============================================

interface ModuleTileProps {
  config: ModuleConfig;
  onPress: () => void;
  index: number;
  colors: any;
}

function ModuleTile({ config, onPress, index, colors }: ModuleTileProps) {
  return (
    <Animated.View entering={FadeInUp.delay(100 + index * 50).duration(300)}>
      <TouchableOpacity
        style={[
          styles.tile,
          { 
            backgroundColor: colors.surface,
            borderLeftColor: config.color,
          }
        ]}
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.tileLeft}>
          <View style={[styles.tileIcon, { backgroundColor: `${config.color}20` }]}>
            <Text style={styles.tileIconText}>{config.icon}</Text>
          </View>
          <View style={styles.tileInfo}>
            <Text style={[styles.tileLabel, { color: colors.textPrimary }]}>{config.label}</Text>
            <Text style={[styles.tileDesc, { color: colors.textTertiary }]}>{config.description}</Text>
          </View>
        </View>
        
        <Text style={[styles.tileChevron, { color: colors.textTertiary }]}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================
// FULL PAGE MODULE VIEW
// ============================================

interface ModulePageProps {
  config: ModuleConfig;
  onClose: () => void;
  colors: any;
}

function ModulePage({ config, onClose, colors }: ModulePageProps) {
  const renderModuleContent = () => {
    switch (config.key) {
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

  return (
    <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={[styles.modalHeader, { borderBottomColor: colors.border }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.selectionAsync();
            onClose();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
          <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.modalTitleRow}>
          <Text style={styles.modalIcon}>{config.icon}</Text>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{config.label}</Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </Animated.View>
      
      {/* Content */}
      <ScrollView 
        style={styles.modalContent}
        contentContainerStyle={styles.modalContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).duration(300)}>
          {renderModuleContent()}
        </Animated.View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SelfView() {
  const { colors } = useTheme();
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);
  
  const handleOpenModule = useCallback((module: ModuleConfig) => {
    setSelectedModule(module);
  }, []);
  
  const handleCloseModule = useCallback(() => {
    setSelectedModule(null);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🧘</Text>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Self</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your personal space</Text>
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ============================================ */}
        {/* SECTION 1: DAILY 3 (INTENTION ENGINE) */}
        {/* ============================================ */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Daily 3</Text>
            </View>
            <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>Set your intentions for today</Text>
          </View>
          
          <DailyIntentions />
        </Animated.View>

        {/* ============================================ */}
        {/* SECTION 2: CATEGORY TILES */}
        {/* ============================================ */}
        <View style={styles.tilesSection}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.tilesSectionHeader}>
            <Text style={[styles.tilesSectionTitle, { color: colors.textSecondary }]}>Your Modules</Text>
          </Animated.View>
          
          {MODULES.map((module, index) => (
            <ModuleTile
              key={module.key}
              config={module}
              onPress={() => handleOpenModule(module)}
              index={index}
              colors={colors}
            />
          ))}
        </View>

        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* Full Page Module Modal */}
      <Modal
        visible={selectedModule !== null}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleCloseModule}
      >
        {selectedModule && (
          <ModulePage
            config={selectedModule}
            onClose={handleCloseModule}
            colors={colors}
          />
        )}
      </Modal>
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
    paddingBottom: spacing.xl,
  },
  
  // Section styles
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHint: {
    fontSize: 13,
    marginTop: 4,
    marginLeft: 28,
  },
  
  // Tiles section
  tilesSection: {
    marginTop: spacing.md,
  },
  tilesSectionHeader: {
    marginBottom: spacing.md,
  },
  tilesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Tile styles
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
  },
  tileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileIconText: {
    fontSize: 20,
  },
  tileInfo: {
    flex: 1,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  tileDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  tileChevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalIcon: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 60, // Balance the back button width
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: spacing.lg,
  },
  
  // Bottom spacer
  bottomSpacer: {
    height: 100,
  },
});
