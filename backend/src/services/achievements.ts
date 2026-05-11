import { Types } from 'mongoose';
import { Habit } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';
import { User } from '../models/User';
import { Achievement, ACHIEVEMENTS } from '../models/Achievement';
import { levelForXp } from './leveling';
import { dayjs } from '../utils/date';

export interface UnlockedAchievement {
  code: string;
  title: string;
  description: string;
  icon: string;
}

/**
 * Unlock a single achievement
 */
export async function unlockAchievement(userId: string, code: string): Promise<boolean> {
  const def = ACHIEVEMENTS.find((a) => a.code === code);
  if (!def) return false;

  const result = await Achievement.updateOne(
    { user: userId, code },
    { $setOnInsert: { ...def, user: userId, unlockedAt: new Date() } },
    { upsert: true }
  );

  // Return true only if a new document was created (not already unlocked)
  return result.upsertedId ? true : false;
}

/**
 * Check and unlock all possible achievements for a user
 * Returns array of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(userId: string | Types.ObjectId): Promise<UnlockedAchievement[]> {
  const userIdStr = userId.toString();
  const unlockedAchievements: UnlockedAchievement[] = [];

  try {
    // Get user data
    const user = await User.findById(userId).lean();
    if (!user) return [];

    // Get habits count
    const habitCount = await Habit.countDocuments({ user: userId });

    // Habit count achievements
    const habitAchievements = [
      { code: 'first_habit', count: 1 },
      { code: 'habit_5', count: 5 },
      { code: 'habit_10', count: 10 },
      { code: 'habit_25', count: 25 },
    ];

    for (const { code, count } of habitAchievements) {
      if (habitCount >= count) {
        const unlocked = await unlockAchievement(userIdStr, code);
        if (unlocked) {
          const ach = ACHIEVEMENTS.find((a) => a.code === code);
          if (ach) unlockedAchievements.push(ach);
        }
      }
    }

    // Level achievements
    const level = user.level || 1;
    const levelAchievements = [
      { code: 'level_5', level: 5 },
      { code: 'level_10', level: 10 },
      { code: 'level_20', level: 20 },
      { code: 'level_50', level: 50 },
    ];

    for (const { code, level: targetLevel } of levelAchievements) {
      if (level >= targetLevel) {
        const unlocked = await unlockAchievement(userIdStr, code);
        if (unlocked) {
          const ach = ACHIEVEMENTS.find((a) => a.code === code);
          if (ach) unlockedAchievements.push(ach);
        }
      }
    }

    // Streak achievements - check all habits for streaks
    const habits = await Habit.find({ user: userId }).lean();
    if (habits.length > 0) {
      for (const habit of habits) {
        const logs = await HabitLog.find({ habit: habit._id })
          .sort({ date: -1 })
          .limit(365)
          .lean();

        // Calculate current streak
        let streak = 0;
        const today = dayjs.utc().startOf('day');
        for (let i = 0; i < 365; i++) {
          const checkDate = today.subtract(i, 'day').format('YYYY-MM-DD');
          const hasLog = logs.some((l) => l.dayKey === checkDate);
          if (hasLog) {
            streak++;
          } else if (i > 0) {
            // Allow 1 day gap at most (current day)
            break;
          }
        }

        // Check streak achievements
        const streakAchievements = [
          { code: 'streak_3', streak: 3 },
          { code: 'streak_7', streak: 7 },
          { code: 'streak_14', streak: 14 },
          { code: 'streak_30', streak: 30 },
          { code: 'streak_100', streak: 100 },
          { code: 'streak_365', streak: 365 },
        ];

        for (const { code, streak: targetStreak } of streakAchievements) {
          if (streak >= targetStreak) {
            const unlocked = await unlockAchievement(userIdStr, code);
            if (unlocked) {
              const ach = ACHIEVEMENTS.find((a) => a.code === code);
              if (ach) unlockedAchievements.push(ach);
            }
          }
        }

        // Check multiple streaks
        if (streak >= 7) {
          const activeStreakCount = await countActiveStreaks(userId);
          if (activeStreakCount >= 2) {
            const unlocked = await unlockAchievement(userIdStr, 'double_streak');
            if (unlocked) {
              const ach = ACHIEVEMENTS.find((a) => a.code === 'double_streak');
              if (ach) unlockedAchievements.push(ach);
            }
          }
          if (activeStreakCount >= 3) {
            const unlocked = await unlockAchievement(userIdStr, 'triple_streak');
            if (unlocked) {
              const ach = ACHIEVEMENTS.find((a) => a.code === 'triple_streak');
              if (ach) unlockedAchievements.push(ach);
            }
          }
        }
      }
    }

    // Completion achievements
    const logCount = await HabitLog.countDocuments({ user: userId });
    const completionAchievements = [
      { code: 'completions_100', count: 100 },
      { code: 'completions_500', count: 500 },
      { code: 'completions_1000', count: 1000 },
    ];

    for (const { code, count } of completionAchievements) {
      if (logCount >= count) {
        const unlocked = await unlockAchievement(userIdStr, code);
        if (unlocked) {
          const ach = ACHIEVEMENTS.find((a) => a.code === code);
          if (ach) unlockedAchievements.push(ach);
        }
      }
    }
  } catch (err) {
    console.error('Error checking achievements:', err);
  }

  return unlockedAchievements;
}

async function countActiveStreaks(userId: string | Types.ObjectId): Promise<number> {
  const habits = await Habit.find({ user: userId }).lean();
  let activeCount = 0;

  for (const habit of habits) {
    const logs = await HabitLog.find({ habit: habit._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    let streak = 0;
    const today = dayjs.utc().startOf('day');
    for (let i = 0; i < 30; i++) {
      const checkDate = today.subtract(i, 'day').format('YYYY-MM-DD');
      const hasLog = logs.some((l) => l.dayKey === checkDate);
      if (hasLog) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    if (streak >= 7) activeCount++;
  }

  return activeCount;
}
