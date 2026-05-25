import type { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';

interface Options {
  windowSec: number;
  max: number;
  keyPrefix: string;
  includeMethodInKey?: boolean;
}

export const rateLimit =
  ({ windowSec, max, keyPrefix, includeMethodInKey = false }: Options) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
                 req.ip ||
                 req.socket.remoteAddress ||
                 'unknown';
      const userPart = req.user?.sub ?? 'anon';
      const methodPart = includeMethodInKey ? req.method.toUpperCase() : 'ALL';
      const key = `rl:${keyPrefix}:${methodPart}:${userPart}:${ip}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, windowSec);
      }

      // Self-heal limiter keys if TTL was lost due to transient Redis issues.
      let ttl = await redis.ttl(key);
      if (ttl < 0) {
        await redis.expire(key, windowSec);
        ttl = windowSec;
      }

      // Set rate limit headers (RFC 6585)
      res.setHeader('RateLimit-Limit', max.toString());
      res.setHeader('RateLimit-Remaining', Math.max(0, max - count).toString());
      res.setHeader('RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);

      if (count > max) {
        res.setHeader('Retry-After', ttl.toString());
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: ttl,
        });
      }
      next();
    } catch {
      // fail open if redis is down
      next();
    }
  };
