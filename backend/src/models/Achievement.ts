import { Schema, model, Document, Types } from 'mongoose';

export interface IAchievement extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'Trophy' },
    unlockedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

achievementSchema.index({ user: 1, code: 1 }, { unique: true });

export const Achievement = model<IAchievement>('Achievement', achievementSchema);

export const ACHIEVEMENTS = [
  // Habit Milestones
  { code: 'first_habit', title: 'First Step', description: 'Created your first habit', icon: 'Sparkles' },
  { code: 'habit_5', title: 'Habit Collector', description: 'Create 5 habits', icon: 'Stack' },
  { code: 'habit_10', title: 'Habit Master', description: 'Create 10 habits', icon: 'Zap' },
  { code: 'habit_25', title: 'Habit Legend', description: 'Create 25 habits', icon: 'Crown' },
  
  // Streak Milestones
  { code: 'streak_3', title: 'Getting Started', description: '3-day streak', icon: 'Flame' },
  { code: 'streak_7', title: 'Week Warrior', description: '7-day streak', icon: 'Fire' },
  { code: 'streak_14', title: 'Fortnight Fighter', description: '14-day streak', icon: 'Zap' },
  { code: 'streak_30', title: 'Monthly Monk', description: '30-day streak', icon: 'Star' },
  { code: 'streak_100', title: 'Centurion', description: '100-day streak', icon: 'Crown' },
  { code: 'streak_365', title: 'Annual Legend', description: '365-day streak', icon: 'Trophy' },
  
  // Multiple Streaks
  { code: 'double_streak', title: 'Dual Momentum', description: 'Maintain 2 concurrent 7-day streaks', icon: 'Flame' },
  { code: 'triple_streak', title: 'Triple Threat', description: 'Maintain 3 concurrent 7-day streaks', icon: 'Zap' },
  
  // Level Achievements
  { code: 'level_5', title: 'Rising Star', description: 'Reached level 5', icon: 'Star' },
  { code: 'level_10', title: 'Habitual', description: 'Reached level 10', icon: 'Trophy' },
  { code: 'level_20', title: 'Master of Habits', description: 'Reached level 20', icon: 'Crown' },
  { code: 'level_50', title: 'Legendary Tracker', description: 'Reached level 50', icon: 'Sparkles' },
  
  // Consistency
  { code: 'consistent_week', title: 'Weekly Warrior', description: 'Complete all habits for a full week', icon: 'Calendar' },
  { code: 'perfect_month', title: 'Perfect Month', description: 'Complete all habits every day for a month', icon: 'Check' },
  { code: 'comeback_king', title: 'Comeback King', description: 'Recover a streak after breaking it', icon: 'RotateCcw' },
  
  // Completion Goals
  { code: 'completions_100', title: 'Century Club', description: 'Complete 100 habit logs', icon: 'Target' },
  { code: 'completions_500', title: 'Five Hundred', description: 'Complete 500 habit logs', icon: 'Target' },
  { code: 'completions_1000', title: 'Thousand Strong', description: 'Complete 1000 habit logs', icon: 'Target' },
  
  // Todo Achievements
  { code: 'first_todo', title: 'Task Starter', description: 'Create your first todo', icon: 'CheckSquare' },
  { code: 'todos_50', title: 'Task Master', description: 'Complete 50 todos', icon: 'CheckSquare' },
  { code: 'todos_250', title: 'Task Legend', description: 'Complete 250 todos', icon: 'CheckSquare' },
  
  // Speed & Dedication
  { code: 'morning_person', title: 'Early Bird', description: 'Log 5 habits before 9 AM', icon: 'Sun' },
  { code: 'night_owl', title: 'Night Owl', description: 'Log 5 habits after 9 PM', icon: 'Moon' },
  { code: 'early_riser', title: 'Sunrise Tracker', description: 'Log habits 7 days in a row before noon', icon: 'Sun' },
  
  // Social/Seasonal
  { code: 'new_year_goal', title: 'New Year Committer', description: 'Create habit on January 1st', icon: 'Sparkles' },
  { code: 'seasonal_warrior', title: 'Four Seasons', description: 'Maintain a streak across all 4 seasons', icon: 'Leaf' },
  { code: 'milestone_birthday', title: 'Birthday Boost', description: 'Log a habit on your birthday', icon: 'Gift' },
  
  // Special Challenges (Monthly Tasks)
  { code: 'monthly_challenge_1', title: 'Challenge Accepted', description: 'Complete a monthly challenge', icon: 'Medal' },
  { code: 'monthly_challenge_6', title: 'Challenge Veteran', description: 'Complete 6 monthly challenges', icon: 'Medal' },
  { code: 'monthly_challenge_12', title: 'Challenge Master', description: 'Complete 12 monthly challenges', icon: 'Crown' },
];
