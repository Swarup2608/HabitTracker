import { Schema, model, Document, Types } from 'mongoose';

export interface IMonthlyChallenges extends Document {
  month: string; // YYYY-MM format
  year: number;
  tasks: {
    id: string;
    title: string;
    description: string;
    objective: string; // What needs to be done
  }[];
}

export interface IUserMonthlyChallenges extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  month: string; // YYYY-MM format
  year: number;
  completedTasks: string[]; // Array of task IDs
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const monthlyChallengesSchema = new Schema<IMonthlyChallenges>(
  {
    month: { type: String, required: true }, // YYYY-MM
    year: { type: Number, required: true },
    tasks: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        objective: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const userMonthlyChallengesSchema = new Schema<IUserMonthlyChallenges>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    completedTasks: { type: [String], default: [] },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userMonthlyChallengesSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

export const MonthlyChallenges = model<IMonthlyChallenges>('MonthlyChallenges', monthlyChallengesSchema);
export const UserMonthlyChallenges = model<IUserMonthlyChallenges>('UserMonthlyChallenges', userMonthlyChallengesSchema);

// Current Monthly Challenges - Update this monthly
export const MONTHLY_CHALLENGES = {
  'May_2026': {
    month: 'May',
    year: 2026,
    tasks: [
      {
        id: 'task_1',
        title: 'Consistency Champion',
        description: 'Log habits without missing a single day',
        objective: 'Complete all your habits every day for the entire month',
      },
      {
        id: 'task_2',
        title: 'Streak Starter',
        description: 'Build momentum with multiple habits',
        objective: 'Achieve a 7-day streak on at least 3 different habits',
      },
      {
        id: 'task_3',
        title: 'Todo Tracker',
        description: 'Manage your tasks effectively',
        objective: 'Complete at least 20 todos this month',
      },
    ],
  },
  'June_2026': {
    month: 'June',
    year: 2026,
    tasks: [
      {
        id: 'task_1',
        title: 'Level Up',
        description: 'Increase your XP significantly',
        objective: 'Gain 500 XP this month',
      },
      {
        id: 'task_2',
        title: 'Habit Pioneer',
        description: 'Try new habits',
        objective: 'Create and maintain 2 new habits for the entire month',
      },
      {
        id: 'task_3',
        title: 'Morning Ritual',
        description: 'Start your day right',
        objective: 'Log at least 10 habits before 9 AM',
      },
    ],
  },
};
