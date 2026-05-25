import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export type ThemeMode = 'dark' | 'gaming' | 'fantasy';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl?: string;
  timezone: string;
  theme: ThemeMode;
  notifications: { email: boolean; push: boolean; daily: boolean };
  xp: number;
  level: number;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, required: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    avatarUrl: String,
    timezone: { type: String, default: 'UTC' },
    theme: { type: String, enum: ['dark', 'gaming', 'fantasy'], default: 'dark' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      daily: { type: Boolean, default: true },
    },
    xp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    delete r.passwordHash;
    delete r.failedLoginAttempts;
    delete r.lockedUntil;
    delete r.__v;
    return r;
  },
});

export const User = model<IUser>('User', userSchema);

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}
