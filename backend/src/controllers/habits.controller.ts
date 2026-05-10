import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Habit, XP_BY_DIFFICULTY } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';
import { User } from '../models/User';
import { Achievement, ACHIEVEMENTS } from '../models/Achievement';
import { ApiError } from '../utils/ApiError';
import { dayKey, dayjs } from '../utils/date';
import { levelForXp } from '../services/leveling';
import { redis } from '../config/redis';

const dashKey = (userId: string) => `dash:${userId}`;

async function invalidateDash(userId: string) {
  await redis.del(dashKey(userId));
}

export async function list(req: Request, res: Response) {
  const habits = await Habit.find({ user: req.user!.sub }).sort({ order: 1, createdAt: 1 }).lean();
  res.json({ habits });
}

export async function get(req: Request, res: Response) {
  const habit = await Habit.findOne({ _id: req.params.id, user: req.user!.sub }).lean();
  if (!habit) throw new ApiError(404, 'Habit not found');
  res.json({ habit });
}

export async function create(req: Request, res: Response) {
  const habit = await Habit.create({ ...req.body, user: req.user!.sub });
  await invalidateDash(req.user!.sub);

  const count = await Habit.countDocuments({ user: req.user!.sub });
  if (count === 1) {
    await unlockAchievement(req.user!.sub, 'first_habit');
  }
  res.status(201).json({ habit });
}

export async function update(req: Request, res: Response) {
  const patch: Record<string, unknown> = { ...req.body };
  if (typeof patch.startedAt === 'string') {
    const d = dayjs.utc(patch.startedAt).startOf('day');
    if (!d.isValid()) throw new ApiError(400, 'Invalid startedAt');
    if (d.isAfter(dayjs.utc().startOf('day'))) throw new ApiError(400, 'Start date cannot be in the future');
    patch.startedAt = d.toDate();
  }
  const habit = await Habit.findOneAndUpdate(
    { _id: req.params.id, user: req.user!.sub },
    { $set: patch },
    { new: true }
  );
  if (!habit) throw new ApiError(404, 'Habit not found');

  // If startedAt moved forward, drop logs before it
  if (patch.startedAt) {
    const cutoff = dayKey(patch.startedAt as Date);
    await HabitLog.deleteMany({ habit: habit._id, dayKey: { $lt: cutoff } });
    await recomputeHabitStats(habit._id.toString(), req.user!.sub);
  }

  await invalidateDash(req.user!.sub);
  const fresh = await Habit.findById(habit._id).lean();
  res.json({ habit: fresh });
}

export async function remove(req: Request, res: Response) {
  const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user!.sub });
  if (!habit) throw new ApiError(404, 'Habit not found');
  await HabitLog.deleteMany({ habit: habit._id });
  await invalidateDash(req.user!.sub);
  res.json({ ok: true });
}

export async function complete(req: Request, res: Response) {
  const userId = req.user!.sub;
  const habit = await Habit.findOne({ _id: req.params.id, user: userId });
  if (!habit) throw new ApiError(404, 'Habit not found');
  if (habit.status !== 'active') throw new ApiError(400, 'Habit is not active');

  // Resolve target date
  const todayKey = dayKey();
  const targetKey: string = req.body.date ?? todayKey;
  const targetDay = dayjs.utc(targetKey).startOf('day');
  if (!targetDay.isValid()) throw new ApiError(400, 'Invalid date');

  const startKey = dayKey(habit.startedAt);
  if (targetKey < startKey) throw new ApiError(400, 'Date is before this habit was started');
  if (targetKey > todayKey) throw new ApiError(400, 'Date cannot be in the future');

  const existing = await HabitLog.findOne({ habit: habit._id, dayKey: targetKey });
  if (existing) throw new ApiError(409, 'Already completed on that date');

  const xp = XP_BY_DIFFICULTY[habit.difficulty];
  const minutes = req.body.minutes ?? habit.estimatedMinutes;

  const log = await HabitLog.create({
    user: userId,
    habit: habit._id,
    date: targetDay.toDate(),
    dayKey: targetKey,
    completed: true,
    minutes,
    mood: req.body.mood,
    energy: req.body.energy,
    notes: req.body.notes,
    feedback: req.body.feedback,
    xpAwarded: xp,
  });

  await recomputeHabitStats(habit._id.toString(), userId);

  // Award XP to the user (only ever increments — historical logs still grant XP)
  const user = await User.findById(userId);
  if (user) {
    user.xp += xp;
    user.level = levelForXp(user.xp);
    await user.save();
    await maybeUnlockLevel(userId, user.level);
  }

  const fresh = await Habit.findById(habit._id).lean();
  if (fresh) await maybeUnlockStreak(userId, fresh.currentStreak);

  await invalidateDash(userId);
  res.status(201).json({ habit: fresh, log });
}

