// Relationship Capsule Database Types
// These match the schema defined in supabase/schema_relationships.sql

export type CapsuleStatus = "pending" | "active" | "archived";

export type InteractionType =
  | "call"
  | "video_call"
  | "in_person"
  | "text"
  | "email"
  | "other";

export type LoopStatus = "open" | "resolved" | "deferred";

export type EmotionalTone =
  | "positive"
  | "neutral"
  | "negative"
  | "mixed";

export type SharedTaskPriority = "low" | "medium" | "high";

export type VaultItemType =
  | "password"
  | "account"
  | "document"
  | "note"
  | "other";

export type MessageType = "text" | "ai_response" | "system";

// ============================================
// Relationship Capsules (The Core Binding)
// ============================================

export interface RelationshipCapsule {
  id: string;
  user_a_id: string;
  user_b_id: string | null; // null until invite accepted
  user_b_email: string | null; // email for pending invite (legacy)
  invite_email: string | null; // email for pending invite
  invite_token: string; // UUID token for magic link invites
  invite_code: string | null; // legacy code alias
  status: CapsuleStatus;
  nickname: string | null; // e.g., "Sarah ❤️" or "Work Partner"
  relationship_type: string | null; // e.g., "spouse", "friend", "colleague"
  tier: string; // 'INNER_CIRCLE', 'STANDARD', 'ACQUAINTANCE'
  sentiment_score: number; // 0.0 to 1.0
  streak_days: number;
  last_deep_connect: string | null;
  shared_key: string | null; // Public key for E2EE
  created_at: string;
  updated_at: string;
}

export interface CapsuleWithPartner extends RelationshipCapsule {
  partner: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  relationship_health: RelationshipHealth | null;
  // Convenience alias
  partner_id?: string | null; // alias for user_b_id
}

export interface RelationshipHealth {
  score: number; // 0-100
  days_since_meaningful_interaction: number;
  status: "thriving" | "healthy" | "needs_attention" | "at_risk";
}

// ============================================
// Interaction Logs
// ============================================

export interface InteractionLog {
  id: string;
  capsule_id: string;
  logged_by: string;
  interaction_type: InteractionType;
  interaction_date: string;
  duration_minutes: number | null;
  quality_rating: number | null; // 1-5
  notes: string | null;
  is_meaningful: boolean;
  created_at: string;
}

// ============================================
// Open Loops (Unresolved Topics)
// ============================================

