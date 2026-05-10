import { z } from 'zod';

export const todoCreateSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const todoUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  completed: z.boolean().optional(),
  order: z.number().int().optional(),
});
