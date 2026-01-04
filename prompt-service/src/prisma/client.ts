/**
 * @file prompt-service/src/prisma/client.ts
 * @purpose Singleton Prisma client instance with PostgreSQL adapter and test injection
 * @functionality
 * - Provides a single shared Prisma client instance
 * - Supports test injection via setTestPrismaClient() for integration tests
 * - Uses @prisma/adapter-pg for PostgreSQL connections (Prisma 7+)
 * - Prevents multiple client instances in development with hot reload
 * @note Graceful shutdown is handled in index.ts via SIGTERM/SIGINT handlers
 * @dependencies
 * - shared/prisma for PrismaClient (generated types)
 * - @prisma/adapter-pg for PostgreSQL driver adapter
 */

import { PrismaClient } from '@votive/shared/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Global cache for Prisma instance.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  testPrisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Create PostgreSQL adapter (Prisma 7+ API)
  const adapter = new PrismaPg({ connectionString });

  // Determine log level based on environment
  // - Development: verbose logging for debugging
  // - Test: no logging to keep test output clean
  // - Production: error logging only
  const logConfig =
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : process.env.NODE_ENV === 'test'
        ? []
        : ['error'];

  return new PrismaClient({
    adapter,
    log: logConfig as ('query' | 'info' | 'warn' | 'error')[],
  });
}

/**
 * Sets a test Prisma client for integration tests.
 * Called by testcontainer setup before tests run.
 */
export function setTestPrismaClient(client: PrismaClient): void {
  globalForPrisma.testPrisma = client;
}

/**
 * Clears the test Prisma client after tests complete.
 */
export function clearTestPrismaClient(): void {
  globalForPrisma.testPrisma = undefined;
}

/**
 * Gets the active Prisma client (test client if set, otherwise production singleton).
 */
function getActivePrisma(): PrismaClient {
  if (globalForPrisma.testPrisma) {
    return globalForPrisma.testPrisma;
  }
  globalForPrisma.prisma ??= createPrismaClient();
  return globalForPrisma.prisma;
}

/**
 * Singleton Prisma instance with test injection support.
 * Uses Proxy to dynamically resolve the active client (test or production).
 * This allows integration tests to inject a testcontainer-connected client.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getActivePrisma()[prop as keyof PrismaClient];
  },
});
