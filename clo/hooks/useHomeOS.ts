/**
 * useHomeOS Hooks
 * 
 * React Query hooks for the CHO (Chief Household Officer) Dashboard.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { usePropertyStore } from '@/store/propertyStore';
import {
  getInventoryItems,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getVendors,
  searchVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getServiceLogs,
  createServiceLog,
  getMaintenanceSchedules,
  createMaintenanceSchedule,
  completeMaintenanceTask,
  getHomeAlerts,
  getHomeStats,
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  setPrimaryProperty,
  getWikiEntries,
  createWikiEntry,
  updateWikiEntry,
  deleteWikiEntry,
  Property,
  CreatePropertyInput,
  WikiEntryRow,
  CreateWikiEntryInput,
} from '@/services/homeosService';
import {
  CreateInventoryItemInput,
  CreateSubscriptionInput,
  CreateVendorInput,
  CreateServiceLogInput,
  CreateMaintenanceScheduleInput,
} from '@/types/homeos';

// ============================================
// INVENTORY HOOKS
// ============================================

export function useInventory() {
  const { selectedPropertyId } = usePropertyStore();
  
  return useQuery({
    queryKey: ['inventory', selectedPropertyId],
    queryFn: () => getInventoryItems(selectedPropertyId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: () => getInventoryItem(id),
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInventoryItemInput) => createInventoryItem(input),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateInventoryItemInput> }) =>
      updateInventoryItem(id, updates),
    onSuccess: (_, variables) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.id] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// ============================================
// SUBSCRIPTION HOOKS
// ============================================

export function useSubscriptions() {
  const { selectedPropertyId } = usePropertyStore();
  
  return useQuery({
    queryKey: ['subscriptions', selectedPropertyId],
    queryFn: () => getSubscriptions(selectedPropertyId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubscriptionInput) => createSubscription(input),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
      queryClient.invalidateQueries({ queryKey: ['homeAlerts'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateSubscriptionInput & { status?: string; importance?: string }> }) =>
      updateSubscription(id, updates),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelSubscription(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// ============================================
// VENDOR HOOKS
// ============================================

export function useVendors() {
  const { selectedPropertyId } = usePropertyStore();
  
  return useQuery({
    queryKey: ['vendors', selectedPropertyId],
    queryFn: () => getVendors(selectedPropertyId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchVendors(searchTerm: string) {
  return useQuery({
    queryKey: ['vendors', 'search', searchTerm],
    queryFn: () => searchVendors(searchTerm),
    enabled: searchTerm.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVendorInput) => createVendor(input),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreateVendorInput> }) =>
      updateVendor(id, updates),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// ============================================
// SERVICE LOG HOOKS
// ============================================

export function useServiceLogs(vendorId?: string) {
  return useQuery({
    queryKey: ['serviceLogs', vendorId],
    queryFn: () => getServiceLogs(vendorId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateServiceLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateServiceLogInput) => createServiceLog(input),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['serviceLogs'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// ============================================
// MAINTENANCE HOOKS
// ============================================

export function useMaintenanceSchedules() {
  return useQuery({
    queryKey: ['maintenance'],
    queryFn: getMaintenanceSchedules,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateMaintenanceSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMaintenanceScheduleInput) => createMaintenanceSchedule(input),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useCompleteMaintenanceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeMaintenanceTask(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['homeStats'] });
      queryClient.invalidateQueries({ queryKey: ['homeAlerts'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// ============================================
// ALERTS & STATS HOOKS
// ============================================

export function useHomeAlerts() {
  return useQuery({
    queryKey: ['homeAlerts'],
    queryFn: getHomeAlerts,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useHomeStats() {
  return useQuery({
    queryKey: ['homeStats'],
    queryFn: getHomeStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// PROPERTY HOOKS
// ============================================

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['properties', id],
    queryFn: () => getProperty(id),
    enabled: !!id,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePropertyInput) => createProperty(input),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CreatePropertyInput> }) =>
      updateProperty(id, updates),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useSetPrimaryProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setPrimaryProperty(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// Re-export types
export type { Property, CreatePropertyInput, WikiEntryRow, CreateWikiEntryInput };

// ============================================
// WIKI HOOKS
// ============================================

export function useWikiEntries() {
  const propertyId = usePropertyStore((s) => s.selectedPropertyId);
  return useQuery({
    queryKey: ['wikiEntries', propertyId],
    queryFn: () => getWikiEntries(propertyId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateWikiEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateWikiEntryInput) => createWikiEntry(input),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['wikiEntries'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useUpdateWikiEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<WikiEntryRow, 'category' | 'title' | 'content' | 'is_pinned'>> }) =>
      updateWikiEntry(id, updates),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['wikiEntries'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useDeleteWikiEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWikiEntry(id),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['wikiEntries'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}
