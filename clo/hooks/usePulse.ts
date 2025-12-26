import { useState, useCallback, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import {
  syncEnhancedData,
  EnhancedDashboardData,
} from '@/services/enhancedPulseService';
import {
  BioMetrics,
  HomeStatus,
  RelationshipContext,
} from '@/services/pulseService';

export interface PulseState {
  isSyncing: boolean;
  data: EnhancedDashboardData | null;
  errors: {
    bioMetrics: string | null;
    homeStatus: string | null;
    relationshipContext: string | null;
  };
  lastSyncedAt: string | null;
  sources: {
    bioMetrics: 'oura' | 'apple_health' | 'mock' | null;
    homeStatus: 'openweathermap' | 'mock' | null;
    relationshipContext: 'google_calendar' | 'mock' | null;
  };
}

export interface UsePulseReturn extends PulseState {
  triggerSync: () => Promise<void>;
  bioMetrics: BioMetrics | null;
  homeStatus: HomeStatus | null;
  relationshipContext: RelationshipContext | null;
  isUsingRealData: boolean;
}

export function usePulse(): UsePulseReturn {
  const [state, setState] = useState<PulseState>({
    isSyncing: false,
    data: null,
    errors: {
      bioMetrics: null,
      homeStatus: null,
      relationshipContext: null,
    },
    lastSyncedAt: null,
    sources: {
      bioMetrics: null,
      homeStatus: null,
      relationshipContext: null,
    },
  });

  const triggerSync = useCallback(async () => {
    // Prevent double-sync
    if (state.isSyncing) return;

    // Heavy haptic feedback on start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    setState(prev => ({
      ...prev,
      isSyncing: true,
      errors: {
        bioMetrics: null,
        homeStatus: null,
        relationshipContext: null,
      },
    }));

    try {
      const data = await syncEnhancedData();
      
      // Success haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setState(prev => ({
        ...prev,
        isSyncing: false,
        data,
        lastSyncedAt: data.syncedAt,
        sources: data.sources,
        errors: {
          bioMetrics: data.bioMetrics ? null : 'Failed to sync biometrics',
          homeStatus: data.homeStatus ? null : 'Failed to sync home status',
          relationshipContext: data.relationshipContext ? null : 'Failed to sync relationships',
        },
      }));
    } catch (error) {
      // Error haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      setState(prev => ({
        ...prev,
        isSyncing: false,
        errors: {
          bioMetrics: 'Connection error',
          homeStatus: 'Connection error',
          relationshipContext: 'Connection error',
        },
      }));
    }
  }, [state.isSyncing]);

  // Check if any real APIs are connected
  const isUsingRealData = 
    state.sources.bioMetrics !== 'mock' && state.sources.bioMetrics !== null ||
    state.sources.homeStatus !== 'mock' && state.sources.homeStatus !== null ||
    state.sources.relationshipContext !== 'mock' && state.sources.relationshipContext !== null;

  // Auto-sync on mount
  useEffect(() => {
    triggerSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    triggerSync,
    bioMetrics: state.data?.bioMetrics ?? null,
    homeStatus: state.data?.homeStatus ?? null,
    relationshipContext: state.data?.relationshipContext ?? null,
    isUsingRealData,
  };
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to get formatted "last synced" text
 */
export function useLastSyncedText(lastSyncedAt: string | null): string {
  const [text, setText] = useState('Never synced');

  useEffect(() => {
    if (!lastSyncedAt) {
      setText('Never synced');
      return;
    }

    const updateText = () => {
      const now = new Date();
      const synced = new Date(lastSyncedAt);
      const diffMs = now.getTime() - synced.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) {
        setText('Just now');
      } else if (diffMins < 60) {
        setText(`${diffMins}m ago`);
      } else {
        const diffHours = Math.floor(diffMins / 60);
        setText(`${diffHours}h ago`);
      }
    };

    updateText();
    const interval = setInterval(updateText, 60000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  return text;
}
