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
  { code: 'first_habit', title: 'First Step', description: 'Created your first habit', icon: 'Sparkles' },
  { code: 'streak_7', title: 'Week Warrior', description: '7-day streak', icon: 'Flame' },
  { code: 'streak_30', title: 'Monthly Monk', description: '30-day streak', icon: 'Zap' },
  { code: 'streak_100', title: 'Centurion', description: '100-day streak', icon: 'Crown' },
  { code: 'level_5', title: 'Rising Star', description: 'Reached level 5', icon: 'Star' },
  { code: 'level_10', title: 'Habitual', description: 'Reached level 10', icon: 'Trophy' },
];
