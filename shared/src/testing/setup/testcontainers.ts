/**
 * @file shared/src/testing/setup/testcontainers.ts
 * @purpose PostgreSQL testcontainers setup for integration tests
 * @functionality
 * - Starts PostgreSQL container for integration tests
 * - Runs Prisma migrations against test database
 * - Provides shared prisma client for tests
 * - Cleans up container after tests complete
 * @dependencies
 * - @testcontainers/postgresql for PostgreSQL container
 * - child_process for running migrations
 */

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execFileSync } from 'child_process';
import { resolve } from 'path';
import { setTestPrisma } from './db';
import type { PrismaClient } from '../../generated/prisma/client';
import { findProjectRoot } from '../../paths';

const PROJECT_ROOT = findProjectRoot();

// Module-level state
let container: StartedPostgreSqlContainer | null = null;
let testPrismaClient: PrismaClient | null = null;
let isSetupComplete = false;

/**
 * Configuration for the test PostgreSQL container.
 */
export const TEST_DB_CONFIG = {
  database: 'votive_test',
  username: 'test',
  password: 'test',
  image: 'postgres:16-alpine',
} as const;

/**
 * Sets up PostgreSQL testcontainer for integration tests.
 * This should be called in globalSetup or at the start of integration test suites.
 *
 * @param prismaClientFactory - Factory function to create PrismaClient instance.
 *   DATABASE_URL is set in process.env before this is called.
 * @param options - Configuration options for the container
 * @returns Promise with the database URL
 */
export async function setupTestContainer(
  prismaClientFactory: () => PrismaClient,
  options: {
    /** Arguments for prisma migrate deploy command */
    migrationArgs?: string[];
    /** Working directory for running migrations (defaults to prompt-service) */
    cwd?: string;
  } = {}
): Promise<string> {
  const {
    migrationArgs = ['migrate', 'deploy', '--config', './prisma.config.ts'],
    cwd = 'prompt-service',
  } = options;
  if (isSetupComplete && container) {
    return container.getConnectionUri();
  }

  console.log('[testcontainers] Starting PostgreSQL container...');

  container = await new PostgreSqlContainer(TEST_DB_CONFIG.image)
    .withDatabase(TEST_DB_CONFIG.database)
    .withUsername(TEST_DB_CONFIG.username)
    .withPassword(TEST_DB_CONFIG.password)
    .start();

  const connectionUri = container.getConnectionUri();
  process.env.DATABASE_URL = connectionUri;

  console.log('[testcontainers] Running migrations...');

  try {
    // Use node to run prisma CLI directly for security and PATH reliability
    // execFileSync avoids shell injection and process.execPath ensures node is found
    // In a monorepo, binaries are in root node_modules, so use PROJECT_ROOT for prisma
    // but absoluteCwd for the migration config (prompt-service has prisma.config.ts)
    const absoluteCwd = resolve(PROJECT_ROOT, cwd);
    const prismaBin = resolve(PROJECT_ROOT, 'node_modules/.bin/prisma');
    execFileSync(
      process.execPath,
      [prismaBin, ...migrationArgs],
      {
        env: { ...process.env, DATABASE_URL: connectionUri },
        stdio: 'pipe',
        cwd: absoluteCwd,
      }
    );
  } catch (error) {
    console.error('[testcontainers] Migration failed:', error);
    await container.stop();
    throw error;
  }

  console.log('[testcontainers] Creating Prisma client...');
  testPrismaClient = prismaClientFactory();
  setTestPrisma(testPrismaClient);

  isSetupComplete = true;
  console.log('[testcontainers] Setup complete');

  return connectionUri;
}

/**
 * Tears down the PostgreSQL testcontainer.
 * This should be called in globalTeardown or afterAll.
 */
export async function teardownTestContainer(): Promise<void> {
  console.log('[testcontainers] Tearing down...');

  if (testPrismaClient) {
    await testPrismaClient.$disconnect();
    testPrismaClient = null;
  }

  if (container) {
    await container.stop();
    container = null;
  }

  isSetupComplete = false;
  console.log('[testcontainers] Teardown complete');
}

/**
 * Gets the current test database URL.
 * Returns undefined if container is not started.
 */
export function getTestDatabaseUrl(): string | undefined {
  return container?.getConnectionUri();
}

/**
 * Checks if the testcontainer is running.
 */
export function isContainerRunning(): boolean {
  return isSetupComplete && container !== null;
}

/**
 * Gets the test Prisma client.
 * Throws if setup has not been completed.
 */
export function getTestPrismaClient(): PrismaClient {
  if (!testPrismaClient) {
    throw new Error(
      'Test Prisma client not initialized. Call setupTestContainer() first.'
    );
  }
  return testPrismaClient;
}
