/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck - Tables not yet in generated types. Remove after running migration.
/**
 * Health Service
 * 
 * Mock data for health integrations.
 * Structured to be replaced by react-native-health and Oura API later.
 */

import { supabase } from '@/lib/supabase';

// Type helper for tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const from = (table: string) => (supabase as any).from(table);
// eslint-disable-next-line @typescript-eslint/no-explicit-any  
const auth = () => (supabase as any).auth;

// ============================================
// TYPES
// ============================================

export interface HealthMetrics {
  steps: {
    value: number;
    goal: number;
    lastUpdated: Date;
  };
  heartRate: {
    average: number;
    resting: number;
    lastUpdated: Date;
  };
  sleepScore: {
    score: number; // 0-100
    duration: number; // hours
    lastUpdated: Date;
  };
}

export interface HealthGoal {
  id: string;
  user_id: string;
  goal_name: string;
  target_value: number;
  current_value: number;
  unit: string;
  goal_type: 'daily' | 'weekly' | 'monthly';
  resets_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthGoalInput {
  goal_name: string;
  target_value: number;
  unit: string;
  goal_type?: 'daily' | 'weekly' | 'monthly';
}

// ============================================
// MOCK DATA (Replace with real integrations)
// ============================================

/**
 * Get mock health metrics
 * This simulates data that would come from Apple Health, Google Fit, or Oura
 */
export async function getHealthMetrics(): Promise<HealthMetrics> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate realistic mock data with some daily variation
  const dayOfWeek = new Date().getDay();
  const hourOfDay = new Date().getHours();
  
  // Steps increase throughout the day
  const baseSteps = 2000 + (hourOfDay * 400);
  const stepsVariation = Math.floor(Math.random() * 1000);
  
  return {
    steps: {
      value: Math.min(baseSteps + stepsVariation, 12000),
      goal: 10000,
      lastUpdated: new Date(),
    },
    heartRate: {
      average: 68 + Math.floor(Math.random() * 10),
      resting: 58 + Math.floor(Math.random() * 6),
      lastUpdated: new Date(),
    },
    sleepScore: {
      score: 70 + Math.floor(Math.random() * 25), // 70-95 range
      duration: 6.5 + (Math.random() * 2), // 6.5-8.5 hours
      lastUpdated: new Date(new Date().setHours(8, 0, 0, 0)), // This morning
    },
  };
}

/**
 * Check if health integrations are connected
 * Returns mock status - will be replaced with real integration checks
 */
export async function getIntegrationStatus(): Promise<{
  appleHealth: boolean;
  googleFit: boolean;
  oura: boolean;
}> {
  return {
    appleHealth: false,
    googleFit: false,
    oura: false,
  };
}

// ============================================
// HEALTH GOALS (Database Operations)
// ============================================

/**
 * Get all health goals for the current user
 */
export async function getHealthGoals(): Promise<HealthGoal[]> {
  const { data: { user } } = await auth().getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('health_goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch health goals:', error);
    return [];
  }

  return data || [];
}

/**
 * Create a new health goal
 */
export async function createHealthGoal(input: HealthGoalInput): Promise<HealthGoal | null> {
  const { data: { user } } = await auth().getUser();
  if (!user) throw new Error('Not authenticated');

  // Calculate reset time for daily goals
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('health_goals')
    .insert({
      user_id: user.id,
      goal_name: input.goal_name,
      target_value: input.target_value,
      current_value: 0,
      unit: input.unit,
      goal_type: input.goal_type || 'daily',
      resets_at: input.goal_type === 'daily' ? tomorrow.toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create health goal:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update progress on a health goal
 */
export async function updateHealthGoalProgress(
  goalId: string, 
  amount: number,
  mode: 'add' | 'set' = 'add'
): Promise<HealthGoal | null> {
  // Get current value first if we're adding
  if (mode === 'add') {
    const { data: current } = await supabase
      .from('health_goals')
      .select('current_value')
      .eq('id', goalId)
      .single();

    if (current) {
      amount = (current.current_value || 0) + amount;
    }
  }

  const { data, error } = await supabase
    .from('health_goals')
    .update({ 
      current_value: Math.max(0, amount),
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update health goal:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a health goal
 */
export async function deleteHealthGoal(goalId: string): Promise<void> {
  const { error } = await supabase
    .from('health_goals')
    .delete()
    .eq('id', goalId);

  if (error) {
    console.error('Failed to delete health goal:', error);
    throw new Error(error.message);
  }
}

/**
 * Reset daily goals (should be called by a cron job or on app open)
 */
export async function resetDailyGoals(): Promise<void> {
  const now = new Date();
  
  const { error } = await supabase
    .from('health_goals')
    .update({ 
      current_value: 0,
      resets_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('goal_type', 'daily')
    .lt('resets_at', now.toISOString());

  if (error) {
    console.error('Failed to reset daily goals:', error);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate progress percentage for a health goal
 */
export function calculateGoalProgress(goal: HealthGoal): number {
  if (goal.target_value <= 0) return 0;
  return Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
}

/**
 * Get a friendly display string for a health goal
 */
export function formatGoalProgress(goal: HealthGoal): string {
  return `${goal.current_value}/${goal.target_value} ${goal.unit}`;
}
