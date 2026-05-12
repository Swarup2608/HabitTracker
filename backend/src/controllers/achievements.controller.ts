import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Achievement, ACHIEVEMENTS } from '../models/Achievement';
import { UserMonthlyChallenges } from '../models/MonthlyChallenges';
import { generateMonthlyChallenge, evaluateCompletedTasks } from '../services/challenges';
import { checkAndUnlockAchievements } from '../services/achievements';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Run the achievement check for this user and return any newly unlocked
 * achievements. Used on app load so achievements unlocked via past actions
 * (e.g. user already has 5 habits) get surfaced via the popup.
 */
export const checkAchievements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const unlockedAchievements = await checkAndUnlockAchievements(userId);
  res.json({ unlockedAchievements });
});

/**
 * Get all achievements (both unlocked and locked) for the user
 */
export const getAchievements = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  const unlockedAchievements = await Achievement.find({ user: userId })
    .lean()
    .sort({ unlockedAt: -1 });

  const unlockedCodes = new Set(unlockedAchievements.map((a) => a.code));

  const allAchievements = ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlockedCodes.has(achievement.code),
    unlockedAt: unlockedAchievements.find((a) => a.code === achievement.code)?.unlockedAt || null,
  }));

  res.json({
    total: ACHIEVEMENTS.length,
    unlocked: unlockedAchievements.length,
    achievements: allAchievements,
  });
});

/**
 * Get current month's challenge for the user
 */
export const getMonthlyChallenge = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const userObjectId = new Types.ObjectId(userId);
  const now = new Date();
  const currentMonth = `${String(now.getMonth() + 1).padStart(2, '0')}`; // MM format
  const currentYear = now.getFullYear();

  // Find or create user's current monthly challenge record
  let userChallenge = await UserMonthlyChallenges.findOne({
    user: userId,
    year: currentYear,
    month: currentMonth,
  }).lean();

  // Generate personalized challenges based on user's habits
  const monthlyTasks = await generateMonthlyChallenge(userObjectId);

  if (!userChallenge) {
    // Create new user challenge record
    const created = await UserMonthlyChallenges.create({
      user: userId,
      year: currentYear,
      month: currentMonth,
      completedTasks: [],
      completedAt: null,
    });
    userChallenge = created.toObject ? created.toObject() : (created as any);
  }

  // TypeScript type guard - ensure userChallenge is not null
  if (!userChallenge) {
    return res.status(500).json({ error: 'Failed to create monthly challenge' });
  }

  // Auto-evaluate which tasks the user has met based on real activity.
  const autoCompleted = await evaluateCompletedTasks(userObjectId, monthlyTasks);
  if (autoCompleted.length) {
    const existing = new Set(userChallenge.completedTasks ?? []);
    const merged = Array.from(new Set([...(userChallenge.completedTasks ?? []), ...autoCompleted]));
    const newlyCompleted = autoCompleted.some((id) => !existing.has(id));
    if (newlyCompleted) {
      const allDone = merged.length === monthlyTasks.length;
      await UserMonthlyChallenges.updateOne(
        { _id: (userChallenge as any)._id },
        {
          $set: {
            completedTasks: merged,
            ...(allDone && !userChallenge.completedAt ? { completedAt: new Date() } : {}),
          },
        }
      );
      userChallenge = { ...userChallenge, completedTasks: merged };
    }
  }

  res.json({
    currentMonth,
    currentYear,
    userChallenge: userChallenge,
    monthlyTasks: monthlyTasks,
    progress: {
      tasksCompleted: userChallenge.completedTasks.length,
      totalTasks: monthlyTasks.length,
      percentComplete: Math.round((userChallenge.completedTasks.length / monthlyTasks.length) * 100),
    },
  });
});

/**
 * Mark a monthly challenge task as completed
 */
export const completeMonthlyTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const { taskId } = req.body;

  if (!taskId) {
    return res.status(400).json({ error: 'taskId is required' });
  }

  const now = new Date();
  const currentMonth = `${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = now.getFullYear();

  const userChallenge = await UserMonthlyChallenges.findOneAndUpdate(
    {
      user: userId,
      year: currentYear,
      month: currentMonth,
    },
    {
      $addToSet: { completedTasks: taskId },
    },
    { new: true }
  );

  if (!userChallenge) {
    return res.status(404).json({ error: 'Monthly challenge not found' });
  }

  // Generate challenges to check total count
  const userObjectId = new Types.ObjectId(userId);
  const monthlyTasks = await generateMonthlyChallenge(userObjectId);
  const allTasksCompleted = userChallenge.completedTasks.length === monthlyTasks.length;

  if (allTasksCompleted && !userChallenge.completedAt) {
    userChallenge.completedAt = now;
    await userChallenge.save();
  }

  res.json({
    message: 'Task completed',
    userChallenge,
    allCompleted: allTasksCompleted,
  });
});

/**
 * Get all monthly challenges history for the user
 */
export const getMonthlyHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;

  const history = await UserMonthlyChallenges.find({ user: userId })
    .sort({ year: -1, month: -1 })
    .lean();

  res.json({
    total: history.length,
    completed: history.filter((h) => h.completedAt).length,
    history,
  });
});
