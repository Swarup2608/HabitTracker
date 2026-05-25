import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error';
import csrfProtection, { csrfErrorHandler } from './middleware/csrf';
import { rateLimit } from './middleware/rateLimit';
import { auditMiddleware } from './middleware/audit';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import habitRoutes from './routes/habits.routes';
import todoRoutes from './routes/todos.routes';
import dashboardRoutes from './routes/dashboard.routes';
import achievementsRoutes from './routes/achievements.routes';

export const app = express();

app.set('trust proxy', 1);

// Enhanced Helmet configuration with CSP and HSTS
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'https:', 'data:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", env.CLIENT_URL || 'http://localhost:3000'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
    noSniff: true,
    frameguard: { action: 'deny' },
  })
);

// HTTPS redirect in production
if (env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
    next();
  });
}

const allowedOrigins = new Set(
  [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'].filter(Boolean)
);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.has(origin)) return cb(null, true);
      if (env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):\d+$/.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb' }));
app.use(cookieParser());

// Set request timeout (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Apply audit logging
app.use(auditMiddleware);

// Apply CSRF protection
app.use(csrfProtection);

// CSRF token endpoint for frontend
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Apply rate limiters to API routes
const rateWindowSec = env.RATE_LIMIT_WINDOW_SEC;
const apiLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_API_MAX, keyPrefix: 'api', includeMethodInKey: true });
const habitLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_HABITS_MAX, keyPrefix: 'habits', includeMethodInKey: true });
const todoLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_TODOS_MAX, keyPrefix: 'todos', includeMethodInKey: true });
const userLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_USERS_MAX, keyPrefix: 'users', includeMethodInKey: true });
const dashboardLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_DASHBOARD_MAX, keyPrefix: 'dashboard', includeMethodInKey: true });
const achievementLimiter = rateLimit({ windowSec: rateWindowSec, max: env.RATE_LIMIT_ACHIEVEMENTS_MAX, keyPrefix: 'achievements', includeMethodInKey: true });

app.use('/api/habits', habitLimiter);
app.use('/api/todos', todoLimiter);
app.use('/api/users', userLimiter);
app.use('/api/dashboard', dashboardLimiter);
app.use('/api/achievements', achievementLimiter);
app.use('/api/', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/achievements', achievementsRoutes);

// CSRF error handler
app.use(csrfErrorHandler);

app.use(notFound);
app.use(errorHandler);
