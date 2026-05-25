import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { initializeEmailTransport } from './services/email.service';
import { logger } from './utils/logger';

async function main() {
  await Promise.all([connectDB(), connectRedis()]);
  
  // Initialize email service
  initializeEmailTransport();
  
  app.listen(env.PORT, () => {
    logger.info(`✓ API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error(`Fatal startup error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
