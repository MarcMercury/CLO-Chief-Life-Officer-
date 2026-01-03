import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import {
  RelationshipCapsule,
  CapsuleWithPartner,
  RelationshipHealth,
  CreateCapsuleInput,
  InteractionLog,
  LogInteractionInput,
  SharedTask,
  CreateSharedTaskInput,
  OpenLoop,
  CreateOpenLoopInput,
  EmotionalLog,
  LogEmotionInput,
  CapsuleMessage,
} from '@/types/relationships';

// Query keys
export const capsuleKeys = {
  all: ['capsules'] as const,
  detail: (id: string) => ['capsules', id] as const,
  tasks: (capsuleId: string) => ['capsules', capsuleId, 'tasks'] as const,
  loops: (capsuleId: string) => ['capsules', capsuleId, 'loops'] as const,
  interactions: (capsuleId: string) => ['capsules', capsuleId, 'interactions'] as const,
  emotions: (capsuleId: string) => ['capsules', capsuleId, 'emotions'] as const,
  messages: (capsuleId: string) => ['capsules', capsuleId, 'messages'] as const,
};

// ============================================
// CAPSULE LIST & DETAIL
// ============================================

export function useCapsules() {
  return useQuery({
    queryKey: capsuleKeys.all,
    queryFn: async (): Promise<CapsuleWithPartner[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch capsules where user is either user_a or user_b
      // Simple select without FK joins to avoid 409 conflicts
      const { data, error } = await supabase
        .from('relationship_capsules')
        .select('*')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw new Error(error.message);

      // Transform to include partner info and health
      // Note: Without FK joins, we use invite_email for pending invites
      return (data || []).map((capsule: any) => {
        // Calculate health based on last_deep_connect and sentiment
        const daysSinceConnect = capsule.last_deep_connect
          ? Math.floor((Date.now() - new Date(capsule.last_deep_connect).getTime()) / (1000 * 60 * 60 * 24))
          : 7; // Default to 7 days for new nests
        
        const health: RelationshipHealth = {
          score: Math.max(0, 100 - daysSinceConnect * 5),
          days_since_meaningful_interaction: daysSinceConnect,
          status: daysSinceConnect <= 3 ? 'thriving'
            : daysSinceConnect <= 7 ? 'healthy'
            : daysSinceConnect <= 14 ? 'needs_attention'
            : 'at_risk',
        };

        return {
          ...capsule,
          partner: capsule.user_b_id ? {
            id: capsule.user_b_id,
            display_name: capsule.invite_email || 'Partner',
            avatar_url: null,
          } : null,
          invite_email: capsule.invite_email,
          relationship_health: health,
        };
      });
    },
  });
}

export function useCapsule(capsuleId: string) {
  return useQuery({
    queryKey: capsuleKeys.detail(capsuleId),
    queryFn: async (): Promise<CapsuleWithPartner | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('relationship_capsules')
        .select('*')
        .eq('id', capsuleId)
        .single();

      if (error) throw new Error(error.message);
      if (!data) return null;

      const capsule = data as any;

      const daysSinceConnect = capsule.last_deep_connect
        ? Math.floor((Date.now() - new Date(capsule.last_deep_connect).getTime()) / (1000 * 60 * 60 * 24))
        : 7;

      const health: RelationshipHealth = {
        score: Math.max(0, 100 - daysSinceConnect * 5),
        days_since_meaningful_interaction: daysSinceConnect,
        status: daysSinceConnect <= 3 ? 'thriving'
          : daysSinceConnect <= 7 ? 'healthy'
          : daysSinceConnect <= 14 ? 'needs_attention'
          : 'at_risk',
      };

      return {
        ...capsule,
        partner: capsule.user_b_id ? {
          id: capsule.user_b_id,
          display_name: capsule.invite_email || 'Partner',
          avatar_url: null,
        } : null,
        invite_email: capsule.invite_email,
        relationship_health: health,
      };
    },
    enabled: !!capsuleId,
  });
}

