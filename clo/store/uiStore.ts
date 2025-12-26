import { create } from 'zustand';

export type ActiveCircle = 'SELF' | 'RELATIONSHIPS' | 'HOME' | 'DASHBOARD';

interface ThemeColors {
  background: string;
  accent: string;
}

interface UIState {
  activeCircle: ActiveCircle;
  themeColors: ThemeColors;
  setActiveCircle: (circle: ActiveCircle) => void;
  resetToDashboard: () => void;
}

const getThemeColors = (circle: ActiveCircle): ThemeColors => {
  switch (circle) {
    case 'SELF':
      return {
        background: '#0f0f23', // Very dark indigo
        accent: '#6366f1',
      };
    case 'RELATIONSHIPS':
      return {
        background: '#1a1310', // Very dark terracotta
        accent: '#e17055',
      };
    case 'HOME':
      return {
        background: '#0f1410', // Very dark sage
        accent: '#84a98c',
      };
    case 'DASHBOARD':
    default:
      return {
        background: '#121212', // Charcoal
        accent: '#2d3436',
      };
  }
};

export const useUIStore = create<UIState>((set) => ({
  activeCircle: 'DASHBOARD',
  themeColors: getThemeColors('DASHBOARD'),
  setActiveCircle: (circle) =>
    set({
      activeCircle: circle,
      themeColors: getThemeColors(circle),
    }),
  resetToDashboard: () =>
    set({
      activeCircle: 'DASHBOARD',
      themeColors: getThemeColors('DASHBOARD'),
    }),
}));
