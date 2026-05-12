import { z } from 'zod';

const dayKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const todoCreateSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dayKey: z.string().regex(dayKeyRegex).optional(),
  imageUrl: z.string().url().max(2000).optional().or(z.literal('').transform(() => undefined)),
  link: z.string().url().max(2000).optional().or(z.literal('').transform(() => undefined)),
  location: z.string().max(300).optional(),
});

export const todoUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
  dayKey: z.string().regex(dayKeyRegex).optional(),
  imageUrl: z.string().url().max(2000).optional().nullable().or(z.literal('').transform(() => null)),
  link: z.string().url().max(2000).optional().nullable().or(z.literal('').transform(() => null)),
  location: z.string().max(300).optional().nullable(),
});
