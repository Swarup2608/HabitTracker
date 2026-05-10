import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';

async function main() {
  await Promise.all([connectDB(), connectRedis()]);
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`✓ API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
