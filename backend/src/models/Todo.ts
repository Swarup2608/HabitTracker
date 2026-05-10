import { Schema, model, Document, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ITodo extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  title: string;
  notes?: string;
  priority: Priority;
  completed: boolean;
  completedAt?: Date;
  dayKey: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, maxlength: 200, trim: true },
    notes: { type: String, maxlength: 1000 },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    dayKey: { type: String, required: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

todoSchema.index({ user: 1, dayKey: 1, order: 1 });

export const Todo = model<ITodo>('Todo', todoSchema);
