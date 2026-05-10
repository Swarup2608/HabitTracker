import type { Request, Response } from 'express';
import { Habit } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';
import { Todo } from '../models/Todo';
import { User } from '../models/User';
import { Achievement } from '../models/Achievement';
import { redis } from '../config/redis';
import { dayjs } from '../utils/date';
import { progressInLevel } from '../services/leveling';

const TTL = 60;

export async function summary(req: Request, res: Response) {
  const userId = req.user!.sub;
  const cacheKey = `dash:${userId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(JSON.parse(cached));
  }

  const [user, habits, achievements] = await Promise.all([
    User.findById(userId).lean(),
    Habit.find({ user: userId, status: { $ne: 'archived' } }).lean(),
    Achievement.find({ user: userId }).sort({ unlockedAt: -1 }).lean(),
  ]);

  const today = dayjs.utc().startOf('day');
  const start30 = today.subtract(29, 'day').toDate();
  const logs = await HabitLog.find({
    user: userId,
    date: { $gte: start30 },
  })
    .sort({ date: 1 })
    .lean();

  // Heatmap: 30 days
  const heatmap: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = today.subtract(i, 'day');
    const key = d.format('YYYY-MM-DD');
    const count = logs.filter((l) => l.dayKey === key).length;
    heatmap.push({ day: key, count });
  }

  // Weekly performance: last 7 days
  const weekly = heatmap.slice(-7).map((d) => ({
    day: dayjs.utc(d.day).format('ddd'),
    completions: d.count,
  }));

  // Monthly: last 30 days summed by week
  const monthly: { week: string; completions: number }[] = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    const slice = heatmap.slice(i, i + 7);
    monthly.push({
      week: `W${monthly.length + 1}`,
      completions: slice.reduce((s, x) => s + x.count, 0),
    });
  }

  const todayKey = today.format('YYYY-MM-DD');
  const completedToday = logs.filter((l) => l.dayKey === todayKey).length;
  const activeHabits = habits.filter((h) => h.status === 'active');
  const completionPct =
    activeHabits.length === 0 ? 0 : Math.round((completedToday / activeHabits.length) * 100);

  const currentStreak = activeHabits.reduce((m, h) => Math.max(m, h.currentStreak), 0);
  const longestStreak = habits.reduce((m, h) => Math.max(m, h.longestStreak), 0);

  // consistency: % of days in last 30 with at least 1 completion
  const activeDays = heatmap.filter((d) => d.count > 0).length;
  const consistencyRate = Math.round((activeDays / 30) * 100);

  // burnout risk: high if completions trending down + many habits
  const firstHalf = heatmap.slice(0, 15).reduce((s, d) => s + d.count, 0);
  const secondHalf = heatmap.slice(15).reduce((s, d) => s + d.count, 0);
  const trend = secondHalf - firstHalf;
  const burnoutRisk =
    activeHabits.length >= 6 && trend < -3 ? 'high' : trend < 0 ? 'medium' : 'low';

  // habit velocity: avg completions / day over 7 days
  const habitVelocity =
    Math.round((heatmap.slice(-7).reduce((s, d) => s + d.count, 0) / 7) * 10) / 10;

  // productivity score
  const todosToday = await Todo.find({ user: userId, dayKey: todayKey }).lean();
  const todosDone = todosToday.filter((t) => t.completed).length;
  const todoPct = todosToday.length === 0 ? 0 : todosDone / todosToday.length;
  const productivityScore = Math.round(
    completionPct * 0.5 + consistencyRate * 0.3 + todoPct * 100 * 0.2
  );

  const levelInfo = progressInLevel(user?.xp ?? 0);

  const payload = {
    user: {
      username: user?.username,
      xp: user?.xp ?? 0,
      level: levelInfo.level,
      levelInto: levelInfo.into,
      levelSpan: levelInfo.span,
      levelPercent: levelInfo.percent,
    },
    metrics: {
      consistencyRate,
      currentStreak,
      longestStreak,
      completionPct,
      productivityScore,
      habitVelocity,
      burnoutRisk,
      activeHabits: activeHabits.length,
      completedToday,
    },
    weekly,
    monthly,
    heatmap,
    achievements: achievements.slice(0, 12),
    topHabits: [...habits]
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 5)
      .map((h) => ({
        id: h._id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
        completionRate:
          h.totalCompletions === 0
            ? 0
            : Math.round((h.totalCompletions / Math.max(1, dayjs.utc().diff(dayjs.utc(h.startedAt), 'day') + 1)) * 100),
      })),
  };

  await redis.set(cacheKey, JSON.stringify(payload), 'EX', TTL);
  res.setHeader('X-Cache', 'MISS');
  res.json(payload);
}
