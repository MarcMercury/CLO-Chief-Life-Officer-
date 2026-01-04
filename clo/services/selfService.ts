/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck - Tables not yet in generated types. Remove after running migration.
/**
 * Self Service
 * 
 * Database operations for all Self module features:
 * - Daily Intentions
 * - Skills (Learn List)
 * - Read List
 * - Mood Logs
 * - Gratitude
 * - Career Goals
 * - Networking
 * - Ideas
 * - Daily Spending
 */

import { supabase } from '@/lib/supabase';

// Type helper for tables not yet in generated types
// These tables are defined in 20241230_self_modules.sql migration
// Once the migration is run and types regenerated, remove this workaround
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const from = (table: string) => (supabase as any).from(table);
// eslint-disable-next-line @typescript-eslint/no-explicit-any  
const auth = () => (supabase as any).auth;

// ============================================
// TYPES
// ============================================

export interface DailyIntention {
  id: string;
  user_id: string;
  intention_text: string;
  slot_number: 1 | 2 | 3;
  is_completed: boolean;
  intention_date: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  skill_name: string;
  category?: string;
  progress: number;
  notes?: string;
  last_practiced?: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author?: string;
  status: 'to_read' | 'reading' | 'completed';
  rating?: number;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  energy_level: number; // -2 to 2
  pleasure_level: number; // -2 to 2
  emotion_label?: string;
  notes?: string;
  logged_at: string;
  created_at: string;
}

export interface GratitudeEntry {
  id: string;
  user_id: string;
  content: string;
  logged_date: string;
  created_at: string;
}

