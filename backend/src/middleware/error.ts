import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten() });
  }
  if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
    return res.status(409).json({
      error: 'Duplicate value',
      details: (err as unknown as { keyValue?: unknown }).keyValue,
    });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}
