import { Types } from 'mongoose';
import { Habit } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';
import { dayjs } from '../utils/date';

export interface GeneratedChallenge {
  id: string;
  title: string;
  description: string;
  objective: string;
  difficulty: 'easy' | 'medium' | 'hard';
  reward: string;
  icon: string;
  targetValue?: number;
}

/**
 * Generate 3 personalized challenges based on user's habits
 */
export async function generateMonthlyChallenge(userId: Types.ObjectId): Promise<GeneratedChallenge[]> {
  const habits = await Habit.find({ user: userId, status: 'active' }).lean();

  if (!habits.length) {
    return getDefaultChallenges();
  }

  const challenges: GeneratedChallenge[] = [];

  // Challenge 1: Consistency based on number of active habits
  const consistencyChallenge = generateConsistencyChallenge(habits.length);
  challenges.push(consistencyChallenge);

  // Challenge 2: Streak building based on user's habits
  const streakChallenge = generateStreakChallenge(habits.length);
  challenges.push(streakChallenge);

  // Challenge 3: Volume/completion challenge
  const volumeChallenge = generateVolumeChallenge(habits.length);
  challenges.push(volumeChallenge);

  return challenges;
}

function generateConsistencyChallenge(habitCount: number): GeneratedChallenge {
  const days = Math.min(Math.ceil(28 / Math.max(1, habitCount)), 30); // Scale based on habit count
  const daysText = days === 30 ? 'the entire month' : `${days} days`;

  return {
    id: 'challenge_consistency',
    title: '🔥 Consistency Streak',
    description: `Build an unbreakable habit streak by logging all ${habitCount} habit${habitCount > 1 ? 's' : ''} every day`,
    objective: `Log all your active habits for ${daysText} without missing a single day`,
    difficulty: habitCount > 5 ? 'hard' : habitCount > 3 ? 'medium' : 'easy',
    reward: '💪 Consistency Master Badge',
    icon: 'Flame',
    targetValue: days,
  };
}

function generateStreakChallenge(habitCount: number): GeneratedChallenge {
  const targetHabits = Math.max(1, Math.ceil(habitCount / 2)); // Target 50% of habits
  const targetStreak = targetHabits > 3 ? 14 : 7; // 2 weeks for many habits, 1 week for few

  return {
    id: 'challenge_streak',
    title: '⚡ Streak Master',
    description: `Push ${targetHabits} of your habits to a ${targetStreak}-day streak`,
    objective: `Achieve a ${targetStreak}-day streak on at least ${targetHabits} different habit${targetHabits > 1 ? 's' : ''}`,
    difficulty: targetStreak > 14 ? 'hard' : 'medium',
    reward: '⚡ Momentum Builder Badge',
    icon: 'Zap',
    targetValue: targetStreak,
  };
}

function generateVolumeChallenge(habitCount: number): GeneratedChallenge {
  // Calculate target completions based on habit count and expected daily volume
  const daysInMonth = 30;
  const expectedCompletions = habitCount * daysInMonth;
  const targetCompletions = Math.ceil(expectedCompletions * 0.7); // Target 70% of expected

  return {
    id: 'challenge_volume',
    title: '🎯 Completion Master',
    description: `Rack up ${targetCompletions} total habit completions this month`,
    objective: `Log at least ${targetCompletions} habit completions across all your habits`,
    difficulty: habitCount > 5 ? 'hard' : 'medium',
    reward: '🏆 Prolific Achiever Badge',
    icon: 'Target',
    targetValue: targetCompletions,
  };
}

function getDefaultChallenges(): GeneratedChallenge[] {
  return [
    {
      id: 'challenge_first_habit',
      title: '🚀 Getting Started',
      description: 'Create your first habit and start your journey',
      objective: 'Create at least 1 new habit this month',
      difficulty: 'easy',
      reward: '🌟 First Step Badge',
      icon: 'Sparkles',
    },
    {
      id: 'challenge_daily_habit',
      title: '📝 Daily Logger',
      description: 'Log your habits consistently',
      objective: 'Log a habit at least once a day for 7 days',
      difficulty: 'easy',
      reward: '📊 Daily Habit Badge',
      icon: 'Calendar',
    },
    {
      id: 'challenge_todos',
      title: '✅ Task Manager',
      description: 'Stay on top of your tasks',
      objective: 'Complete at least 10 todos this month',
      difficulty: 'easy',
      reward: '✨ Organized Badge',
      icon: 'CheckSquare',
    },
  ];
}
