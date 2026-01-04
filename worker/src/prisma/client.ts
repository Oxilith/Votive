/**
 * @file worker/src/prisma/client.ts
 * @purpose Prisma client setup with PostgreSQL adapter and test injection
 * @functionality
 * - Creates Prisma client with PostgreSQL adapter (Prisma 7+)
 * - Shares database with prompt-service
 * - Provides factory function for fresh connections (avoids stale connection issues)
 * - Supports test injection via setTestPrismaClient() for integration tests
 * @dependencies
 * - shared/prisma for PrismaClient (generated types)
 * - @prisma/adapter-pg for PostgreSQL support
 * - @/config for database configuration
 */

import { PrismaClient } from '@votive/shared/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '@/config';

/**
 * Global cache for Prisma instance.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  testPrisma: PrismaClient | undefined;
};

/**
 * Creates a fresh Prisma client with a new PostgreSQL connection.
 * Use this for long-running processes where the connection may become stale.
 * Remember to call prisma.$disconnect() when done.
 */
export function createFreshPrismaClient(): PrismaClient {
  // In test environment, prefer test client if set
  if (globalForPrisma.testPrisma) {
    return globalForPrisma.testPrisma;
  }
  const adapter = new PrismaPg({
    connectionString: config.databaseUrl,
  });
  return new PrismaClient({
    adapter,
    log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
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

function createProductionClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: config.databaseUrl,
  });
  return new PrismaClient({
    adapter,
    log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

/**
 * Gets the active Prisma client (test client if set, otherwise production singleton).
 */
function getActivePrisma(): PrismaClient {
  if (globalForPrisma.testPrisma) {
    return globalForPrisma.testPrisma;
  }
  globalForPrisma.prisma ??= createProductionClient();
  return globalForPrisma.prisma;
}

/**
 * Singleton Prisma instance with test injection support.
 * Uses Proxy to dynamically resolve the active client (test or production).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getActivePrisma()[prop as keyof PrismaClient];
  },
});
