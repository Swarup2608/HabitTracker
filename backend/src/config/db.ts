import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('strictQuery', true);

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== 'production',
  });
  // eslint-disable-next-line no-console
  console.log('✓ MongoDB connected');
}