export async function logs(req: Request, res: Response) {
  const { id } = req.params;
  const { page, limit } = req.query as unknown as { page: number; limit: number };

  if (!Types.ObjectId.isValid(id)) throw new ApiError(400, 'Invalid habit id');
  const habit = await Habit.findOne({ _id: id, user: req.user!.sub }).lean();
  if (!habit) throw new ApiError(404, 'Habit not found');

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    HabitLog.find({ habit: habit._id }).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    HabitLog.countDocuments({ habit: habit._id }),
  ]);

  res.json({ items, page, limit, total, hasMore: skip + items.length < total });
}

export async function updateLog(req: Request, res: Response) {
  const { id, logId } = req.params;
  const habit = await Habit.findOne({ _id: id, user: req.user!.sub }).lean();
  if (!habit) throw new ApiError(404, 'Habit not found');
  const log = await HabitLog.findOneAndUpdate(
    { _id: logId, habit: habit._id },
    { $set: req.body },
    { new: true }
  );
  if (!log) throw new ApiError(404, 'Log not found');
  res.json({ log });
}

export async function deleteLog(req: Request, res: Response) {
  const userId = req.user!.sub;
  const { id, logId } = req.params;
  const habit = await Habit.findOne({ _id: id, user: userId });
  if (!habit) throw new ApiError(404, 'Habit not found');
  const log = await HabitLog.findOneAndDelete({ _id: logId, habit: habit._id });
  if (!log) throw new ApiError(404, 'Log not found');

  await recomputeHabitStats(habit._id.toString(), userId);

  // Decrement user XP for this log (clamped at 0)
  const user = await User.findById(userId);
  if (user) {
    user.xp = Math.max(0, user.xp - (log.xpAwarded ?? 0));
    user.level = levelForXp(user.xp);
    await user.save();
  }

  await invalidateDash(userId);
  res.json({ ok: true });
}

async function recomputeHabitStats(habitId: string, _userId: string) {
  const logs = await HabitLog.find({ habit: habitId, completed: true })
    .sort({ dayKey: 1 })
    .select('dayKey minutes xpAwarded')
    .lean();

  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  let totalCompletions = 0;
  let totalMinutes = 0;
  let xpEarned = 0;

  for (const l of logs) {
    if (prev) {
      const expected = dayjs.utc(prev).add(1, 'day').format('YYYY-MM-DD');
      run = l.dayKey === expected ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = l.dayKey;
    totalCompletions += 1;
    totalMinutes += l.minutes ?? 0;
    xpEarned += l.xpAwarded ?? 0;
  }

  // Current streak: consecutive run ending at today or yesterday
  const todayKey = dayKey();
  const yesterdayKey = dayjs.utc().subtract(1, 'day').format('YYYY-MM-DD');
  let current = 0;
  if (prev === todayKey || prev === yesterdayKey) {
    const set = new Set(logs.map((l) => l.dayKey));
    let cursor: string | null = prev;
    while (cursor && set.has(cursor)) {
      current += 1;
      cursor = dayjs.utc(cursor).subtract(1, 'day').format('YYYY-MM-DD');
    }
  }

  await Habit.updateOne(
    { _id: habitId },
    {
      $set: {
        currentStreak: current,
        longestStreak: longest,
        totalCompletions,
        totalMinutes,
        xpEarned,
        lastCompletedAt: prev ? dayjs.utc(prev).toDate() : null,
      },
    }
  );
}

async function unlockAchievement(userId: string, code: string) {
  const def = ACHIEVEMENTS.find((a) => a.code === code);
  if (!def) return;
  await Achievement.updateOne(
    { user: userId, code },
    { $setOnInsert: { ...def, user: userId, unlockedAt: new Date() } },
    { upsert: true }
  );
}

async function maybeUnlockStreak(userId: string, streak: number) {
  if (streak >= 100) await unlockAchievement(userId, 'streak_100');
  else if (streak >= 30) await unlockAchievement(userId, 'streak_30');
  else if (streak >= 7) await unlockAchievement(userId, 'streak_7');
}

async function maybeUnlockLevel(userId: string, level: number) {
  if (level >= 10) await unlockAchievement(userId, 'level_10');
  else if (level >= 5) await unlockAchievement(userId, 'level_5');
}
