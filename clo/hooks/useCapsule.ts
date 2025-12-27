import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import {
  RelationshipCapsule,
  CapsuleWithPartner,
  PlanItem,
  DecideItem,
  ResolveItem,
  PulseCheckIn,
  CreatePlanItemInput,
  CreateDecideItemInput,
  CreateResolveItemInput,
  PulseCheckInInput,
  MoodEmoji,
} from '@/types/relationships';

// Type-safe wrapper for tables not yet in generated types
// These will be replaced once types are regenerated from the database
const db = supabase as any;

// ============================================
// Capsule Management Hook
// ============================================

export function useCapsule() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new capsule (generates invite code)
  const createCapsule = useCallback(async (relationshipType: string = 'partner') => {
    if (!user) return null;
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await db
        .from('relationship_capsules')
        .insert({
          user_a_id: user.id,
          relationship_type: relationshipType,
          status: 'PENDING',
        })
        .select()
        .single();

      if (err) throw err;
      return data as RelationshipCapsule;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Join capsule via invite code
  const joinCapsule = useCallback(async (inviteCode: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await db
        .rpc('join_capsule_by_code', { code: inviteCode.toUpperCase() });

      if (err) throw err;
      
      if (!data?.success) {
        setError(data?.error || 'Failed to join');
        return data;
      }
      
      return data;
    } catch (e: any) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get user's active capsules
  const getCapsules = useCallback(async () => {
    if (!user) return [];
    setLoading(true);

    try {
      const { data, error: err } = await db
        .from('relationship_capsules')
        .select(`
          *,
          partner:profiles!user_b_id(id, full_name, avatar_url)
        `)
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (err) throw err;
      return data as CapsuleWithPartner[];
    } catch (e: any) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    createCapsule,
    joinCapsule,
    getCapsules,
    loading,
    error,
  };
}

// ============================================
// Pulse Check-In Hook
// ============================================

export function usePulseCheckIn(capsuleId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Submit daily pulse
  const submitPulse = useCallback(async (input: Omit<PulseCheckInInput, 'capsule_id'>) => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await db
        .from('emotional_logs')
        .insert({
          capsule_id: capsuleId,
          user_id: user.id,
          mood_self: input.mood_self,
          mood_partner: input.mood_partner,
          mood_relationship: input.mood_relationship,
          notes: input.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Failed to submit pulse:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, capsuleId]);

  // Get pulse history
  const getPulseHistory = useCallback(async (days: number = 30) => {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data, error } = await db
        .from('emotional_logs')
        .select('*')
        .eq('capsule_id', capsuleId)
        .gte('logged_at', since.toISOString())
        .order('logged_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Failed to get pulse history:', e);
      return [];
    }
  }, [capsuleId]);

  // Check if user submitted pulse today
  const hasPulseToday = useCallback(async () => {
    if (!user) return false;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await db
        .from('emotional_logs')
        .select('id')
        .eq('capsule_id', capsuleId)
        .eq('user_id', user.id)
        .gte('logged_at', today.toISOString())
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (e) {
      return false;
    }
  }, [user, capsuleId]);

  return {
    submitPulse,
    getPulseHistory,
    hasPulseToday,
    loading,
  };
}

// ============================================
// Plan/Decide/Resolve Pipeline Hook
// ============================================

export function usePlanningPipeline(capsuleId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // PLAN: Create a new idea
  const createPlanItem = useCallback(async (input: Omit<CreatePlanItemInput, 'capsule_id'>) => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await db
        .from('plan_items')
        .insert({
          capsule_id: capsuleId,
          created_by: user.id,
          title: input.title,
          description: input.description,
          category: input.category || 'general',
        })
        .select()
        .single();

      if (error) throw error;
      return data as PlanItem;
    } catch (e) {
      console.error('Failed to create plan item:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, capsuleId]);

  // PLAN: Vote on an item
  const votePlanItem = useCallback(async (itemId: string, vote: boolean) => {
    if (!user) return false;

    try {
      // Determine if user is A or B in the capsule
      const { data: capsule } = await db
        .from('relationship_capsules')
        .select('user_a_id, user_b_id')
        .eq('id', capsuleId)
        .single();

      const isUserA = capsule?.user_a_id === user.id;
      const voteColumn = isUserA ? 'vote_a' : 'vote_b';

      const { error } = await db
        .from('plan_items')
        .update({ [voteColumn]: vote })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Failed to vote:', e);
      return false;
    }
  }, [user, capsuleId]);

  // PLAN: Get all plan items
  const getPlanItems = useCallback(async () => {
    try {
      const { data, error } = await db
        .from('plan_items')
        .select('*')
        .eq('capsule_id', capsuleId)
        .eq('status', 'planning')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PlanItem[];
    } catch (e) {
      console.error('Failed to get plan items:', e);
      return [];
    }
  }, [capsuleId]);

  // DECIDE: Promote plan item to decision
  const promoteToDecide = useCallback(async (planItemId: string) => {
    if (!user) return null;
    setLoading(true);

    try {
      // Get the plan item
      const { data: planItem } = await db
        .from('plan_items')
        .select('*')
        .eq('id', planItemId)
        .single();

      if (!planItem) throw new Error('Plan item not found');

      // Create decide item
      const { data: decideItem, error } = await db
        .from('decide_items')
        .insert({
          capsule_id: capsuleId,
          plan_item_id: planItemId,
          title: planItem.title,
          description: planItem.description,
        })
        .select()
        .single();

      if (error) throw error;

      // Update plan item status
      await db
        .from('plan_items')
        .update({ status: 'promoted' })
        .eq('id', planItemId);

      return decideItem as DecideItem;
    } catch (e) {
      console.error('Failed to promote:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, capsuleId]);

  // DECIDE: Make a choice
  const makeChoice = useCallback(async (decideItemId: string, choice: string) => {
    if (!user) return false;

    try {
      const { data: capsule } = await db
        .from('relationship_capsules')
        .select('user_a_id, user_b_id')
        .eq('id', capsuleId)
        .single();

      const isUserA = capsule?.user_a_id === user.id;
      const choiceColumn = isUserA ? 'choice_user_a' : 'choice_user_b';

      const { error } = await db
        .from('decide_items')
        .update({ [choiceColumn]: choice })
        .eq('id', decideItemId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Failed to make choice:', e);
      return false;
    }
  }, [user, capsuleId]);

  // DECIDE: Finalize decision
  const finalizeDecision = useCallback(async (decideItemId: string, decision: string, scheduledDate?: string) => {
    try {
      const { error } = await db
        .from('decide_items')
        .update({
          final_decision: decision,
          scheduled_date: scheduledDate,
          status: 'decided',
          decided_at: new Date().toISOString(),
        })
        .eq('id', decideItemId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Failed to finalize:', e);
      return false;
    }
  }, []);

  // DECIDE: Get pending decisions
  const getDecideItems = useCallback(async () => {
    try {
      const { data, error } = await db
        .from('decide_items')
        .select('*')
        .eq('capsule_id', capsuleId)
        .in('status', ['pending', 'decided'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DecideItem[];
    } catch (e) {
      console.error('Failed to get decide items:', e);
      return [];
    }
  }, [capsuleId]);

  // RESOLVE: Create conflict resolution
  const createResolveItem = useCallback(async (issue: string) => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await db
        .from('resolve_items')
        .insert({
          capsule_id: capsuleId,
          initiated_by: user.id,
          issue,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ResolveItem;
    } catch (e) {
      console.error('Failed to create resolve item:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, capsuleId]);

  // RESOLVE: Submit perspective
  const submitPerspective = useCallback(async (
    resolveId: string,
    feeling: string,
    need: string,
    willing: string,
    compromise: string
  ) => {
    if (!user) return false;

    try {
      const { data: capsule } = await db
        .from('relationship_capsules')
        .select('user_a_id, user_b_id')
        .eq('id', capsuleId)
        .single();

      const isUserA = capsule?.user_a_id === user.id;
      const updateData = isUserA
        ? { feeling_a: feeling, need_a: need, willing_a: willing, compromise_a: compromise }
        : { feeling_b: feeling, need_b: need, willing_b: willing, compromise_b: compromise };

      const { error } = await db
        .from('resolve_items')
        .update({ ...updateData, status: 'in_progress' })
        .eq('id', resolveId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Failed to submit perspective:', e);
      return false;
    }
  }, [user, capsuleId]);

  // RESOLVE: Accept compromise
  const acceptCompromise = useCallback(async (resolveId: string) => {
    if (!user) return false;

    try {
      const { data: capsule } = await db
        .from('relationship_capsules')
        .select('user_a_id, user_b_id')
        .eq('id', capsuleId)
        .single();

      const isUserA = capsule?.user_a_id === user.id;
      const acceptColumn = isUserA ? 'accepted_a' : 'accepted_b';

      // First update acceptance
      const { error } = await db
        .from('resolve_items')
        .update({ [acceptColumn]: true })
        .eq('id', resolveId);

      if (error) throw error;

      // Check if both accepted
      const { data: resolveItem } = await db
        .from('resolve_items')
        .select('accepted_a, accepted_b, compromise_a, compromise_b')
        .eq('id', resolveId)
        .single();

      if (resolveItem?.accepted_a && resolveItem?.accepted_b) {
        await db
          .from('resolve_items')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            final_resolution: resolveItem.compromise_a || resolveItem.compromise_b,
          })
          .eq('id', resolveId);
      }

      return true;
    } catch (e) {
      console.error('Failed to accept:', e);
      return false;
    }
  }, [user, capsuleId]);

  // RESOLVE: Get open conflicts
  const getResolveItems = useCallback(async () => {
    try {
      const { data, error } = await db
        .from('resolve_items')
        .select('*')
        .eq('capsule_id', capsuleId)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ResolveItem[];
    } catch (e) {
      console.error('Failed to get resolve items:', e);
      return [];
    }
  }, [capsuleId]);

  return {
    // Plan
    createPlanItem,
    votePlanItem,
    getPlanItems,
    // Decide
    promoteToDecide,
    makeChoice,
    finalizeDecision,
    getDecideItems,
    // Resolve
    createResolveItem,
    submitPerspective,
    acceptCompromise,
    getResolveItems,
    loading,
  };
}

// ============================================
// Vault Hook (Double-Consent)
// ============================================

export function useVault(capsuleId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Upload item (requires double approval)
  const uploadItem = useCallback(async (
    title: string,
    content: string,
    contentType: string = 'NOTE'
  ) => {
    if (!user) return null;
    setLoading(true);

    try {
      const { data, error } = await db
        .from('vault_items')
        .insert({
          capsule_id: capsuleId,
          uploaded_by: user.id,
          title,
          encrypted_content: content, // Should be encrypted client-side
          content_type: contentType,
          approved_by_uploader: false,
          approved_by_partner: false,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Failed to upload vault item:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, capsuleId]);

  // Approve item
  const approveItem = useCallback(async (itemId: string) => {
    try {
      const { data, error } = await db
        .rpc('approve_vault_item', { item_id: itemId });

      if (error) throw error;
      return data?.success;
    } catch (e) {
      console.error('Failed to approve:', e);
      return false;
    }
  }, []);

  // Get vault items
  const getItems = useCallback(async () => {
    try {
      const { data, error } = await db
        .from('vault_items')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Failed to get vault items:', e);
      return [];
    }
  }, [capsuleId]);

  return {
    uploadItem,
    approveItem,
    getItems,
    loading,
  };
}

// ============================================
// Signal Chat Hook (Minimalist)
// ============================================

export function useSignalChat(capsuleId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await db
        .from('capsule_messages')
        .insert({
          capsule_id: capsuleId,
          sender_id: user.id,
          encrypted_content: content, // Should encrypt client-side
          message_type: 'TEXT',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Failed to send message:', e);
      return null;
    }
  }, [user, capsuleId]);

  // Get messages
  const getMessages = useCallback(async (limit: number = 50) => {
    try {
      const { data, error } = await db
        .from('capsule_messages')
        .select(`
          *,
          sender:profiles!sender_id(id, full_name, avatar_url)
        `)
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.reverse() || [];
    } catch (e) {
      console.error('Failed to get messages:', e);
      return [];
    }
  }, [capsuleId]);

  // Mark as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const { error } = await db
        .from('capsule_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  return {
    sendMessage,
    getMessages,
    markAsRead,
    loading,
  };
}
