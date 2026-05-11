import { Schema, model, Document, Types } from 'mongoose';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'epic';
export type HabitStatus = 'active' | 'paused' | 'archived';
export type TargetMetric = 'completions' | 'streak' | 'days';

export interface IHabit extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: string;
  difficulty: Difficulty;
  status: HabitStatus;
  targetPerWeek: number;
  estimatedMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  totalMinutes: number;
  xpEarned: number;
  lastCompletedAt?: Date;
  startedAt: Date;
  order: number;
  targetDays?: number | null;
  targetMetric?: TargetMetric | null;
  targetReachedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 500 },
    icon: { type: String, default: 'Sparkles' },
    color: { type: String, default: '#8b5cf6' },
    category: { type: String, default: 'general' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'epic'], default: 'medium' },
    status: { type: String, enum: ['active', 'paused', 'archived'], default: 'active', index: true },
    targetPerWeek: { type: Number, default: 7, min: 1, max: 7 },
    estimatedMinutes: { type: Number, default: 15, min: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    lastCompletedAt: Date,
    startedAt: { type: Date, default: () => new Date() },
    order: { type: Number, default: 0 },
    targetDays: { type: Number, default: null, min: 1, max: 3650 },
    targetMetric: { type: String, enum: ['completions', 'streak', 'days', null], default: null },
    targetReachedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

habitSchema.index({ user: 1, status: 1, order: 1 });

export const Habit = model<IHabit>('Habit', habitSchema);

export const XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
  epic: 60,
};
