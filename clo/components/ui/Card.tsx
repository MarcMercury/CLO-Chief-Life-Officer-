/**
 * Sanctuary Card Component
 * 
 * A styled View component for consistent card patterns
 * following the Sanctuary design language.
 */

import React from 'react';
import { View, ViewProps, StyleSheet, Pressable, PressableProps } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '@/constants/theme';

type CardVariant = 'solid' | 'glass' | 'outline';
type CardAccent = 'none' | 'self' | 'relationships' | 'home' | 'dashboard';

interface CardProps extends ViewProps {
  /** Card visual variant */
  variant?: CardVariant;
  /** Accent color for border/glow */
  accent?: CardAccent;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Border radius */
  rounded?: 'md' | 'lg' | 'xl' | '2xl';
  /** Children elements */
  children?: React.ReactNode;
}

interface PressableCardProps extends Omit<PressableProps, 'style'> {
  /** Card visual variant */
  variant?: CardVariant;
  /** Accent color for border/glow */
  accent?: CardAccent;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Border radius */
  rounded?: 'md' | 'lg' | 'xl' | '2xl';
  /** Custom styles */
  style?: ViewProps['style'];
  /** Children elements */
  children?: React.ReactNode;
}

const paddingMap = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
  xl: spacing.xl,
};

const radiusMap = {
  md: borderRadius.md,
  lg: borderRadius.lg,
  xl: borderRadius.xl,
  '2xl': borderRadius['2xl'],
};

const accentColorMap = {
  none: colors.border,
  self: colors.self,
  relationships: colors.relationships,
  home: colors.home,
  dashboard: colors.dashboard,
};

const accentBgMap = {
  none: 'transparent',
  self: colors.selfBg,
  relationships: colors.relationshipsBg,
  home: colors.homeBg,
  dashboard: colors.dashboardBg,
};

function getCardStyle(
  variant: CardVariant,
  accent: CardAccent,
  padding: keyof typeof paddingMap,
  rounded: keyof typeof radiusMap
) {
  const baseStyle = {
    padding: paddingMap[padding],
    borderRadius: radiusMap[rounded],
  };

  switch (variant) {
    case 'solid':
      return {
        ...baseStyle,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: accent === 'none' ? colors.border : accentColorMap[accent],
      };
    case 'glass':
      return {
        ...baseStyle,
        backgroundColor: accent === 'none' ? colors.glass : accentBgMap[accent],
        borderWidth: 1,
        borderColor: accent === 'none' ? colors.borderLight : `${accentColorMap[accent]}40`,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: accentColorMap[accent],
      };
  }
}

/**
 * Static Card component
 */
export function Card({
  variant = 'solid',
  accent = 'none',
  padding = 'lg',
  rounded = 'xl',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View style={[getCardStyle(variant, accent, padding, rounded), style]} {...props}>
      {children}
    </View>
  );
}

/**
 * Interactive Card component
 */
export function PressableCard({
  variant = 'solid',
  accent = 'none',
  padding = 'lg',
  rounded = 'xl',
  style,
  children,
  ...props
}: PressableCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        getCardStyle(variant, accent, padding, rounded),
        pressed && { opacity: 0.8 },
        style,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

/**
 * Tile Card for grid layouts (Self/Home views)
 */
interface TileCardProps extends PressableCardProps {
  /** Width/height ratio - default 1 (square) */
  aspectRatio?: number;
  /** Minimum height */
  minHeight?: number;
}

export function TileCard({
  aspectRatio = 1,
  minHeight,
  style,
  children,
  ...props
}: TileCardProps) {
  return (
    <PressableCard
      style={[
        {
          aspectRatio,
          minHeight,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </PressableCard>
  );
}

export default Card;
