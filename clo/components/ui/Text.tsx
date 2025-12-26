/**
 * Sanctuary Text Component
 * 
 * A styled Text component that uses the Outfit font family
 * with the Sanctuary design language.
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants/theme';

type FontWeight = 'light' | 'regular' | 'medium' | 'semibold';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'muted' | 'self' | 'relationships' | 'home' | 'success' | 'warning' | 'error';

interface TextProps extends RNTextProps {
  /** Font weight - defaults to 'regular' */
  weight?: FontWeight;
  /** Text size - defaults to 'base' */
  size?: TextSize;
  /** Text color - defaults to 'primary' */
  color?: TextColor;
  /** Enable wide letter spacing */
  wide?: boolean;
  /** Center align text */
  center?: boolean;
  /** Children elements */
  children?: React.ReactNode;
}

const fontFamilyMap: Record<FontWeight, string> = {
  light: typography.fontFamily.light,
  regular: typography.fontFamily.regular,
  medium: typography.fontFamily.medium,
  semibold: typography.fontFamily.semibold,
};

const fontSizeMap: Record<TextSize, number> = {
  xs: typography.fontSize.xs,
  sm: typography.fontSize.sm,
  base: typography.fontSize.base,
  lg: typography.fontSize.lg,
  xl: typography.fontSize.xl,
  '2xl': typography.fontSize['2xl'],
  '3xl': typography.fontSize['3xl'],
  '4xl': typography.fontSize['4xl'],
  '5xl': typography.fontSize['5xl'],
};

const colorMap: Record<TextColor, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  muted: colors.textMuted,
  self: colors.self,
  relationships: colors.relationships,
  home: colors.home,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
};

export function Text({
  weight = 'regular',
  size = 'base',
  color = 'primary',
  wide = false,
  center = false,
  style,
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        {
          fontFamily: fontFamilyMap[weight],
          fontSize: fontSizeMap[size],
          color: colorMap[color],
          letterSpacing: wide ? typography.letterSpacing.wide : typography.letterSpacing.normal,
          textAlign: center ? 'center' : 'left',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Preset components for common patterns
export function Heading({
  children,
  size = '3xl',
  ...props
}: Omit<TextProps, 'weight'>) {
  return (
    <Text weight="light" size={size} wide {...props}>
      {children}
    </Text>
  );
}

export function Subheading({
  children,
  size = 'lg',
  color = 'secondary',
  ...props
}: Omit<TextProps, 'weight'>) {
  return (
    <Text weight="regular" size={size} color={color} {...props}>
      {children}
    </Text>
  );
}

export function Label({
  children,
  size = 'sm',
  color = 'secondary',
  ...props
}: Omit<TextProps, 'weight'>) {
  return (
    <Text weight="medium" size={size} color={color} wide {...props}>
      {children}
    </Text>
  );
}

export function Caption({
  children,
  size = 'xs',
  color = 'tertiary',
  ...props
}: Omit<TextProps, 'weight'>) {
  return (
    <Text weight="regular" size={size} color={color} {...props}>
      {children}
    </Text>
  );
}

export default Text;
