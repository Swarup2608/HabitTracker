import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Habit, HabitLog } from '@/lib/types';
import { useAchievementQueue } from '@/stores/achievements';

export interface UnlockedAchievement {
  code: string;
  title: string;
  description: string;
  icon: string;
}

export interface CompleteHabitResponse {
  habit: Habit;
  log: HabitLog;
  targetReached: boolean;
  targetProgress: number;
  targetTotal: number | null;
  unlockedAchievements?: UnlockedAchievement[];
}

export interface CreateHabitResponse {
  habit: Habit;
  unlockedAchievements?: UnlockedAchievement[];
}

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: async () => (await api.get<{ habits: Habit[] }>('/habits')).data.habits,
  });
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: ['habit', id],
    queryFn: async () => (await api.get<{ habit: Habit }>(`/habits/${id}`)).data.habit,
    enabled: !!id,
  });
}

export function useHabitLogs(id: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['habit-logs', id, page, limit],
    queryFn: async () =>
      (
        await api.get<{ items: HabitLog[]; total: number; hasMore: boolean }>(
          `/habits/${id}/logs?page=${page}&limit=${limit}`
        )
      ).data,
    enabled: !!id,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  const enqueueAchievements = useAchievementQueue((s) => s.enqueue);
  return useMutation({
    mutationFn: async (input: Partial<Habit>) => {
      const response = await api.post<CreateHabitResponse>('/habits', input);
      return response.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      enqueueAchievements(data.unlockedAchievements);
    },
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Habit> & { id: string }) =>
      (await api.patch<{ habit: Habit }>(`/habits/${id}`, input)).data.habit,
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['habit', vars.id] });
      qc.invalidateQueries({ queryKey: ['habit-logs', vars.id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/habits/${id}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useCompleteHabit() {
  const qc = useQueryClient();
  const enqueueAchievements = useAchievementQueue((s) => s.enqueue);
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: {
      id: string;
      date?: string;
      mood?: string;
      energy?: number;
      minutes?: number;
      notes?: string;
      feedback?: string;
    }) => {
      const response = await api.post<CompleteHabitResponse>(`/habits/${id}/complete`, input);
      return response.data;
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['habit', vars.id] });
      qc.invalidateQueries({ queryKey: ['habit-logs', vars.id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      enqueueAchievements(data.unlockedAchievements);
    },
  });
}

export function useUpdateLog(habitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      logId,
      ...input
    }: {
      logId: string;
      notes?: string;
      mood?: string;
      energy?: number;
      minutes?: number;
      feedback?: string;
    }) => (await api.patch(`/habits/${habitId}/logs/${logId}`, input)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habit-logs', habitId] });
    },
  });
}

export function useDeleteLog(habitId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (logId: string) => (await api.delete(`/habits/${habitId}/logs/${logId}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habit-logs', habitId] });
      qc.invalidateQueries({ queryKey: ['habit', habitId] });
      qc.invalidateQueries({ queryKey: ['habits'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
