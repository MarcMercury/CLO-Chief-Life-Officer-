/**
 * useIntegrations Hook
 * 
 * Manages integration state and provides methods for connecting/disconnecting services.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getIntegrations, 
  saveApiKeyIntegration, 
  disconnectIntegration,
  deleteIntegration,
} from '@/services/integrationService';
import { IntegrationProvider, StoredIntegration, INTEGRATION_CONFIGS } from '@/types/integrations';
import * as Haptics from 'expo-haptics';

export function useIntegrations() {
  const queryClient = useQueryClient();

  // Query for all integrations
  const { 
    data: integrations = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['integrations'],
    queryFn: getIntegrations,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for saving API key integrations
  const saveApiKeyMutation = useMutation({
    mutationFn: ({ provider, apiKey, config }: { 
      provider: IntegrationProvider; 
      apiKey: string; 
      config?: Record<string, any>;
    }) => saveApiKeyIntegration(provider, apiKey, config),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  // Mutation for disconnecting
  const disconnectMutation = useMutation({
    mutationFn: (provider: IntegrationProvider) => disconnectIntegration(provider),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  // Mutation for deleting
  const deleteMutation = useMutation({
    mutationFn: (provider: IntegrationProvider) => deleteIntegration(provider),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  // Helper to check if a provider is connected
  const isConnected = (provider: IntegrationProvider): boolean => {
    return integrations.some(i => i.provider === provider && i.is_active);
  };

  // Get integration by provider
  const getByProvider = (provider: IntegrationProvider): StoredIntegration | undefined => {
    return integrations.find(i => i.provider === provider);
  };

  // Get all available integrations with status
  const getIntegrationList = () => {
    return Object.values(INTEGRATION_CONFIGS).map(config => ({
      ...config,
      connected: isConnected(config.provider),
      integration: getByProvider(config.provider),
    }));
  };

  return {
    integrations,
    isLoading,
    error,
    refetch,
    
    // Actions
    saveApiKey: saveApiKeyMutation.mutateAsync,
    disconnect: disconnectMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    
    // Loading states
    isSaving: saveApiKeyMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Helpers
    isConnected,
    getByProvider,
    getIntegrationList,
  };
}
