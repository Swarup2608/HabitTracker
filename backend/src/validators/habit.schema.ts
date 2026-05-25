import { z } from 'zod';

export const habitCreateSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  icon: z.string().max(5).optional(),
  color: z.string().default('#8b5cf6'),
  category: z.string().default('general'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'epic']).default('medium'),
  targetPerWeek: z.number().int().min(1).max(7).default(7),
  estimatedMinutes: z.number().int().min(1).max(600).default(15),
  targetDays: z.number().int().min(1).max(3650).nullable().optional(),
  targetMetric: z.enum(['completions', 'streak', 'days']).nullable().optional(),
});

export const habitUpdateSchema = habitCreateSchema.partial().extend({
  status: z.enum(['active', 'paused', 'archived']).optional(),
  order: z.number().int().optional(),
  startedAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  targetReachedAt: z.string().datetime().nullable().optional(),
});

export const habitCompleteSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  minutes: z.number().int().min(0).max(600).optional(),
  mood: z.enum(['awful', 'bad', 'okay', 'good', 'great']).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
  feedback: z.string().max(500).optional(),
});

export const logUpdateSchema = z.object({
  minutes: z.number().int().min(0).max(600).optional(),
  mood: z.enum(['awful', 'bad', 'okay', 'good', 'great']).optional(),
  energy: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
  feedback: z.string().max(500).optional(),
});

export const logsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(20),
});

export const calendarQuerySchema = z.object({
  year: z.coerce.number().int().min(1970).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});
