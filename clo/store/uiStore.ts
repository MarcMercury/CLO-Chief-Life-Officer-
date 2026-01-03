import { create } from 'zustand';

export type ActiveCircle = 'SELF' | 'RELATIONSHIPS' | 'HOME' | 'DASHBOARD';

// Circle accent colors (consistent across themes)
const circleAccents: Record<ActiveCircle, string> = {
  SELF: '#6366f1',
  RELATIONSHIPS: '#e17055',
  HOME: '#84a98c',
  DASHBOARD: '#8b5cf6',
};

interface UIState {
  activeCircle: ActiveCircle;
  circleAccent: string;
  setActiveCircle: (circle: ActiveCircle) => void;
  resetToDashboard: () => void;
  getCircleAccent: (circle: ActiveCircle) => string;
}

export const useUIStore = create<UIState>((set, get) => ({
  activeCircle: 'DASHBOARD',
  circleAccent: circleAccents.DASHBOARD,
  setActiveCircle: (circle) =>
    set({
      activeCircle: circle,
      circleAccent: circleAccents[circle],
    }),
  resetToDashboard: () =>
    set({
      activeCircle: 'DASHBOARD',
      circleAccent: circleAccents.DASHBOARD,
    }),
  getCircleAccent: (circle) => circleAccents[circle],
}));
