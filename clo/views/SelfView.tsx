/**
 * SelfView - Rebuilt Personal Space
 * 
 * Structure:
 * 1. Daily 3 (Intention Engine) - Always at top
 * 2. 5 Category Modules in Accordion:
 *    - Mental (Read List, Learn List, Focus Timer)
 *    - Physical (Health Dashboard, Health Goals)
 *    - Emotional (Vibe Check, Burn Box, Gratitude)
 *    - Practical (Daily Tasks, List Maker, Financial Pulse)
 *    - Professional (Career Goals, Networking, Idea Vault)
 * 
 * NOTE: Scratchpad has been DELETED and replaced with 
 * specific lists inside the categories.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius } from '../constants/theme';

// Import all Self modules
import {
  DailyIntentions,
  MentalModule,
  PhysicalModule,
  EmotionalModule,
  PracticalModule,
  ProfessionalModule,
} from '../components/self';

const ACCENT = colors.self;

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
// ACCORDION ITEM COMPONENT
// ============================================

interface AccordionItemProps {
  config: ModuleConfig;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  index: number;
}

function AccordionItem({ config, isExpanded, onToggle, children, index }: AccordionItemProps) {
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 200 });
  }, [isExpanded]);
  
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  return (
    <Animated.View 
      entering={FadeInUp.delay(100 + index * 50).duration(300)}
      style={styles.accordionItem}
    >
      {/* Header */}
      <TouchableOpacity
        style={[styles.accordionHeader, isExpanded && styles.accordionHeaderExpanded]}
        onPress={() => {
          Haptics.selectionAsync();
          onToggle();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.accordionLeft}>
          <View style={[styles.moduleIcon, { backgroundColor: `${config.color}20` }]}>
            <Text style={styles.moduleIconText}>{config.icon}</Text>
          </View>
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleLabel}>{config.label}</Text>
            <Text style={styles.moduleDesc}>{config.description}</Text>
          </View>
        </View>
        
        <Animated.View style={chevronStyle}>
          <Text style={styles.chevron}>▼</Text>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Content */}
      {isExpanded && (
        <Animated.View 
          entering={FadeInDown.duration(200)}
          style={styles.accordionContent}
        >
          {children}
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SelfView() {
  const [expandedModule, setExpandedModule] = useState<ModuleKey | null>(null);
  
  const handleToggleModule = useCallback((key: ModuleKey) => {
    setExpandedModule(prev => prev === key ? null : key);
  }, []);
  
  const renderModuleContent = (key: ModuleKey) => {
    switch (key) {
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
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🧘</Text>
          <View>
            <Text style={styles.title}>Self</Text>
            <Text style={styles.subtitle}>Your personal space</Text>
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
              <Text style={styles.sectionTitle}>Daily 3</Text>
            </View>
            <Text style={styles.sectionHint}>Set your intentions for today</Text>
          </View>
          
          <DailyIntentions />
        </Animated.View>

        {/* ============================================ */}
        {/* SECTION 2: CATEGORY MODULES (ACCORDION) */}
        {/* ============================================ */}
        <View style={styles.modulesSection}>
          <Animated.View entering={FadeInUp.delay(200)} style={styles.modulesSectionHeader}>
            <Text style={styles.modulesSectionTitle}>Your Modules</Text>
          </Animated.View>
          
          {MODULES.map((module, index) => (
            <AccordionItem
              key={module.key}
              config={module}
              isExpanded={expandedModule === module.key}
              onToggle={() => handleToggleModule(module.key)}
              index={index}
            >
              {renderModuleContent(module.key)}
            </AccordionItem>
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
    color: colors.textPrimary,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 4,
    marginLeft: 28,
  },
  
  // Modules section
  modulesSection: {
    marginTop: spacing.md,
  },
  modulesSectionHeader: {
    marginBottom: spacing.md,
  },
  modulesSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  
  // Accordion styles
  accordionItem: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  accordionHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  moduleIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleIconText: {
    fontSize: 20,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  moduleDesc: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  accordionContent: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  
  // Bottom spacer - extra space for orbital control
  bottomSpacer: {
    height: 160,
  },
});
