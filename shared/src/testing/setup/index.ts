/**
 * @file shared/src/testing/setup/index.ts
 * @purpose Barrel export for integration test setup utilities
 * @functionality
 * - Exports database setup utilities for integration tests
 * - Exports database lifecycle hooks (setupIntegrationDb, checkDatabaseAvailable)
 * - Exports Prisma client management (setTestPrisma, getTestPrisma, hasTestPrisma)
 * - Exports cleanup utilities (cleanupTestDb, cleanupTables, disconnectTestDb)
 * - Exports test wrappers (setupTestDb, withCleanup)
 * - Exports testcontainers setup for PostgreSQL integration tests
 * @dependencies
 * - ./test-db for database setup functions
 * - ./db for database lifecycle utilities
 * - ./testcontainers for PostgreSQL container management
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

// Testcontainers - PostgreSQL container for integration tests
export {
    setupTestContainer,
    teardownTestContainer,
    getTestDatabaseUrl,
    isContainerRunning,
    getTestPrismaClient,
    TEST_DB_CONFIG,
} from './testcontainers';

// Re-export PrismaClient type for consumers
export type { PrismaClient } from '../../generated/prisma/client';