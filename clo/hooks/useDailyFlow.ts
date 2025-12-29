/**
 * useDailyFlow Hook
 * 
 * Aggregates data from all three circles (Self, Relationships, Home)
 * into a unified chronological "Daily Flow" view.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { CircleType, ItemWithCircles } from '@/types/database';

// ============================================
// TYPES
// ============================================

export type DailyFlowCircle = 'SELF' | 'RELATIONSHIPS' | 'HOME';

export interface DailyFlowItem {
  id: string;
  title: string;
  description?: string | null;
  circle: DailyFlowCircle;
  itemType: 'TASK' | 'EVENT' | 'REMINDER' | 'ANNIVERSARY' | 'MAINTENANCE' | 'BILL';
  status: 'PENDING' | 'COMPLETED' | 'SNOOZED';
  
  // Time information
  hasTime: boolean; // If true, appears in timeline; if false, appears in "Anytime" stack
  startTime?: string; // ISO time string (e.g., "09:00")
  endTime?: string;
  
  // Source tracking for deep linking
  sourceTable: 'items' | 'relationship_capsules' | 'maintenance_schedules' | 'subscriptions' | 'shared_tasks';
  sourceId: string;
  
  // Optional metadata
  relatedPersonName?: string;
  relatedCapsuleId?: string;
  priority?: number;
  
  // For display
  icon?: string;
  dueDate: string; // ISO date
}

export interface DailyFlowData {
  date: string; // ISO date (YYYY-MM-DD)
  dayName: string;
  formattedDate: string;
  
  // Weather (can be mocked or from integration)
  weather?: {
    icon: string;
    temp: number;
    condition: string;
  };
  
  // Grouped items
  timedItems: DailyFlowItem[]; // Items with specific times, sorted chronologically
  anytimeItems: DailyFlowItem[]; // Items without times
  
  // Stats
  totalEvents: number;
  remainingTasks: number;
  completedTasks: number;
  freeTimeHours: number;
  
  // Circle breakdown
  selfCount: number;
  relationshipsCount: number;
  homeCount: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCircleFromCircles(circles: CircleType[]): DailyFlowCircle {
  // Priority: RELATIONSHIPS > HOME > SELF
  if (circles.includes('RELATIONSHIPS')) return 'RELATIONSHIPS';
  if (circles.includes('HOME')) return 'HOME';
  return 'SELF';
}

function formatDateForDisplay(date: Date): { dayName: string; formattedDate: string } {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
  const dayName = date.toLocaleDateString('en-US', options);
  
  const monthDay = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return { dayName, formattedDate: monthDay };
}

function extractTimeFromDate(dateString: string | null): { hasTime: boolean; time?: string } {
  if (!dateString) return { hasTime: false };
  
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // Check if time is midnight (00:00) - likely means no specific time
  if (hours === 0 && minutes === 0) {
    return { hasTime: false };
  }
  
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  return { hasTime: true, time: timeString };
}

function calculateFreeTime(timedItems: DailyFlowItem[]): number {
  if (timedItems.length === 0) return 16; // Assume 16 waking hours
  
  let busyMinutes = 0;
  
  timedItems.forEach(item => {
    if (item.startTime && item.endTime) {
      const [startH, startM] = item.startTime.split(':').map(Number);
      const [endH, endM] = item.endTime.split(':').map(Number);
      busyMinutes += (endH * 60 + endM) - (startH * 60 + startM);
    } else if (item.startTime) {
      busyMinutes += 60; // Assume 1 hour for items without end time
    }
  });
  
  const freeHours = Math.max(0, 16 - busyMinutes / 60);
  return Math.round(freeHours * 10) / 10;
}

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getDateRange(dateString: string): { start: string; end: string } {
  const start = `${dateString}T00:00:00.000Z`;
  const end = `${dateString}T23:59:59.999Z`;
  return { start, end };
}

// ============================================
// MAIN HOOK
// ============================================

export function useDailyFlow(date?: string) {
  const targetDate = date || getTodayDateString();
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['dailyFlow', targetDate],
    queryFn: async (): Promise<DailyFlowData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { start, end } = getDateRange(targetDate);
      const dateObj = new Date(targetDate);
      const { dayName, formattedDate } = formatDateForDisplay(dateObj);
      
      const items: DailyFlowItem[] = [];
      
      // 1. Fetch items from the universal items table
      const { data: itemsData, error: itemsError } = await supabase
        .from('items_with_circles')
        .select('*')
        .gte('due_date', start)
        .lte('due_date', end);
      
      if (!itemsError && itemsData) {
        itemsData.forEach((item: any) => {
          const { hasTime, time } = extractTimeFromDate(item.due_date);
          const circle = getCircleFromCircles(item.circles || ['SELF']);
          
          items.push({
            id: `item-${item.id}`,
            title: item.title,
            description: item.description,
            circle,
            itemType: item.item_type === 'EVENT' ? 'EVENT' : 'TASK',
            status: item.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
            hasTime,
            startTime: time,
            sourceTable: 'items',
            sourceId: item.id,
            priority: item.metadata?.priority || 2,
            dueDate: targetDate,
            icon: circle === 'SELF' ? '🟣' : circle === 'RELATIONSHIPS' ? '🟠' : '🟢',
          });
        });
      }
      
      // 2. Fetch maintenance schedules due today (HOME)
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .eq('is_active', true)
        .lte('next_due_at', end);
      
      if (!maintenanceError && maintenanceData) {
        maintenanceData.forEach((schedule: any) => {
          const dueDate = new Date(schedule.next_due_at);
          const scheduleDateStr = dueDate.toISOString().split('T')[0];
          
          // Only include if due today or overdue
          if (scheduleDateStr <= targetDate) {
            items.push({
              id: `maintenance-${schedule.id}`,
              title: schedule.title,
              description: schedule.description,
              circle: 'HOME',
              itemType: 'MAINTENANCE',
              status: 'PENDING',
              hasTime: false,
              sourceTable: 'maintenance_schedules',
              sourceId: schedule.id,
              priority: scheduleDateStr < targetDate ? 1 : 2, // Overdue = higher priority
              dueDate: targetDate,
              icon: '🔧',
            });
          }
        });
      }
      
      // 3. Fetch subscriptions billing today (HOME)
      const { data: subscriptionsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'ACTIVE')
        .eq('next_billing_date', targetDate);
      
      if (!subsError && subscriptionsData) {
        subscriptionsData.forEach((sub: any) => {
          items.push({
            id: `bill-${sub.id}`,
            title: `${sub.service_name} bill due`,
            description: `$${sub.cost} - ${sub.billing_cycle}`,
            circle: 'HOME',
            itemType: 'BILL',
            status: 'PENDING',
            hasTime: false,
            sourceTable: 'subscriptions',
            sourceId: sub.id,
            priority: 1, // Bills are high priority
            dueDate: targetDate,
            icon: '💳',
          });
        });
      }
      
      // 4. Fetch shared tasks from relationship capsules due today
      const { data: sharedTasksData, error: tasksError } = await supabase
        .from('shared_tasks')
        .select('*, relationship_capsules!inner(id, invite_email)')
        .eq('is_completed', false)
        .gte('due_date', start)
        .lte('due_date', end);
      
      if (!tasksError && sharedTasksData) {
        sharedTasksData.forEach((task: any) => {
          const { hasTime, time } = extractTimeFromDate(task.due_date);
          items.push({
            id: `shared-task-${task.id}`,
            title: task.title,
            description: task.description,
            circle: 'RELATIONSHIPS',
            itemType: 'TASK',
            status: task.is_completed ? 'COMPLETED' : 'PENDING',
            hasTime,
            startTime: time,
            sourceTable: 'shared_tasks',
            sourceId: task.id,
            relatedCapsuleId: task.capsule_id,
            relatedPersonName: task.relationship_capsules?.invite_email,
            priority: 2,
            dueDate: targetDate,
            icon: '👥',
          });
        });
      }
      
      // 5. Mock external calendar events (can be replaced with real integration)
      // This simulates what would come from Google Calendar, Apple Calendar, etc.
      const mockCalendarEvents: DailyFlowItem[] = [];
      
      // Only add mock events if we don't have real timed events
      const realTimedEvents = items.filter(i => i.hasTime);
      if (realTimedEvents.length === 0) {
        // Add some contextual mock events based on day of week
        const dayOfWeek = dateObj.getDay();
        
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          // Weekday mock
          mockCalendarEvents.push({
            id: 'mock-standup',
            title: 'Team Standup',
            description: 'Daily sync with the team',
            circle: 'SELF',
            itemType: 'EVENT',
            status: 'PENDING',
            hasTime: true,
            startTime: '09:30',
            endTime: '09:45',
            sourceTable: 'items',
            sourceId: 'mock',
            dueDate: targetDate,
            icon: '📅',
          });
        }
      }
      
      const allItems = [...items, ...mockCalendarEvents];
      
      // Separate into timed and anytime
      const timedItems = allItems
        .filter(item => item.hasTime)
        .sort((a, b) => {
          if (!a.startTime || !b.startTime) return 0;
          return a.startTime.localeCompare(b.startTime);
        });
      
      const anytimeItems = allItems
        .filter(item => !item.hasTime)
        .sort((a, b) => {
          // Sort by priority, then by circle
          if (a.priority !== b.priority) {
            return (a.priority || 2) - (b.priority || 2);
          }
          const circleOrder = { RELATIONSHIPS: 0, HOME: 1, SELF: 2 };
          return circleOrder[a.circle] - circleOrder[b.circle];
        });
      
      // Calculate stats
      const totalEvents = timedItems.length;
      const remainingTasks = anytimeItems.filter(i => i.status !== 'COMPLETED').length;
      const completedTasks = allItems.filter(i => i.status === 'COMPLETED').length;
      const freeTimeHours = calculateFreeTime(timedItems);
      
      // Circle breakdown
      const selfCount = allItems.filter(i => i.circle === 'SELF').length;
      const relationshipsCount = allItems.filter(i => i.circle === 'RELATIONSHIPS').length;
      const homeCount = allItems.filter(i => i.circle === 'HOME').length;
      
      // Mock weather (can be replaced with real integration)
      const weather = {
        icon: '🌤️',
        temp: 52,
        condition: 'Partly Cloudy',
      };
      
      return {
        date: targetDate,
        dayName,
        formattedDate,
        weather,
        timedItems,
        anytimeItems,
        totalEvents,
        remainingTasks,
        completedTasks,
        freeTimeHours,
        selfCount,
        relationshipsCount,
        homeCount,
      };
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCompleteFlowItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: DailyFlowItem) => {
      if (item.sourceTable === 'items') {
        const { error } = await (supabase
          .from('items') as any)
          .update({ status: 'COMPLETED' })
          .eq('id', item.sourceId);
        if (error) throw error;
      } else if (item.sourceTable === 'shared_tasks') {
        const { error } = await (supabase
          .from('shared_tasks') as any)
          .update({ is_completed: true, completed_at: new Date().toISOString() })
          .eq('id', item.sourceId);
        if (error) throw error;
      } else if (item.sourceTable === 'maintenance_schedules') {
        // Complete maintenance and reschedule
        const { data: schedule } = await supabase
          .from('maintenance_schedules')
          .select('frequency_days')
          .eq('id', item.sourceId)
          .single() as { data: { frequency_days: number } | null };
        
        if (schedule) {
          const nextDue = new Date();
          nextDue.setDate(nextDue.getDate() + (schedule.frequency_days || 30));
          
          const { error } = await (supabase
            .from('maintenance_schedules') as any)
            .update({
              last_completed_at: new Date().toISOString(),
              next_due_at: nextDue.toISOString(),
            })
            .eq('id', item.sourceId);
          if (error) throw error;
        }
      }
      
      return item;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['dailyFlow'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

export function useSnoozeFlowItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ item, days = 1 }: { item: DailyFlowItem; days?: number }) => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + days);
      const newDateStr = newDate.toISOString();
      
      if (item.sourceTable === 'items') {
        const { error } = await (supabase
          .from('items') as any)
          .update({ due_date: newDateStr })
          .eq('id', item.sourceId);
        if (error) throw error;
      } else if (item.sourceTable === 'shared_tasks') {
        const { error } = await (supabase
          .from('shared_tasks') as any)
          .update({ due_date: newDateStr })
          .eq('id', item.sourceId);
        if (error) throw error;
      }
      
      return item;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      queryClient.invalidateQueries({ queryKey: ['dailyFlow'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

// ============================================
// BACKLOG HOOK (for "Plan" button)
// ============================================

export function useBacklogItems() {
  return useQuery({
    queryKey: ['backlog'],
    queryFn: async (): Promise<DailyFlowItem[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Fetch items without due dates or with past due dates that aren't completed
      const { data, error } = await supabase
        .from('items_with_circles')
        .select('*')
        .neq('status', 'COMPLETED')
        .or('due_date.is.null,due_date.lt.now()');
      
      if (error) throw error;
      
      return (data || []).map((item: any) => {
        const circle = getCircleFromCircles(item.circles || ['SELF']);
        return {
          id: `backlog-${item.id}`,
          title: item.title,
          description: item.description,
          circle,
          itemType: item.item_type === 'EVENT' ? 'EVENT' : 'TASK',
          status: 'PENDING' as const,
          hasTime: false,
          sourceTable: 'items' as const,
          sourceId: item.id,
          priority: item.metadata?.priority || 2,
          dueDate: getTodayDateString(),
          icon: circle === 'SELF' ? '🟣' : circle === 'RELATIONSHIPS' ? '🟠' : '🟢',
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddToToday() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      const today = new Date();
      today.setHours(12, 0, 0, 0); // Set to noon today
      
      const { error } = await (supabase
        .from('items') as any)
        .update({ due_date: today.toISOString() })
        .eq('id', itemId);
      
      if (error) throw error;
      return itemId;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['dailyFlow'] });
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