export interface OpenLoop {
  id: string;
  capsule_id: string;
  created_by: string;
  title: string;
  description: string | null;
  status: LoopStatus;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Emotional Logs
// ============================================

export interface EmotionalLog {
  id: string;
  capsule_id: string;
  user_id: string;
  mood_self: string; // Emoji: '😊', '😔', etc.
  mood_partner?: string | null; // How I feel about them
  mood_relationship?: string | null; // How I feel about "us"
  notes: string | null;
  logged_at: string;
  created_at?: string;
}

// ============================================
// Shared Tasks
// ============================================

export interface SharedTask {
  id: string;
  capsule_id: string;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  priority: SharedTaskPriority;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharedTaskWithAssignee extends SharedTask {
  assignee: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  creator: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// ============================================
// Vault Items (E2EE Protected)
// ============================================

export interface VaultItem {
  id: string;
  capsule_id: string;
  created_by: string;
  item_type: VaultItemType;
  title: string;
  encrypted_content: string; // Base64 encrypted data
  encryption_iv: string; // Initialization vector for decryption
  requires_both_keys: boolean; // If true, both users must enter PIN
  created_at: string;
  updated_at: string;
}

export interface DecryptedVaultItem extends Omit<VaultItem, "encrypted_content" | "encryption_iv"> {
  content: {
    // Actual content structure depends on item_type
    [key: string]: unknown;
  };
}

// ============================================
// Capsule Messages (E2EE Chat)
// ============================================

export interface CapsuleMessage {
  id: string;
  capsule_id: string;
  sender_id: string;
  message_type: MessageType;
  encrypted_content: string; // Base64 encrypted message
  encryption_iv: string;
  created_at: string;
}

export interface DecryptedMessage extends Omit<CapsuleMessage, "encrypted_content" | "encryption_iv"> {
  content: string;
  sender: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

// ============================================
// Input Types for Creating/Updating
// ============================================

export interface CreateCapsuleInput {
  partner_email: string;
  nickname?: string;
  relationship_type?: string;
}

export interface AcceptInviteInput {
  invite_code: string;
}

export interface LogInteractionInput {
  capsule_id: string;
  interaction_type: InteractionType;
  interaction_date: string;
  duration_minutes?: number;
  quality_rating?: number;
  notes?: string;
  is_meaningful?: boolean;
}

export interface CreateOpenLoopInput {
  capsule_id: string;
  title: string;
  description?: string;
}

export interface LogEmotionInput {
  capsule_id: string;
  tone: EmotionalTone;
  energy_level?: number;
  notes?: string;
}

export interface CreateSharedTaskInput {
  capsule_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  priority?: SharedTaskPriority;
  due_date?: string;
}

export interface CreateVaultItemInput {
  capsule_id: string;
  item_type: VaultItemType;
  title: string;
  content: Record<string, unknown>; // Will be encrypted before storage
  requires_both_keys?: boolean;
}

export interface SendMessageInput {
  capsule_id: string;
  content: string; // Will be encrypted before storage
  message_type?: MessageType;
}

// ============================================
// Capsule Zones (UI Organization)
// ============================================

export type CapsuleZone = "pulse" | "plan" | "decide" | "resolve" | "chat" | "vault";

// ============================================
// Pulse Check-In (Daily Emotional Check)
// ============================================

export type MoodEmoji = "😊" | "🙂" | "😐" | "😔" | "😢";

export interface PulseCheckIn {
  id: string;
  capsule_id: string;
  user_id: string;
  mood_self: MoodEmoji; // How am I feeling?
  mood_partner: MoodEmoji; // How do I feel about you?
  mood_relationship: MoodEmoji; // How do I feel about "us"?
  notes?: string; // Private reflection
  logged_at: string;
}

// ============================================
// Plan Items (Brainstorming Sandbox)
// ============================================

export type PlanCategory = "date" | "trip" | "purchase" | "activity" | "general";

export interface PlanItem {
  id: string;
  capsule_id: string;
  title: string;
  description?: string;
  category: PlanCategory;
  created_by: string;
  vote_a?: boolean; // User A's vote
  vote_b?: boolean; // User B's vote
  status: "planning" | "promoted" | "archived";
  created_at: string;
  updated_at: string;
}

// ============================================
// Decide Items (Finalization)
// ============================================

export interface DecideItem {
  id: string;
  capsule_id: string;
  plan_item_id?: string;
  title: string;
  description?: string;
  option_a?: string;
  option_b?: string;
  choice_user_a?: string;
  choice_user_b?: string;
  final_decision?: string;
  scheduled_date?: string;
  status: "pending" | "decided" | "completed" | "cancelled";
  decided_at?: string;
  created_at: string;
}

// ============================================
// Resolve Items (Conflict Resolution)
// ============================================

export interface ResolveItem {
  id: string;
  capsule_id: string;
  issue: string;
  initiated_by: string;
  
  // User A's perspective
  feeling_a?: string;
  need_a?: string;
  willing_a?: string;
  compromise_a?: string;
  accepted_a: boolean;
  
  // User B's perspective
  feeling_b?: string;
  need_b?: string;
  willing_b?: string;
  compromise_b?: string;
  accepted_b: boolean;
  
  final_resolution?: string;
  status: "open" | "in_progress" | "resolved" | "stale";
  created_at: string;
  resolved_at?: string;
}

// ============================================
// Enhanced Vault with Double-Consent
// ============================================

export interface VaultItemWithConsent extends VaultItem {
  approved_by_uploader: boolean;
  approved_by_partner: boolean;
  status: "pending" | "visible" | "rejected";
}

export interface CapsuleZoneData {
  pulse: {
    health: RelationshipHealth;
    recentCheckIns: PulseCheckIn[];
    emotionalTrend: EmotionalLog[];
  };
  plan: {
    items: PlanItem[];
  };
  decide: {
    items: DecideItem[];
  };
  resolve: {
    items: ResolveItem[];
  };
  chat: {
    messages: DecryptedMessage[];
    typingUsers: string[];
  };
  vault: {
    items: VaultItemWithConsent[];
    unlocked: boolean;
  };
}

// ============================================
// Input Types for New Modules
// ============================================

export interface CreatePlanItemInput {
  capsule_id: string;
  title: string;
  description?: string;
  category?: PlanCategory;
}

export interface CreateDecideItemInput {
  capsule_id: string;
  title: string;
  description?: string;
  option_a?: string;
  option_b?: string;
  plan_item_id?: string;
}

export interface CreateResolveItemInput {
  capsule_id: string;
  issue: string;
}

export interface SubmitResolvePerspectiveInput {
  resolve_id: string;
  feeling: string;
  need: string;
  willing: string;
  compromise: string;
}

export interface PulseCheckInInput {
  capsule_id: string;
  mood_self: MoodEmoji;
  mood_partner: MoodEmoji;
  mood_relationship: MoodEmoji;
  notes?: string;
}
