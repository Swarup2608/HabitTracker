import mongoose from 'mongoose';
import { User } from '../models/User';
import { env } from '../config/env';
import { Habit } from '../models/Habit';
import { HabitLog } from '../models/HabitLog';
import { Todo } from '../models/Todo';
import { Achievement } from '../models/Achievement';
import { UserMonthlyChallenges } from '../models/MonthlyChallenges';

async function deleteAllUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    console.log('\n⚠️  WARNING: You are about to delete ALL data from the database!');
    console.log('This includes: Users, Habits, Habit Logs, Todos, Achievements, and Monthly Challenges.');
    console.log('This action cannot be undone.\n');

    // Get count before deletion
    const countBefore = await User.countDocuments();
    const habitsBefore = await Habit.countDocuments();
    const habitLogsBefore = await HabitLog.countDocuments();
    const todosBefore = await Todo.countDocuments();
    const achievementsBefore = await Achievement.countDocuments();
    const challengesBefore = await UserMonthlyChallenges.countDocuments();

    console.log(`📊 Database Contents:`);
    console.log(`  • Users: ${countBefore}`);
    console.log(`  • Habits: ${habitsBefore}`);
    console.log(`  • Habit Logs: ${habitLogsBefore}`);
    console.log(`  • Todos: ${todosBefore}`);
    console.log(`  • Achievements: ${achievementsBefore}`);
    console.log(`  • Monthly Challenges: ${challengesBefore}`);

    if (countBefore === 0) {
      console.log('✓ Database is already empty. No users to delete.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Delete all users
    console.log('\n🗑️  Deleting all data...\n');

    // Delete in order of dependencies (children first, then parents)
    const habitLogsResult = await HabitLog.deleteMany({});
    console.log(`✓ Deleted ${habitLogsResult.deletedCount} habit logs`);

    const habitsResult = await Habit.deleteMany({});
    console.log(`✓ Deleted ${habitsResult.deletedCount} habits`);

    const todosResult = await Todo.deleteMany({});
    console.log(`✓ Deleted ${todosResult.deletedCount} todos`);

    const achievementsResult = await Achievement.deleteMany({});
    console.log(`✓ Deleted ${achievementsResult.deletedCount} achievements`);

    const challengesResult = await UserMonthlyChallenges.deleteMany({});
    console.log(`✓ Deleted ${challengesResult.deletedCount} monthly challenge progress records`);

    const usersResult = await User.deleteMany({});
    console.log(`✓ Deleted ${usersResult.deletedCount} users`);

    // Verify deletion
    const countAfter = await User.countDocuments();
    const habitsAfter = await Habit.countDocuments();
    const habitLogsAfter = await HabitLog.countDocuments();
    const todosAfter = await Todo.countDocuments();
    const achievementsAfter = await Achievement.countDocuments();
    const challengesAfter = await UserMonthlyChallenges.countDocuments();

    console.log('\n✅ Verification:');
    console.log(`  • Users remaining: ${countAfter}`);
    console.log(`  • Habits remaining: ${habitsAfter}`);
    console.log(`  • Habit Logs remaining: ${habitLogsAfter}`);
    console.log(`  • Todos remaining: ${todosAfter}`);
    console.log(`  • Achievements remaining: ${achievementsAfter}`);
    console.log(`  • Monthly Challenges remaining: ${challengesAfter}`);

    if (
      countAfter === 0 &&
      habitsAfter === 0 &&
      habitLogsAfter === 0 &&
      todosAfter === 0 &&
      achievementsAfter === 0 &&
      challengesAfter === 0
    ) {
      console.log('\n✓ All data successfully deleted! Database is now empty.');
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

deleteAllUsers();
