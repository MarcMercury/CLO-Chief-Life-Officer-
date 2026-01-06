/**
 * useRelationshipItems Hook
 * 
 * Unified hook for managing the Plan → Resolve → Decisions workflow
 * Handles all CRUD operations for relationship items within a capsule
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import {
  RelationshipItem,
  RelationshipItemStatus,
  CreateRelationshipItemInput,
  RelationshipItemComment,
  CapsuleItemCounts,
} from '@/types/relationships';

// Query keys
export const relationshipItemKeys = {
  all: (capsuleId: string) => ['relationship-items', capsuleId] as const,
  byStatus: (capsuleId: string, status: RelationshipItemStatus | RelationshipItemStatus[]) => 
    ['relationship-items', capsuleId, 'status', status] as const,
  detail: (itemId: string) => ['relationship-items', 'detail', itemId] as const,
  comments: (itemId: string) => ['relationship-items', 'comments', itemId] as const,
  counts: (capsuleId: string) => ['relationship-items', capsuleId, 'counts'] as const,
};

// ============================================
// FETCH ITEMS
// ============================================

/**
 * Get all items for a capsule
 */
export function useRelationshipItems(capsuleId: string) {
  return useQuery({
    queryKey: relationshipItemKeys.all(capsuleId),
    queryFn: async (): Promise<RelationshipItem[]> => {
      const { data, error } = await supabase
        .from('relationship_items')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as RelationshipItem[];
    },
    enabled: !!capsuleId,
  });
}

/**
 * Get items by status (for Plan, Resolve, Decisions views)
 */
export function useItemsByStatus(
  capsuleId: string, 
  statuses: RelationshipItemStatus | RelationshipItemStatus[]
) {
  const statusArray = Array.isArray(statuses) ? statuses : [statuses];
  
  return useQuery({
    queryKey: relationshipItemKeys.byStatus(capsuleId, statuses),
    queryFn: async (): Promise<RelationshipItem[]> => {
      const { data, error } = await supabase
        .from('relationship_items')
        .select('*')
        .eq('capsule_id', capsuleId)
        .in('status', statusArray)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as RelationshipItem[];
    },
    enabled: !!capsuleId,
  });
}

/**
 * Get planning items
 */
export function usePlanningItems(capsuleId: string) {
  return useItemsByStatus(capsuleId, 'planning');
}

/**
 * Get resolve items
 */
export function useResolveItems(capsuleId: string) {
  return useItemsByStatus(capsuleId, ['needs_resolve', 'resolving']);
}

/**
 * Get pending decision items (including all undecided)
 */
export function usePendingDecisions(capsuleId: string) {
  return useItemsByStatus(capsuleId, 'pending_decision');
}

/**
 * Get all pending items (anything not yet confirmed - for the pending badge count)
 */
export function useAllPendingItems(capsuleId: string) {
  return useItemsByStatus(capsuleId, ['planning', 'needs_resolve', 'resolving', 'pending_decision']);
}

/**
 * Get confirmed decisions
 */
export function useConfirmedDecisions(capsuleId: string) {
  return useItemsByStatus(capsuleId, 'confirmed');
}

/**
 * Get completed items
 */
export function useCompletedItems(capsuleId: string) {
  return useItemsByStatus(capsuleId, 'completed');
}

/**
 * Get item counts by status
 */
export function useItemCounts(capsuleId: string) {
  return useQuery({
    queryKey: relationshipItemKeys.counts(capsuleId),
    queryFn: async (): Promise<CapsuleItemCounts> => {
      const { data, error } = await supabase
        .from('relationship_items')
        .select('status')
        .eq('capsule_id', capsuleId);

      if (error) throw new Error(error.message);
      
      const counts: CapsuleItemCounts = {
        planning: 0,
        resolving: 0,
        pending_decision: 0,
        confirmed: 0,
        completed: 0,
      };
      
      (data || []).forEach((item: { status: string }) => {
        if (item.status === 'planning') counts.planning++;
        else if (item.status === 'needs_resolve' || item.status === 'resolving') counts.resolving++;
        else if (item.status === 'pending_decision') counts.pending_decision++;
        else if (item.status === 'confirmed') counts.confirmed++;
        else if (item.status === 'completed') counts.completed++;
      });
      
      return counts;
    },
    enabled: !!capsuleId,
  });
}

// ============================================
// CREATE ITEM
// ============================================

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRelationshipItemInput): Promise<RelationshipItem> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('relationship_items') as any)
        .insert({
          capsule_id: input.capsule_id,
          title: input.title,
          description: input.description || null,
          category: input.category || 'general',
          created_by: user.id,
          status: 'planning',
          estimated_cost: input.estimated_cost || null,
          currency: input.currency || 'USD',
          scheduled_date: input.scheduled_date || null,
          location: input.location || null,
          priority: input.priority || 'normal',
          deadline: input.deadline || null,
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.counts(data.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// ============================================
// VOTING (Plan Phase)
// ============================================

export function useVoteOnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId, 
      vote, 
      isUserA 
    }: { 
      itemId: string; 
      capsuleId: string; 
      vote: boolean; 
      isUserA: boolean;
    }): Promise<RelationshipItem> => {
      const updateField = isUserA ? 'vote_user_a' : 'vote_user_b';
      
      const { data, error } = await (supabase
        .from('relationship_items') as any)
        .update({ [updateField]: vote })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.counts(data.capsule_id) });
      Haptics.selectionAsync();
    },
  });
}

