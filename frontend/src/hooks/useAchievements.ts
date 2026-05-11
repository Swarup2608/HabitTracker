import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementsData {
  total: number;
  unlocked: number;
  achievements: Achievement[];
}

interface MonthlyChallengeTask {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: string;
  icon: string;
  targetValue?: number;
}

interface MonthlyChallengeData {
  currentMonth: string;
  currentYear: number;
  monthlyTasks: MonthlyChallengeTask[];
  userChallenge: {
    completedTasks: string[];
  };
  progress: {
    tasksCompleted: number;
    totalTasks: number;
    percentComplete: number;
  };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await api.get('/achievements/list');
        setAchievements(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return { achievements, loading, error };
}

export function useMonthlyChallenge() {
  const [challenge, setChallenge] = useState<MonthlyChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await api.get('/achievements/challenges/current');
        setChallenge(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch monthly challenge');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, []);

  const completeTask = async (taskId: string) => {
    try {
      const response = await api.post('/achievements/challenges/complete', { taskId });
      setChallenge(response.data as any);
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to complete task');
    }
  };

  return { challenge, loading, error, completeTask };
}
