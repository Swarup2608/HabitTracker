import mongoose from 'mongoose';
import { User } from '../models/User';
import { env } from '../config/env';

async function deleteAllUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✓ MongoDB connected');

    console.log('\n⚠️  WARNING: You are about to delete ALL users from the database!');
    console.log('This action cannot be undone.\n');

    // Get count before deletion
    const countBefore = await User.countDocuments();
    console.log(`Current users in database: ${countBefore}`);

    if (countBefore === 0) {
      console.log('✓ Database is already empty. No users to delete.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`\n✓ Deleted ${result.deletedCount} users from the database`);

    // Verify deletion
    const countAfter = await User.countDocuments();
    console.log(`✓ Users remaining: ${countAfter}`);

    console.log('\n✓ All users successfully deleted!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting users:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

deleteAllUsers();
