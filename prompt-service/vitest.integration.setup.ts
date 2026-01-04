/**
 * @file vitest.integration.setup.ts
 * @purpose Setup file for integration tests with PostgreSQL testcontainer
 * @functionality
 * - Starts PostgreSQL container before integration tests
 * - Runs Prisma migrations
 * - Injects test Prisma client into service layer via setTestPrismaClient
 * - Tears down container after tests complete
 * @dependencies
 * - @votive/shared/testing for testcontainers utilities
 * - @votive/shared/prisma for PrismaClient
 * - @prisma/adapter-pg for PostgreSQL driver adapter
 * - @/prisma/client for test injection
 */

import { PrismaClient } from '@votive/shared/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  setupTestContainer,
  teardownTestContainer,
  cleanupTestDb,
} from '@votive/shared/testing';
import {
  setTestPrismaClient,
  clearTestPrismaClient,
} from '@/prisma/client';

// Create Prisma client factory using PrismaPg adapter (Prisma 7+)
// DATABASE_URL is set in process.env by testcontainer before this runs
const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL not set - testcontainer should set this');
  }
  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  // Inject test client into service layer so services use testcontainer DB
  setTestPrismaClient(client);

  return client;
};

// Global setup - runs once before all integration tests
beforeAll(async () => {
  await setupTestContainer(createPrismaClient);
}, 120000); // 2 minute timeout for container startup

// Cleanup between tests
beforeEach(async () => {
  await cleanupTestDb();
});

// Global teardown - runs once after all integration tests
afterAll(async () => {
  clearTestPrismaClient();
  await teardownTestContainer();
});
