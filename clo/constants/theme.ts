/**
 * CLO Theme - The "Sanctuary" Design Language
 * 
 * A calming, minimal dark theme that feels like a private retreat.
 * Soft, warm colors inspired by Kindle for comfortable reading.
 * No harsh contrasts, organic animations, whisper-quiet interactions.
 */

// ============================================
// COLOR PALETTE
// ============================================

export const colors = {
  // Base colors - Soft, warm dark sanctuary (Kindle-inspired)
  background: '#1C1915',      // Warm charcoal with brown undertone
  surface: '#252219',         // Soft brown-gray surface
  surfaceElevated: '#2D2A24', // Elevated warm surface
  
  // Text hierarchy - Cream-tinted for comfortable reading
  textPrimary: '#E8E4DC',     // Warm cream (like paper)
  textSecondary: '#B8B2A6',   // Soft taupe
  textTertiary: '#7A756B',    // Muted warm gray
  textMuted: '#5A564F',       // Deeper muted tone
  
  // Borders & dividers - Subtle and warm
  border: 'rgba(232, 228, 220, 0.06)',
  borderLight: 'rgba(232, 228, 220, 0.10)',
  borderFocus: 'rgba(232, 228, 220, 0.18)',
  
  // Circle accent colors - Softer, muted versions
  self: '#8B8FD9',            // Soft periwinkle
  relationships: '#D49A8A',   // Soft terracotta
  home: '#8FB896',            // Soft sage green
  dashboard: '#A68BD9',       // Soft lavender
  
  // Circle accent backgrounds (gentler glow)
  selfBg: 'rgba(139, 143, 217, 0.12)',
  relationshipsBg: 'rgba(212, 154, 138, 0.12)',
  homeBg: 'rgba(143, 184, 150, 0.12)',
  dashboardBg: 'rgba(166, 139, 217, 0.12)',
  
  // Status colors - Softer, less harsh
  success: '#6FC98B',
  warning: '#D9B860',
  error: '#D98B8B',
  info: '#7EB3D9',
  
  // Health indicators - Muted versions
  thriving: '#6FC98B',
  healthy: '#8FC96F',
  needsAttention: '#D9B860',
  atRisk: '#D98B8B',
  
  // Overlays - Warmer
  overlay: 'rgba(20, 18, 15, 0.65)',
  overlayLight: 'rgba(20, 18, 15, 0.40)',
  glass: 'rgba(232, 228, 220, 0.03)',
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
  
  // Font sizes (increased ~15% for better readability)
  fontSize: {
    xs: 13,
    sm: 15,
    base: 17,
    lg: 19,
    xl: 23,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
    '5xl': 56,
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
