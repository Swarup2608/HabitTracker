import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User, hashPassword } from '../models/User';
import { Habit, XP_BY_DIFFICULTY, Difficulty } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';
import { Todo } from '../models/Todo';
import { dayjs, dayKey } from '../utils/date';
import { levelForXp } from '../services/leveling';

const SAMPLE_HABITS: Array<{
  name: string;
  icon: string;
  color: string;
  category: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
}> = [
  { name: 'Morning Run', icon: 'Footprints', color: '#f97316', category: 'fitness', difficulty: 'medium', estimatedMinutes: 30 },
  { name: 'Read 20 pages', icon: 'BookOpen', color: '#8b5cf6', category: 'mind', difficulty: 'easy', estimatedMinutes: 25 },
  { name: 'Deep Work Session', icon: 'Brain', color: '#06b6d4', category: 'work', difficulty: 'hard', estimatedMinutes: 90 },
  { name: 'Meditate', icon: 'Sparkles', color: '#10b981', category: 'mind', difficulty: 'easy', estimatedMinutes: 10 },
  { name: 'Drink 2L Water', icon: 'Droplet', color: '#3b82f6', category: 'health', difficulty: 'easy', estimatedMinutes: 1 },
  { name: 'Code Side Project', icon: 'Code2', color: '#ec4899', category: 'craft', difficulty: 'epic', estimatedMinutes: 60 },
];

async function main() {
  await connectDB();
  // eslint-disable-next-line no-console
  console.log('Seeding…');

  await Promise.all([
    User.deleteMany({ email: 'demo@loop-atom.app' }),
    Habit.deleteMany({}),
    HabitLog.deleteMany({}),
    Todo.deleteMany({}),
  ]);

  const user = await User.create({
    email: 'demo@loop-atom.app',
    username: 'demo',
    passwordHash: await hashPassword('Demo1234'),
    theme: 'gaming',
  });

  const habits = await Habit.insertMany(
    SAMPLE_HABITS.map((h, i) => ({
      ...h,
      user: user._id,
      order: i,
      startedAt: dayjs.utc().subtract(45, 'day').toDate(),
    }))
  );

  let totalXp = 0;
  const today = dayjs.utc().startOf('day');
  for (const habit of habits) {
    let streak = 0;
    let longest = 0;
    let lastDone: Date | undefined;
    for (let i = 44; i >= 0; i--) {
      // ~75% completion rate
      if (Math.random() < 0.75) {
        const date = today.subtract(i, 'day').toDate();
        const xp = XP_BY_DIFFICULTY[habit.difficulty];
        await HabitLog.create({
          user: user._id,
          habit: habit._id,
          date,
          dayKey: dayKey(date),
          completed: true,
          minutes: habit.estimatedMinutes,
          xpAwarded: xp,
          mood: ['okay', 'good', 'great'][Math.floor(Math.random() * 3)] as 'okay',
          energy: 3 + Math.floor(Math.random() * 3),
        });
        streak += 1;
        longest = Math.max(longest, streak);
        habit.totalCompletions += 1;
        habit.totalMinutes += habit.estimatedMinutes;
        habit.xpEarned += xp;
        totalXp += xp;
        lastDone = date;
      } else {
        streak = 0;
      }
    }
    habit.currentStreak = streak;
    habit.longestStreak = longest;
    habit.lastCompletedAt = lastDone;
    await habit.save();
  }

  user.xp = totalXp;
  user.level = levelForXp(totalXp);
  await user.save();

  // sample todos for today
  const todoTitles = ['Ship dashboard polish', 'Review PR #42', 'Plan tomorrow', 'Stretch 5 min'];
  await Todo.insertMany(
    todoTitles.map((title, i) => ({
      user: user._id,
      title,
      priority: ['low', 'medium', 'high', 'urgent'][i % 4],
      dayKey: dayKey(),
      order: i,
      completed: i < 2,
      completedAt: i < 2 ? new Date() : undefined,
    }))
  );

  // eslint-disable-next-line no-console
  console.log('✓ Seeded demo@tracker.app / Demo1234');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