// ============================================
// MOVE TO RESOLVE
// ============================================

export function useMoveToResolve() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId 
    }: { 
      itemId: string; 
      capsuleId: string;
    }): Promise<RelationshipItem> => {
      const { data, error } = await (supabase
        .from('relationship_items') as any)
        .update({ 
          status: 'resolving',
          moved_to_resolve_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.counts(data.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// SUBMIT PERSPECTIVE (Resolve Phase)
// ============================================

export function useSubmitPerspective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId,
      isUserA,
      feeling,
      need,
      willing,
      compromise,
    }: { 
      itemId: string; 
      capsuleId: string;
      isUserA: boolean;
      feeling: string;
      need: string;
      willing: string;
      compromise: string;
    }): Promise<RelationshipItem> => {
      const updates = isUserA 
        ? { feeling_a: feeling, need_a: need, willing_a: willing, compromise_a: compromise }
        : { feeling_b: feeling, need_b: need, willing_b: willing, compromise_b: compromise };
      
      const { data, error } = await (supabase
        .from('relationship_items') as any)
        .update(updates)
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// MOVE TO DECISION
// ============================================

export function useMoveToDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId,
      resolutionNotes,
    }: { 
      itemId: string; 
      capsuleId: string;
      resolutionNotes?: string;
    }): Promise<RelationshipItem> => {
      const { data, error } = await (supabase
        .from('relationship_items') as any)
        .update({ 
          status: 'pending_decision',
          resolution_notes: resolutionNotes || null,
          moved_to_decision_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.counts(data.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// CONFIRM DECISION
// ============================================

export function useConfirmDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId,
      isUserA,
    }: { 
      itemId: string; 
      capsuleId: string;
      isUserA: boolean;
    }): Promise<RelationshipItem> => {
      const updateField = isUserA ? 'confirmed_by_a' : 'confirmed_by_b';
      
      // First update the confirmation
      const { data: updateData, error: updateError } = await (supabase
        .from('relationship_items') as any)
        .update({ [updateField]: true })
        .eq('id', itemId)
        .select('*')
        .single();

      if (updateError) throw new Error(updateError.message);
      
      const item = updateData as RelationshipItem;
      
      // Check if both have now confirmed
      if (item.confirmed_by_a && item.confirmed_by_b) {
        const { data: confirmedData, error: confirmedError } = await (supabase
          .from('relationship_items') as any)
          .update({ 
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', itemId)
          .select('*')
          .single();
          
        if (confirmedError) throw new Error(confirmedError.message);
        return confirmedData as RelationshipItem;
      }
      
      return item;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.counts(data.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// COMPLETE ITEM
// ============================================

export function useCompleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId,
    }: { 
      itemId: string; 
      capsuleId: string;
    }): Promise<RelationshipItem> => {
      const { data, error } = await (supabase
        .from('relationship_items') as any)
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.counts(data.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// ARCHIVE ITEM
// ============================================

export function useArchiveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId,
    }: { 
      itemId: string; 
      capsuleId: string;
    }): Promise<RelationshipItem> => {
      const { data, error } = await (supabase
        .from('relationship_items') as any)
        .update({ status: 'archived' })
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.counts(data.capsule_id) });
      Haptics.selectionAsync();
    },
  });
}

// ============================================
// COMMENTS
// ============================================

export function useItemComments(itemId: string) {
  return useQuery({
    queryKey: relationshipItemKeys.comments(itemId),
    queryFn: async (): Promise<RelationshipItemComment[]> => {
      const { data, error } = await supabase
        .from('relationship_item_comments')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return (data || []) as RelationshipItemComment[];
    },
    enabled: !!itemId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      content,
    }: { 
      itemId: string; 
      content: string;
    }): Promise<RelationshipItemComment> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('relationship_item_comments') as any)
        .insert({
          item_id: itemId,
          user_id: user.id,
          content,
        })
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItemComment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.comments(data.item_id) });
      Haptics.selectionAsync();
    },
  });
}

// ============================================
// UPDATE ITEM
// ============================================

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId,
      updates,
    }: { 
      itemId: string; 
      capsuleId: string;
      updates: Partial<RelationshipItem>;
    }): Promise<RelationshipItem> => {
      // Remove read-only fields
      const { id, capsule_id, created_by, created_at, updated_at, ...safeUpdates } = updates as any;
      
      const { data, error } = await (supabase
        .from('relationship_items') as any)
        .update(safeUpdates)
        .eq('id', itemId)
        .select('*')
        .single();

      if (error) throw new Error(error.message);
      return data as RelationshipItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(data.capsule_id) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.detail(data.id) });
      Haptics.selectionAsync();
    },
  });
}

// ============================================
// DELETE ITEM
// ============================================

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      capsuleId,
    }: { 
      itemId: string; 
      capsuleId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('relationship_items')
        .delete()
        .eq('id', itemId);

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.all(variables.capsuleId) });
      queryClient.invalidateQueries({ queryKey: relationshipItemKeys.counts(variables.capsuleId) });
      Haptics.selectionAsync();
    },
  });
}

// ============================================
// HELPER: Determine if current user is User A
// ============================================

export function useIsUserA(capsuleId: string) {
  return useQuery({
    queryKey: ['is-user-a', capsuleId],
    queryFn: async (): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('relationship_capsules')
        .select('user_a_id')
        .eq('id', capsuleId)
        .single();
        
      if (error) throw new Error(error.message);
      return data.user_a_id === user.id;
    },
    enabled: !!capsuleId,
  });
}
