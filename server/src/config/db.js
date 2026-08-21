import { PrismaClient } from '@prisma/client';
import env from './env.js';

/**
 * Singleton Prisma Client instance.
 * In development, we store it on globalThis to prevent
 * multiple instances during hot-reloads.
 */
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.isDev ? ['query', 'warn', 'error'] : ['error'],
  });

if (env.isDev) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
