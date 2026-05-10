import type { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

interface Options {
  windowSec: number;
  max: number;
  keyPrefix: string;
}

export const rateLimit =
  ({ windowSec, max, keyPrefix }: Options) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userPart = req.user?.sub ?? 'anon';
      const key = `rl:${keyPrefix}:${userPart}:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSec);
      if (count > max) {
        return res.status(429).json({ error: 'Too many requests' });
      }
      next();
    } catch {
      // fail open if redis is down
      next();
    }
  };
