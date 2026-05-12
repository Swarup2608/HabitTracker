export type ThemeMode = 'light' | 'dark' | 'gaming' | 'fantasy';

export interface User {
  _id: string;
  id?: string;
  email: string;
  username: string;
  avatarUrl?: string;
  timezone: string;
  theme: ThemeMode;
  notifications: { email: boolean; push: boolean; daily: boolean };
  xp: number;
  level: number;
  createdAt: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type TargetMetric = 'completions' | 'streak' | 'days';
export type Mood = 'awful' | 'bad' | 'okay' | 'good' | 'great';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Habit {
  _id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: string;
  difficulty: Difficulty;
  status: HabitStatus;
  targetPerWeek: number;
  estimatedMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  totalMinutes: number;
  xpEarned: number;
  lastCompletedAt?: string;
  startedAt: string;
  order: number;
  targetDays?: number | null;
  targetMetric?: TargetMetric | null;
  targetReachedAt?: string | null;
  createdAt: string;
}

export interface HabitLog {
  _id: string;
  habit: string;
  date: string;
  dayKey: string;
  completed: boolean;
  minutes: number;
  mood?: Mood;
  energy?: number;
  notes?: string;
  feedback?: string;
  xpAwarded: number;
}

export interface Todo {
  _id: string;
  title: string;
  notes?: string;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  dayKey: string;
  order: number;
  imageUrl?: string;
  link?: string;
  location?: string;
}

export interface Achievement {
  _id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface DashboardSummary {
  user: {
    username: string;
    xp: number;
    level: number;
    levelInto: number;
    levelSpan: number;
    levelPercent: number;
  };
  metrics: {
    consistencyRate: number;
    currentStreak: number;
    longestStreak: number;
    completionPct: number;
    productivityScore: number;
    habitVelocity: number;
    burnoutRisk: 'low' | 'medium' | 'high';
    activeHabits: number;
    completedToday: number;
  };
  weekly: { day: string; completions: number }[];
  monthly: { week: string; completions: number }[];
  heatmap: { day: string; count: number }[];
  achievements: Achievement[];
  topHabits: {
    id: string;
    name: string;
    icon: string;
    color: string;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  }[];
}
