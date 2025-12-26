/**
 * CLO Theme - The "Sanctuary" Design Language
 * 
 * A calming, minimal dark theme that feels like a private retreat.
 * No harsh contrasts, organic animations, whisper-quiet interactions.
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Base colors (Dark sanctuary)
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#252525',
  
  // Text hierarchy
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',
  textMuted: '#4A4A4A',
  
  // Borders & dividers
  border: 'rgba(255, 255, 255, 0.05)',
  borderLight: 'rgba(255, 255, 255, 0.08)',
  borderFocus: 'rgba(255, 255, 255, 0.15)',
  
  // Circle accent colors
  self: '#6366f1',        // Indigo - introspection, calm
  relationships: '#e17055', // Terracotta - warmth, connection
  home: '#84a98c',         // Sage green - stability, sanctuary
  dashboard: '#8b5cf6',    // Purple - overview, synthesis
  
  // Circle accent backgrounds (20% opacity)
  selfBg: 'rgba(99, 102, 241, 0.15)',
  relationshipsBg: 'rgba(225, 112, 85, 0.15)',
  homeBg: 'rgba(132, 169, 140, 0.15)',
  dashboardBg: 'rgba(139, 92, 246, 0.15)',
  
  // Status colors
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Health indicators
  thriving: '#22c55e',
  healthy: '#84cc16',
  needsAttention: '#eab308',
  atRisk: '#ef4444',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  glass: 'rgba(255, 255, 255, 0.03)',
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  // Font families (Outfit)
  fontFamily: {
    light: 'Outfit_300Light',
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semibold: 'Outfit_600SemiBold',
  },
  
  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing (wide for sanctuary feel)
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

// ============================================
// SPACING
// ============================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// ============================================
// SHADOWS (subtle for dark mode)
// ============================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// ============================================
// ANIMATION TIMING
// ============================================

export const animation = {
  // Durations
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 800,
    breathe: 2000,
  },
  
  // Delays for staggered animations
  stagger: {
    fast: 30,
    normal: 50,
    slow: 100,
  },
} as const;

// ============================================
// HAPTIC PATTERNS
// ============================================

export const hapticPatterns = {
  // Standard interactions
  selection: 'selection',       // Tab switch, toggle
  light: 'light',               // Tap, minor action
  medium: 'medium',             // Pull to refresh
  heavy: 'heavy',               // Sync start
  
  // Notifications
  success: 'success',           // Task complete, save
  warning: 'warning',           // Alert, attention needed
  error: 'error',               // Delete, error
} as const;

// ============================================
// Z-INDEX LAYERS
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
  overlay: 60,
  lockscreen: 100,
} as const;

// ============================================
// COMPONENT PRESETS
// ============================================

export const componentPresets = {
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  
  // Glass morphism card
  glassCard: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
  },
  
  // Input field
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  
  // Button base
  button: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Primary button
  buttonPrimary: {
    backgroundColor: colors.self,
  },
  
  // Ghost button
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get circle accent color
 */
export function getCircleColor(circle: 'SELF' | 'RELATIONSHIPS' | 'HOME' | 'DASHBOARD'): string {
  switch (circle) {
    case 'SELF': return colors.self;
    case 'RELATIONSHIPS': return colors.relationships;
    case 'HOME': return colors.home;
    case 'DASHBOARD': return colors.dashboard;
  }
}

/**
 * Get circle background color
 */
export function getCircleBg(circle: 'SELF' | 'RELATIONSHIPS' | 'HOME' | 'DASHBOARD'): string {
  switch (circle) {
    case 'SELF': return colors.selfBg;
    case 'RELATIONSHIPS': return colors.relationshipsBg;
    case 'HOME': return colors.homeBg;
    case 'DASHBOARD': return colors.dashboardBg;
  }
}

/**
 * Get health status color
 */
export function getHealthColor(status: 'thriving' | 'healthy' | 'needs_attention' | 'at_risk'): string {
  switch (status) {
    case 'thriving': return colors.thriving;
    case 'healthy': return colors.healthy;
    case 'needs_attention': return colors.needsAttention;
    case 'at_risk': return colors.atRisk;
  }
}

// Default export for convenience
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  hapticPatterns,
  zIndex,
  componentPresets,
  getCircleColor,
  getCircleBg,
  getHealthColor,
};

export default theme;
