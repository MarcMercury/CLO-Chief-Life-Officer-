/**
 * useSelf Hooks
 * 
 * React Query hooks for Self module features.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as selfService from '@/services/selfService';
import * as healthService from '@/services/healthService';

// ============================================
// DAILY INTENTIONS
// ============================================

export function useDailyIntentions(date?: string) {
  return useQuery({
    queryKey: ['dailyIntentions', date || 'today'],
    queryFn: () => selfService.getDailyIntentions(date),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpsertIntention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slotNumber, intentionText, date }: { 
      slotNumber: 1 | 2 | 3; 
      intentionText: string;
      date?: string;
    }) => selfService.upsertDailyIntention(slotNumber, intentionText, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyIntentions'] });
    },
  });
}

export function useToggleIntention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      selfService.toggleIntentionComplete(id, completed),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['dailyIntentions'] });
    },
  });
}

// ============================================
// SKILLS (LEARN LIST)
// ============================================

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: selfService.getSkills,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ skillName, category }: { skillName: string; category?: string }) =>
      selfService.createSkill(skillName, category),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useUpdateSkillProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      selfService.updateSkillProgress(id, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selfService.deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });
}

// ============================================
// READ LIST
// ============================================

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: selfService.getBooks,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, author }: { title: string; author?: string }) =>
      selfService.createBook(title, author),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBookStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: selfService.Book['status'] }) =>
      selfService.updateBookStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { 
      id: string; 
      updates: { title?: string; author?: string; notes?: string; rating?: number; progress?: number; status?: selfService.Book['status'] } 
    }) => selfService.updateBook(id, updates),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selfService.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

// ============================================
// MOOD LOGS
// ============================================

export function useMoodLogs(limit = 30) {
  return useQuery({
    queryKey: ['moodLogs', limit],
    queryFn: () => selfService.getMoodLogs(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTodaysMood() {
  return useQuery({
    queryKey: ['todaysMood'],
    queryFn: selfService.getTodaysMood,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ energyLevel, pleasureLevel, emotionLabel, notes }: {
      energyLevel: number;
      pleasureLevel: number;
      emotionLabel?: string;
      notes?: string;
    }) => selfService.logMood(energyLevel, pleasureLevel, emotionLabel, notes),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['moodLogs'] });
      queryClient.invalidateQueries({ queryKey: ['todaysMood'] });
    },
  });
}

// ============================================
// GRATITUDE
// ============================================

export function useGratitude(limit = 30) {
  return useQuery({
    queryKey: ['gratitude', limit],
    queryFn: () => selfService.getGratitudeEntries(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTodaysGratitude() {
  return useQuery({
    queryKey: ['todaysGratitude'],
    queryFn: selfService.getTodaysGratitude,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddGratitude() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selfService.addGratitude,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['gratitude'] });
      queryClient.invalidateQueries({ queryKey: ['todaysGratitude'] });
    },
  });
}

// ============================================
// CAREER GOALS
// ============================================

export function useCareerGoals() {
  return useQuery({
    queryKey: ['careerGoals'],
    queryFn: selfService.getCareerGoals,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCareerGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalText, priority }: { goalText: string; priority?: number }) =>
      selfService.createCareerGoal(goalText, priority),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['careerGoals'] });
    },
  });
}

export function useToggleCareerGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      selfService.toggleCareerGoal(id, completed),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['careerGoals'] });
    },
  });
}

export function useDeleteCareerGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selfService.deleteCareerGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerGoals'] });
    },
  });
}

// ============================================
// NETWORKING
// ============================================

export function useTodaysNetworking() {
  return useQuery({
    queryKey: ['networking', 'today'],
    queryFn: selfService.getTodaysNetworking,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddNetworkingContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactName, contactInfo }: { contactName: string; contactInfo?: string }) =>
      selfService.addNetworkingContact(contactName, contactInfo),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['networking'] });
    },
  });
}

export function useMarkContacted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, contacted }: { id: string; contacted: boolean }) =>
      selfService.markContacted(id, contacted),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['networking'] });
    },
  });
}

export function useDeleteNetworkingContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selfService.deleteNetworkingContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['networking'] });
    },
  });
}

// ============================================
// IDEA VAULT
// ============================================

export function useIdeas() {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: selfService.getIdeas,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ideaTitle, ideaContent, category, color }: { 
      ideaTitle: string; 
      ideaContent?: string;
      category?: string;
      color?: string;
    }) => selfService.createIdea(ideaTitle, ideaContent, category, color),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useUpdateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<selfService.Idea> }) =>
      selfService.updateIdea(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useDeleteIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selfService.deleteIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

// ============================================
// FINANCIAL PULSE
// ============================================

export function useTodaysSpending() {
  return useQuery({
    queryKey: ['spending', 'today'],
    queryFn: selfService.getTodaysSpending,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAddSpending() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount, description, category }: { 
      amount: number; 
      description?: string;
      category?: string;
    }) => selfService.addSpending(amount, description, category),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['spending'] });
    },
  });
}

export function useBudgetSettings() {
  return useQuery({
    queryKey: ['budgetSettings'],
    queryFn: selfService.getBudgetSettings,
    staleTime: 1000 * 60 * 30,
  });
}

export function useUpsertBudgetSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selfService.upsertBudgetSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetSettings'] });
    },
  });
}

// ============================================
// HEALTH (from healthService)
// ============================================

export function useHealthMetrics() {
  return useQuery({
    queryKey: ['healthMetrics'],
    queryFn: healthService.getHealthMetrics,
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}

export function useHealthGoals() {
  return useQuery({
    queryKey: ['healthGoals'],
    queryFn: healthService.getHealthGoals,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateHealthGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: healthService.createHealthGoal,
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['healthGoals'] });
    },
  });
}

export function useUpdateHealthGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, amount, mode }: { 
      goalId: string; 
      amount: number;
      mode?: 'add' | 'set';
    }) => healthService.updateHealthGoalProgress(goalId, amount, mode),
    onSuccess: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      queryClient.invalidateQueries({ queryKey: ['healthGoals'] });
    },
  });
}

export function useDeleteHealthGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: healthService.deleteHealthGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthGoals'] });
    },
  });
}
