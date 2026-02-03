/**
 * ThemeProvider - Manages app-wide theming
 * 
 * Supports three themes:
 * - Dark: Pure dark mode
 * - Light: Clean light mode  
 * - CLO: Signature warm/soft colors from the app icon
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// THEME TYPES
// ============================================

export type ThemeMode = 'dark' | 'light' | 'clo';

export interface ThemeColors {
  // Base
  background: string;
  surface: string;
  surfaceElevated: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  
  // Borders
  border: string;
  borderLight: string;
  borderFocus: string;
  
  // Circle accents (same across themes)
  self: string;
  relationships: string;
  home: string;
  dashboard: string;
  
  // Circle backgrounds
  selfBg: string;
  relationshipsBg: string;
  homeBg: string;
  dashboardBg: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Overlays
  overlay: string;
  overlayLight: string;
  glass: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
}

// ============================================
// THEME DEFINITIONS
// ============================================

// Dark Theme - Soft, Kindle-like reading experience
// Warm sepia-tinted dark mode that's easy on the eyes
const darkColors: ThemeColors = {
  // Warm, soft backgrounds (sepia-tinted for reading comfort)
  background: '#1C1915',      // Warm charcoal with brown undertone
  surface: '#252219',         // Soft brown-gray surface
  surfaceElevated: '#2D2A24', // Elevated warm surface
  
  // Cream-tinted text for less eye strain
  textPrimary: '#E8E4DC',     // Warm cream (like paper)
  textSecondary: '#B8B2A6',   // Soft taupe
  textTertiary: '#7A756B',    // Muted warm gray
  textMuted: '#5A564F',       // Deeper muted tone
  
  // Subtle warm borders
  border: 'rgba(232, 228, 220, 0.06)',
  borderLight: 'rgba(232, 228, 220, 0.10)',
  borderFocus: 'rgba(232, 228, 220, 0.18)',
  
  // Circle accents - softer, more muted versions
  self: '#8B8FD9',            // Soft periwinkle
  relationships: '#D49A8A',   // Soft terracotta
  home: '#8FB896',            // Soft sage
  dashboard: '#A68BD9',       // Soft lavender
  
  selfBg: 'rgba(139, 143, 217, 0.12)',
  relationshipsBg: 'rgba(212, 154, 138, 0.12)',
  homeBg: 'rgba(143, 184, 150, 0.12)',
  dashboardBg: 'rgba(166, 139, 217, 0.12)',
  
  // Softer status colors
  success: '#6FC98B',
  warning: '#D9B860',
  error: '#D98B8B',
  info: '#7EB3D9',
  
  overlay: 'rgba(20, 18, 15, 0.65)',
  overlayLight: 'rgba(20, 18, 15, 0.40)',
  glass: 'rgba(232, 228, 220, 0.03)',
};

// Light Theme - Clean and bright
const lightColors: ThemeColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textMuted: '#CCCCCC',
  
  border: 'rgba(0, 0, 0, 0.08)',
  borderLight: 'rgba(0, 0, 0, 0.05)',
  borderFocus: 'rgba(0, 0, 0, 0.15)',
  
  self: '#5B5FC7',
  relationships: '#D4614A',
  home: '#6B9E76',
  dashboard: '#7C4DFF',
  
  selfBg: 'rgba(91, 95, 199, 0.12)',
  relationshipsBg: 'rgba(212, 97, 74, 0.12)',
  homeBg: 'rgba(107, 158, 118, 0.12)',
  dashboardBg: 'rgba(124, 77, 255, 0.12)',
  
  success: '#16A34A',
  warning: '#CA8A04',
  error: '#DC2626',
  info: '#2563EB',
  
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  glass: 'rgba(0, 0, 0, 0.02)',
};

// CLO Theme - Warm, soft colors inspired by app icon (lavender, cream, blush tones)
// Designed for comfortable extended reading like a Kindle
const cloColors: ThemeColors = {
  // Soft, warm backgrounds with gentle lavender undertones
  background: '#1A1620',      // Soft plum-charcoal
  surface: '#242030',         // Dusty mauve surface
  surfaceElevated: '#2E293C', // Lifted lavender-gray
  
  // Warm cream text for reading comfort
  textPrimary: '#F5F0E8',     // Warm cream (paper-like)
  textSecondary: '#C9C2B8',   // Soft warm gray
  textTertiary: '#8A847A',    // Muted taupe
  textMuted: '#605B54',       // Soft muted brown
  
  // Soft blush-tinted borders
  border: 'rgba(245, 240, 232, 0.07)',
  borderLight: 'rgba(245, 240, 232, 0.11)',
  borderFocus: 'rgba(245, 240, 232, 0.18)',
  
  // Circle accents - pastel and gentle
  self: '#A8A0E8',            // Soft lilac
  relationships: '#E8B8A8',   // Blush peach
  home: '#A0D0A8',            // Soft mint sage
  dashboard: '#C8B0E0',       // Soft wisteria
  
  // Circle backgrounds - gentle glow
  selfBg: 'rgba(168, 160, 232, 0.12)',
  relationshipsBg: 'rgba(232, 184, 168, 0.12)',
  homeBg: 'rgba(160, 208, 168, 0.12)',
  dashboardBg: 'rgba(200, 176, 224, 0.12)',
  
  // Softer, pastel status colors
  success: '#88D8A0',
  warning: '#E8D088',
  error: '#E8A0A0',
  info: '#A0C8E8',
  
  // Warm blush overlays
  overlay: 'rgba(26, 22, 32, 0.70)',
  overlayLight: 'rgba(26, 22, 32, 0.45)',
  glass: 'rgba(245, 240, 232, 0.04)',
};

// ============================================
// THEME OBJECTS
// ============================================

export const themes: Record<ThemeMode, Theme> = {
  dark: {
    mode: 'dark',
    colors: darkColors,
    isDark: true,
  },
  light: {
    mode: 'light',
    colors: lightColors,
    isDark: false,
  },
  clo: {
    mode: 'clo',
    colors: cloColors,
    isDark: true,
  },
};

// ============================================
// CONTEXT
// ============================================

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.clo,
  themeMode: 'clo',
  setThemeMode: () => {},
  colors: cloColors,
});

// ============================================
// PROVIDER
// ============================================

const THEME_STORAGE_KEY = '@clo_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('clo');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);
  
  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'clo')) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.warn('Failed to load theme:', error);
    } finally {
      setIsLoaded(true);
    }
  };
  
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  };
  
  const theme = themes[themeMode];
  
  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }
  
  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors: theme.colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
