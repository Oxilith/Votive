/**
 * @file shared/src/testing/setup/test-db.ts
 * @purpose Database setup for integration tests with availability checking
 * @functionality
 * - Checks database availability and migrations
 * - Sets up test Prisma instance for cleanup utilities
 * - Provides cleanup between tests for isolation
 * - Gracefully skips tests when database unavailable
 * @dependencies
 * - vitest for test hooks
 * - @votive/shared/prisma for PrismaClient type
 * - ./db for Prisma test utilities
 */

import type { PrismaClient } from '../../generated/prisma/client';
import { setTestPrisma, cleanupTestDb } from './db';

/**
 * Checks if the database is available and has migrations applied.
 * @param prisma - The Prisma client instance to check
 * @returns Promise<boolean> - True if database is available and ready
 */
export async function checkDatabaseAvailable(prisma: PrismaClient): Promise<boolean> {
  try {
    // Check basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    // Check if User table exists (migrations applied)
    await prisma.user.findFirst();
    return true;
  } catch (error: unknown) {
    // Provide specific error messages for different failure modes
    if (error instanceof Error) {
      if (error.message.includes('SQLITE_BUSY')) {
        console.warn(
          '[checkDatabaseAvailable] Database is locked by another process. ' +
          'Close other database connections and retry.'
        );
      } else if (error.message.includes('SQLITE_CORRUPT')) {
        console.error(
          '[checkDatabaseAvailable] Database file is corrupted. ' +
          'Delete the .db file and run migrations again.'
        );
      } else if (error.message.includes('no such table')) {
        console.warn(
          '[checkDatabaseAvailable] Migrations not applied. ' +
          'Integration tests will be skipped. ' +
          'Run `npm run db:migrate` in prompt-service to enable these tests.'
        );
      } else {
        console.warn(
          `[checkDatabaseAvailable] Database not available: ${error.message}. ` +
          'Integration tests will be skipped.'
        );
      }
    } else {
      console.warn(
        '[checkDatabaseAvailable] Unknown database error. ' +
        'Integration tests will be skipped.'
      );
    }
    return false;
  }
}

/**
 * Sets up integration test database lifecycle hooks.
 * Provides beforeAll/beforeEach/afterAll hooks that:
 * - Check database availability
 * - Register Prisma for cleanup utilities
 * - Clean up data between tests
 * - Disconnect after all tests
 *
 * @param prisma - The Prisma client instance to use
 * @returns Object with isDatabaseAvailable function for conditional test skipping
 *
 * @example
 * ```typescript
 * describe('Integration Tests', () => {
 *   const { isDatabaseAvailable } = setupIntegrationDb(prisma);
 *
 *   it('should do something with database', async () => {
 *     if (!isDatabaseAvailable()) {
 *       console.log('Skipping: database not available');
 *       return;
 *     }
 *     // ... test code
 *   });
 * });
 * ```
 */
export function setupIntegrationDb(prisma: PrismaClient) {
  let databaseAvailable = false;

  beforeAll(async () => {
    databaseAvailable = await checkDatabaseAvailable(prisma);
    if (databaseAvailable) {
      setTestPrisma(prisma);
    }
  });

  beforeEach(async () => {
    if (databaseAvailable) {
      await cleanupTestDb();
    }
  });

  afterAll(async () => {
    if (databaseAvailable) {
      await cleanupTestDb();
    }
    await prisma.$disconnect();
  });

  return {
    /**
     * Returns whether the database is available for testing.
     * Use this to conditionally skip tests that require database.
     */
    isDatabaseAvailable: () => databaseAvailable,
  };
}
