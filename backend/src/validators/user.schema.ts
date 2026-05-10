import { z } from 'zod';

export const userUpdateSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  email: z.string().email().toLowerCase().optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  theme: z.enum(['light', 'dark', 'gaming', 'fantasy']).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      daily: z.boolean().optional(),
    })
    .optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(72)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});
