import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/error';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import habitRoutes from './routes/habits.routes';
import todoRoutes from './routes/todos.routes';
import dashboardRoutes from './routes/dashboard.routes';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
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
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);