// ============================================
// CREATE & INVITE
// ============================================

// Helper function to send invite email via Edge Function
async function sendInviteEmail(params: {
  invitee_email: string;
  inviter_name: string;
  invite_token: string;
  capsule_id: string;
}): Promise<{ success: boolean; message: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('Supabase URL not configured');
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/send-invite-email`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('Email invite error:', result);
    throw new Error(result.message || 'Failed to send invite email');
  }

  return result;
}

export function useCreateCapsule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCapsuleInput): Promise<RelationshipCapsule & { emailSent?: boolean }> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Don't pass invite_token - let the database generate it via default
      const { data, error } = await (supabase
        .from('relationship_capsules') as any)
        .insert({
          user_a_id: user.id,
          invite_email: input.partner_email,
          status: 'PENDING',
          tier: 'STANDARD',
        })
        .select('*')
        .single();

      if (error) {
        console.error('Capsule creation error:', error);
        throw new Error(error.message);
      }

      const capsule = data as RelationshipCapsule;
      
      // Try to send the invite email (non-blocking - capsule is created regardless)
      let emailSent = false;
      try {
        const inviterName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Someone';
        await sendInviteEmail({
          invitee_email: input.partner_email,
          inviter_name: inviterName,
          invite_token: capsule.invite_token,
          capsule_id: capsule.id,
        });
        emailSent = true;
        console.log('Invite email sent successfully');
      } catch (emailError) {
        // Log error but don't fail the capsule creation
        console.warn('Failed to send invite email:', emailError);
      }

      return { ...capsule, emailSent };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capsuleKeys.all });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// Resend invite email (for when the initial send fails or user wants to resend)
export function useResendInviteEmail() {
  return useMutation({
    mutationFn: async (params: {
      invitee_email: string;
      invite_token: string;
      capsule_id: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return sendInviteEmail({
        ...params,
        inviter_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Someone',
      });
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// Join a capsule using an invite code
export function useJoinCapsule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string): Promise<{ success: boolean; error?: string; capsule_id?: string }> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Try the join_capsule_by_code RPC function first
      const { data, error } = await (supabase.rpc as any)('join_capsule_by_code', {
        code: inviteCode.toUpperCase().trim(),
      });

      if (error) {
        console.error('Join capsule error:', error);
        return { success: false, error: error.message };
      }

      // The RPC returns a JSON object with success/error
      if (data?.success === false) {
        return { success: false, error: data.error || 'Failed to join' };
      }

      return { success: true, capsule_id: data?.capsule_id };
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: capsuleKeys.all });
      }
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteToken: string): Promise<string> => {
      const { data, error } = await (supabase.rpc as any)('accept_capsule_invite', {
        invite_token_param: inviteToken,
      });

      if (error) throw new Error(error.message);
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: capsuleKeys.all });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// SHARED TASKS
// ============================================

export function useSharedTasks(capsuleId: string) {
  return useQuery({
    queryKey: capsuleKeys.tasks(capsuleId),
    queryFn: async (): Promise<SharedTask[]> => {
      const { data, error } = await supabase
        .from('shared_tasks')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as unknown as SharedTask[];
    },
    enabled: !!capsuleId,
  });
}

export function useCreateSharedTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSharedTaskInput): Promise<SharedTask> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('shared_tasks') as any)
        .insert({
          capsule_id: input.capsule_id,
          title: input.title,
          description: input.description || null,
          assigned_to: input.assigned_to || null,
          due_date: input.due_date || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as SharedTask;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: capsuleKeys.tasks(variables.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

export function useToggleSharedTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, capsuleId, isCompleted }: { taskId: string; capsuleId: string; isCompleted: boolean }) => {
      const { data, error } = await (supabase
        .from('shared_tasks') as any)
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { data, capsuleId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: capsuleKeys.tasks(result.capsuleId) });
      Haptics.selectionAsync();
    },
  });
}

// ============================================
// OPEN LOOPS
// ============================================

export function useOpenLoops(capsuleId: string) {
  return useQuery({
    queryKey: capsuleKeys.loops(capsuleId),
    queryFn: async (): Promise<OpenLoop[]> => {
      const { data, error } = await supabase
        .from('open_loops')
        .select('*')
        .eq('capsule_id', capsuleId)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []) as unknown as OpenLoop[];
    },
    enabled: !!capsuleId,
  });
}

export function useCreateOpenLoop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOpenLoopInput): Promise<OpenLoop> => {
      const { data, error } = await (supabase
        .from('open_loops') as any)
        .insert({
          capsule_id: input.capsule_id,
          description: input.title,
          direction: 'I_OWE',
          status: 'OPEN',
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as OpenLoop;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: capsuleKeys.loops(variables.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// INTERACTION LOGS
// ============================================

export function useInteractionLogs(capsuleId: string) {
  return useQuery({
    queryKey: capsuleKeys.interactions(capsuleId),
    queryFn: async (): Promise<InteractionLog[]> => {
      const { data, error } = await supabase
        .from('interaction_logs')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('occurred_at', { ascending: false })
        .limit(30);

      if (error) throw new Error(error.message);
      return (data || []) as unknown as InteractionLog[];
    },
    enabled: !!capsuleId,
  });
}

export function useLogInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { capsule_id: string; interaction_type: string; summary?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('interaction_logs') as any)
        .insert({
          capsule_id: input.capsule_id,
          logged_by: user.id,
          source: 'MANUAL',
          interaction_type: input.interaction_type,
          summary: input.summary || null,
          occurred_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Also update last_deep_connect on capsule
      await (supabase
        .from('relationship_capsules') as any)
        .update({ last_deep_connect: new Date().toISOString() })
        .eq('id', input.capsule_id);

      return { data, capsule_id: input.capsule_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: capsuleKeys.interactions(result.capsule_id) });
      queryClient.invalidateQueries({ queryKey: capsuleKeys.detail(result.capsule_id) });
      queryClient.invalidateQueries({ queryKey: capsuleKeys.all });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// EMOTIONAL LOGS
// ============================================

export function useEmotionalLogs(capsuleId: string) {
  return useQuery({
    queryKey: capsuleKeys.emotions(capsuleId),
    queryFn: async (): Promise<EmotionalLog[]> => {
      const { data, error } = await supabase
        .from('emotional_logs')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('logged_at', { ascending: false })
        .limit(30);

      if (error) throw new Error(error.message);
      return (data || []) as unknown as EmotionalLog[];
    },
    enabled: !!capsuleId,
  });
}

export function useLogEmotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { capsule_id: string; mood_self: string; mood_relationship?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('emotional_logs') as any)
        .insert({
          capsule_id: input.capsule_id,
          user_id: user.id,
          mood_self: input.mood_self,
          mood_relationship: input.mood_relationship || null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { data, capsule_id: input.capsule_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: capsuleKeys.emotions(result.capsule_id) });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });
}

// ============================================
// MESSAGES (Basic - no E2EE for now)
// ============================================

export function useCapsuleMessages(capsuleId: string) {
  return useQuery({
    queryKey: capsuleKeys.messages(capsuleId),
    queryFn: async (): Promise<CapsuleMessage[]> => {
      const { data, error } = await supabase
        .from('capsule_messages')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw new Error(error.message);
      return (data || []) as unknown as CapsuleMessage[];
    },
    enabled: !!capsuleId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { capsule_id: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await (supabase
        .from('capsule_messages') as any)
        .insert({
          capsule_id: input.capsule_id,
          sender_id: user.id,
          encrypted_content: input.content, // TODO: Add E2EE
          message_type: 'TEXT',
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { data, capsule_id: input.capsule_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: capsuleKeys.messages(result.capsule_id) });
      Haptics.selectionAsync();
    },
  });
}
