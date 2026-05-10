import jwt, { SignOptions } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { env } from '../config/env';
import { redis } from '../config/redis';

export interface AccessPayload {
  sub: string;
  username: string;
}

export interface RefreshPayload {
  sub: string;
  jti: string;
}

const refreshKey = (userId: string, jti: string) => `refresh:${userId}:${jti}`;
const refreshTTLSeconds = env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60;

export function signAccess(payload: AccessPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  } as SignOptions);
}

export async function issueRefresh(userId: string) {
  const jti = nanoid();
  const token = jwt.sign({ sub: userId, jti } as RefreshPayload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_TTL_DAYS}d`,
  } as SignOptions);
  await redis.set(refreshKey(userId, jti), '1', 'EX', refreshTTLSeconds);
  return token;
}

export function verifyAccess(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefresh(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
}

export async function isRefreshActive(userId: string, jti: string) {
  return (await redis.exists(refreshKey(userId, jti))) === 1;
}

export async function revokeRefresh(userId: string, jti: string) {
  await redis.del(refreshKey(userId, jti));
}

export async function revokeAllRefresh(userId: string) {
  const keys = await redis.keys(`refresh:${userId}:*`);
  if (keys.length) await redis.del(...keys);
}

export async function rotateRefresh(userId: string, oldJti: string) {
  await revokeRefresh(userId, oldJti);
  return issueRefresh(userId);
}
