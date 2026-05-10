import { Schema, model, Document, Types } from 'mongoose';

export type Mood = 'awful' | 'bad' | 'okay' | 'good' | 'great';

export interface IHabitLog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  habit: Types.ObjectId;
  date: Date;
  dayKey: string;
  completed: boolean;
  minutes: number;
  mood?: Mood;
  energy?: number;
  notes?: string;
  feedback?: string;
  xpAwarded: number;
  createdAt: Date;
  updatedAt: Date;
}

const habitLogSchema = new Schema<IHabitLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    habit: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    date: { type: Date, required: true },
    dayKey: { type: String, required: true },
    completed: { type: Boolean, default: true },
    minutes: { type: Number, default: 0, min: 0 },
    mood: { type: String, enum: ['awful', 'bad', 'okay', 'good', 'great'] },
    energy: { type: Number, min: 1, max: 5 },
    notes: { type: String, maxlength: 2000 },
    feedback: { type: String, maxlength: 500 },
    xpAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

habitLogSchema.index({ habit: 1, dayKey: 1 }, { unique: true });
habitLogSchema.index({ user: 1, date: -1 });

export const HabitLog = model<IHabitLog>('HabitLog', habitLogSchema);
