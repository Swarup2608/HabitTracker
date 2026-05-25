import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redis.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});

redis.on('connect', () => {
  logger.info('✓ Redis connected');
});

export async function connectRedis() {
  await redis.connect();
}
