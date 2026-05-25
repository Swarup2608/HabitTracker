import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

mongoose.set('strictQuery', true);

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
    ssl: true,
    retryWrites: true,
    w: 'majority',
  });
  logger.info('✓ MongoDB connected with encryption');
}
