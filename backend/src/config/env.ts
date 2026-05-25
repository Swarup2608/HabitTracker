import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().default(14),
  RATE_LIMIT_WINDOW_SEC: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_API_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_HABITS_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_TODOS_MAX: z.coerce.number().int().positive().default(50),
  RATE_LIMIT_USERS_MAX: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_DASHBOARD_MAX: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_ACHIEVEMENTS_MAX: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_AUTH_REGISTER_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_AUTH_LOGIN_MAX: z.coerce.number().int().positive().default(30),
  RATE_LIMIT_AUTH_VERIFY_MAX: z.coerce.number().int().positive().default(20),
  RATE_LIMIT_AUTH_FORGOT_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_AUTH_RESET_MAX: z.coerce.number().int().positive().default(20),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

// Validate production requirements
if (parsed.data.NODE_ENV === 'production') {
  if (!parsed.data.COOKIE_SECURE) {
    // eslint-disable-next-line no-console
    console.error('❌ Production error: COOKIE_SECURE must be true in production');
    process.exit(1);
  }
  if (!parsed.data.SMTP_HOST || !parsed.data.SMTP_USER || !parsed.data.SMTP_PASS) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Production warning: Email configuration missing - password reset will not work');
  }
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
