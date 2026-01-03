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

// Dark Theme - Pure dark mode
const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#252525',
  
  textPrimary: '#E0E0E0',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',
  textMuted: '#4A4A4A',
  
  border: 'rgba(255, 255, 255, 0.05)',
  borderLight: 'rgba(255, 255, 255, 0.08)',
  borderFocus: 'rgba(255, 255, 255, 0.15)',
  
  self: '#6366f1',
  relationships: '#e17055',
  home: '#84a98c',
  dashboard: '#8b5cf6',
  
  selfBg: 'rgba(99, 102, 241, 0.15)',
  relationshipsBg: 'rgba(225, 112, 85, 0.15)',
  homeBg: 'rgba(132, 169, 140, 0.15)',
  dashboardBg: 'rgba(139, 92, 246, 0.15)',
  
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',
  
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  glass: 'rgba(255, 255, 255, 0.03)',
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

// CLO Theme - Warm, soft colors from app icon (soft purples, warm creams, gentle feel)
const cloColors: ThemeColors = {
  // Warm dark background with slight purple tint (like the app icon background)
  background: '#1A1520',  // Deep warm purple-black
  surface: '#252030',     // Slightly elevated warm purple
  surfaceElevated: '#2D2838', // More elevated
  
  // Warm cream/off-white text (inspired by icon highlights)
  textPrimary: '#F5F0E8',   // Warm cream
  textSecondary: '#BDB5A8', // Muted warm
  textTertiary: '#7A7268',  // Soft brown-gray
  textMuted: '#524D46',     // Deep muted
  
  // Soft borders with warmth
  border: 'rgba(245, 240, 232, 0.06)',
  borderLight: 'rgba(245, 240, 232, 0.10)',
  borderFocus: 'rgba(245, 240, 232, 0.18)',
  
  // Circle accents - warmer, softer versions
  self: '#A78BFA',          // Soft lavender (app icon purple)
  relationships: '#F0A090', // Soft coral/peach
  home: '#9DC4A0',          // Soft sage
  dashboard: '#C4A0E8',     // Soft violet
  
  // Circle backgrounds - even softer
  selfBg: 'rgba(167, 139, 250, 0.12)',
  relationshipsBg: 'rgba(240, 160, 144, 0.12)',
  homeBg: 'rgba(157, 196, 160, 0.12)',
  dashboardBg: 'rgba(196, 160, 232, 0.12)',
  
  // Softer status colors
  success: '#6EE7A0',
  warning: '#FCD34D',
  error: '#F87171',
  info: '#93C5FD',
  
  // Warm overlays
  overlay: 'rgba(26, 21, 32, 0.7)',
  overlayLight: 'rgba(26, 21, 32, 0.4)',
  glass: 'rgba(245, 240, 232, 0.03)',
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
