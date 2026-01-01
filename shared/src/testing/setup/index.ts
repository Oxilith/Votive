/**
 * @file shared/src/testing/setup/index.ts
 * @purpose Barrel export for integration test setup utilities
 * @functionality
 * - Exports database setup utilities for integration tests
 * - Exports database lifecycle hooks (setupIntegrationDb, checkDatabaseAvailable)
 * - Exports Prisma client management (setTestPrisma, getTestPrisma, hasTestPrisma)
 * - Exports cleanup utilities (cleanupTestDb, cleanupTables, disconnectTestDb)
 * - Exports test wrappers (setupTestDb, withCleanup)
 * @dependencies
 * - ./test-db for database setup functions
 * - ./db for database lifecycle utilities
 */

export { setupIntegrationDb, checkDatabaseAvailable } from './test-db';

// Database utilities - test DB lifecycle management
export {
    setTestPrisma,
    getTestPrisma,
    hasTestPrisma,
    cleanupTestDb,
    cleanupTables,
    disconnectTestDb,
    setupTestDb,
    withCleanup,
    CLEANUP_TABLE_ORDER,
    type TableName,
    type CleanupOptions,
} from './db';

// Re-export PrismaClient type for consumers
export type { PrismaClient } from '../../generated/prisma/client';