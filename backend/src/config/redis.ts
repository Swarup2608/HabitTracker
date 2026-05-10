import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redis.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('Redis error:', err.message);
});

export async function connectRedis() {
  await redis.connect();
  // eslint-disable-next-line no-console
  console.log('✓ Redis connected');
}
