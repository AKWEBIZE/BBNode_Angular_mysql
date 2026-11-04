import { createApp } from './app';
import { env } from './config/env';
import { disconnectPrisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Bigbisort API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