export interface CareerGoal {
  id: string;
  user_id: string;
  goal_text: string;
  is_completed: boolean;
  target_date?: string;
  priority: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NetworkingContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_info?: string;
  contacted: boolean;
  outreach_date: string;
  notes?: string;
  created_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  idea_title: string;
  idea_content?: string;
  category?: string;
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailySpend {
  id: string;
  user_id: string;
  amount: number;
  category?: string;
  description?: string;
  spend_date: string;
  created_at: string;
}

export interface BudgetSettings {
  id: string;
  user_id: string;
  daily_budget?: number;
  weekly_budget?: number;
  monthly_budget?: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// DAILY INTENTIONS
// ============================================

export async function getDailyIntentions(date?: string): Promise<DailyIntention[]> {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_intentions')
    .select('*')
    .eq('intention_date', targetDate)
    .order('slot_number');

  if (error) {
    console.error('Failed to fetch daily intentions:', error);
    return [];
  }
  return data || [];
}

export async function upsertDailyIntention(
  slotNumber: 1 | 2 | 3,
  intentionText: string,
  date?: string
): Promise<DailyIntention | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const targetDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_intentions')
    .upsert({
      user_id: user.id,
      slot_number: slotNumber,
      intention_text: intentionText,
      intention_date: targetDate,
      is_completed: false,
    }, {
      onConflict: 'user_id,slot_number,intention_date',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert intention:', error);
    throw new Error(error.message);
  }
  return data;
}

export async function toggleIntentionComplete(id: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('daily_intentions')
    .update({ is_completed: completed, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ============================================
// SKILLS (LEARN LIST)
// ============================================

export async function getSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skill_tracker')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch skills:', error);
    return [];
  }
  return data || [];
}

export async function createSkill(skillName: string, category?: string): Promise<Skill | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('skill_tracker')
    .insert({
      user_id: user.id,
      skill_name: skillName,
      category,
      progress: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSkillProgress(id: string, progress: number): Promise<void> {
  const { error } = await supabase
    .from('skill_tracker')
    .update({ 
      progress: Math.min(100, Math.max(0, progress)),
      last_practiced: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteSkill(id: string): Promise<void> {
  const { error } = await from('skill_tracker').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================
// READ LIST
// ============================================

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('read_list')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch books:', error);
    return [];
  }
  return data || [];
}

export async function createBook(title: string, author?: string): Promise<Book | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('read_list')
    .insert({
      user_id: user.id,
      title,
      author,
      status: 'to_read',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateBookStatus(id: string, status: Book['status']): Promise<void> {
  const updates: any = { status, updated_at: new Date().toISOString() };
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }
  
  const { error } = await from('read_list').update(updates).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function updateBook(
  id: string, 
  updates: { title?: string; author?: string; notes?: string; rating?: number }
): Promise<void> {
  const { error } = await from('read_list')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteBook(id: string): Promise<void> {
  const { error } = await from('read_list').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================
// MOOD LOGS
// ============================================

export async function getMoodLogs(limit = 30): Promise<MoodLog[]> {
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .order('logged_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch mood logs:', error);
    return [];
  }
  return data || [];
}

export async function getTodaysMood(): Promise<MoodLog | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('mood_logs')
    .select('*')
    .gte('logged_at', `${today}T00:00:00`)
    .lt('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch today mood:', error);
  }
  return data || null;
}

export async function logMood(
  energyLevel: number,
  pleasureLevel: number,
  emotionLabel?: string,
  notes?: string
): Promise<MoodLog | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('mood_logs')
    .insert({
      user_id: user.id,
      energy_level: energyLevel,
      pleasure_level: pleasureLevel,
      emotion_label: emotionLabel,
      notes,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ============================================
// GRATITUDE
// ============================================

export async function getGratitudeEntries(limit = 30): Promise<GratitudeEntry[]> {
  const { data, error } = await supabase
    .from('gratitude_log')
    .select('*')
    .order('logged_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch gratitude:', error);
    return [];
  }
  return data || [];
}

export async function getTodaysGratitude(): Promise<GratitudeEntry[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('gratitude_log')
    .select('*')
    .eq('logged_date', today);

  if (error) {
    console.error('Failed to fetch today gratitude:', error);
    return [];
  }
  return data || [];
}

export async function addGratitude(content: string): Promise<GratitudeEntry | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('gratitude_log')
    .insert({
      user_id: user.id,
      content,
      logged_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ============================================
// CAREER GOALS
// ============================================

export async function getCareerGoals(): Promise<CareerGoal[]> {
  const { data, error } = await supabase
    .from('career_goals')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch career goals:', error);
    return [];
  }
  return data || [];
}

export async function createCareerGoal(goalText: string, priority = 2): Promise<CareerGoal | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('career_goals')
    .insert({
      user_id: user.id,
      goal_text: goalText,
      priority,
      is_completed: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function toggleCareerGoal(id: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('career_goals')
    .update({ is_completed: completed, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteCareerGoal(id: string): Promise<void> {
  const { error } = await from('career_goals').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================
// NETWORKING (DAILY OUTREACH)
// ============================================

export async function getTodaysNetworking(): Promise<NetworkingContact[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('networking_daily')
    .select('*')
    .eq('outreach_date', today)
    .order('created_at');

  if (error) {
    console.error('Failed to fetch networking:', error);
    return [];
  }
  return data || [];
}

export async function addNetworkingContact(
  contactName: string, 
  contactInfo?: string
): Promise<NetworkingContact | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('networking_daily')
    .insert({
      user_id: user.id,
      contact_name: contactName,
      contact_info: contactInfo,
      contacted: false,
      outreach_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function markContacted(id: string, contacted: boolean): Promise<void> {
  const { error } = await supabase
    .from('networking_daily')
    .update({ contacted })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteNetworkingContact(id: string): Promise<void> {
  const { error } = await from('networking_daily').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================
// IDEA VAULT
// ============================================

export async function getIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('idea_vault')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch ideas:', error);
    return [];
  }
  return data || [];
}

export async function createIdea(
  ideaTitle: string, 
  ideaContent?: string,
  category?: string,
  color?: string
): Promise<Idea | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('idea_vault')
    .insert({
      user_id: user.id,
      idea_title: ideaTitle,
      idea_content: ideaContent,
      category,
      color: color || '#FBBF24', // Default yellow
      is_pinned: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateIdea(id: string, updates: Partial<Idea>): Promise<void> {
  const { error } = await supabase
    .from('idea_vault')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteIdea(id: string): Promise<void> {
  const { error } = await from('idea_vault').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ============================================
// DAILY SPENDING / FINANCIAL PULSE
// ============================================

export async function getTodaysSpending(): Promise<DailySpend[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_spending')
    .select('*')
    .eq('spend_date', today)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch spending:', error);
    return [];
  }
  return data || [];
}

export async function addSpending(
  amount: number, 
  description?: string,
  category?: string
): Promise<DailySpend | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('daily_spending')
    .insert({
      user_id: user.id,
      amount,
      description,
      category,
      spend_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getBudgetSettings(): Promise<BudgetSettings | null> {
  const { data, error } = await supabase
    .from('budget_settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch budget settings:', error);
  }
  return data || null;
}

export async function upsertBudgetSettings(settings: {
  daily_budget?: number;
  weekly_budget?: number;
  monthly_budget?: number;
}): Promise<BudgetSettings | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budget_settings')
    .upsert({
      user_id: user.id,
      ...settings,
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ============================================
// EMOTION MAPPING (Russell's Circumplex)
// Enhanced with 32+ distinct emotions based on intensity and position
// ============================================

export function getEmotionFromCoordinates(energy: number, pleasure: number): string {
  // Calculate distance from center for intensity
  const intensity = Math.sqrt(energy ** 2 + pleasure ** 2);
  
  // Check for neutral zone (close to center)
  if (intensity < 0.5) {
    return 'Neutral';
  }
  
  // Determine intensity level
  const isHighIntensity = intensity > 1.4;
  const isMediumIntensity = intensity > 0.8;
  
  // High Energy + Positive Pleasure (Quadrant 1 - top right)
  if (energy > 0 && pleasure > 0) {
    if (isHighIntensity) {
      if (energy > pleasure) return 'Ecstatic';
      if (pleasure > energy) return 'Elated';
      return 'Thrilled';
    }
    if (isMediumIntensity) {
      if (energy > pleasure) return 'Energized';
      if (pleasure > energy) return 'Joyful';
      return 'Excited';
    }
    return 'Happy';
  }
  
  // High Energy + Negative Pleasure (Quadrant 2 - top left)
  if (energy > 0 && pleasure < 0) {
    if (isHighIntensity) {
      if (energy > Math.abs(pleasure)) return 'Panicked';
      if (Math.abs(pleasure) > energy) return 'Furious';
      return 'Overwhelmed';
    }
    if (isMediumIntensity) {
      if (energy > Math.abs(pleasure)) return 'Anxious';
      if (Math.abs(pleasure) > energy) return 'Angry';
      return 'Stressed';
    }
    return 'Tense';
  }
  
  // Low Energy + Positive Pleasure (Quadrant 3 - bottom right)
  if (energy < 0 && pleasure > 0) {
    if (isHighIntensity) {
      if (Math.abs(energy) > pleasure) return 'Serene';
      if (pleasure > Math.abs(energy)) return 'Content';
      return 'Tranquil';
    }
    if (isMediumIntensity) {
      if (Math.abs(energy) > pleasure) return 'Relaxed';
      if (pleasure > Math.abs(energy)) return 'Peaceful';
      return 'Calm';
    }
    return 'At Ease';
  }
  
  // Low Energy + Negative Pleasure (Quadrant 4 - bottom left)
  if (energy < 0 && pleasure < 0) {
    if (isHighIntensity) {
      if (Math.abs(energy) > Math.abs(pleasure)) return 'Exhausted';
      if (Math.abs(pleasure) > Math.abs(energy)) return 'Depressed';
      return 'Hopeless';
    }
    if (isMediumIntensity) {
      if (Math.abs(energy) > Math.abs(pleasure)) return 'Drained';
      if (Math.abs(pleasure) > Math.abs(energy)) return 'Melancholic';
      return 'Sad';
    }
    return 'Down';
  }
  
  // Edge cases on axes
  if (energy > 0 && pleasure === 0) {
    return isHighIntensity ? 'Activated' : 'Alert';
  }
  if (energy < 0 && pleasure === 0) {
    return isHighIntensity ? 'Fatigued' : 'Tired';
  }
  if (energy === 0 && pleasure > 0) {
    return isHighIntensity ? 'Pleased' : 'Okay';
  }
  if (energy === 0 && pleasure < 0) {
    return isHighIntensity ? 'Displeased' : 'Uneasy';
  }
  
  return 'Neutral';
}

export const EMOTION_LABELS = [
  // High Energy + Positive
  'Ecstatic', 'Elated', 'Thrilled', 'Excited', 'Energized', 'Joyful', 'Happy',
  // High Energy + Negative  
  'Panicked', 'Furious', 'Overwhelmed', 'Anxious', 'Angry', 'Stressed', 'Tense',
  // Low Energy + Positive
  'Serene', 'Content', 'Tranquil', 'Relaxed', 'Peaceful', 'Calm', 'At Ease',
  // Low Energy + Negative
  'Exhausted', 'Depressed', 'Hopeless', 'Drained', 'Melancholic', 'Sad', 'Down',
  // Neutral / Edge
  'Neutral', 'Activated', 'Alert', 'Fatigued', 'Tired', 'Pleased', 'Okay', 'Uneasy', 'Displeased',
  // Additional emotions
  'Grateful', 'Confident', 'Hopeful', 'Lonely', 'Bored', 'Frustrated',
];
