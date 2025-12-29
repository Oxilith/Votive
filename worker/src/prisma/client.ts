/**
 * @file worker/src/prisma/client.ts
 * @purpose Prisma client setup with libsql adapter for encrypted SQLite
 * @functionality
 * - Creates Prisma client with libsql adapter
 * - Supports database encryption via DATABASE_KEY
 * - Shares database with prompt-service
 * @dependencies
 * - @prisma/client for database access
 * - @prisma/adapter-libsql for libsql support
 * - @libsql/client for SQLite with encryption
 * - @/config for database configuration
 */

import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { config } from '@/config/index.js';

// Create libsql client with optional encryption
const libsql = createClient({
  url: config.databaseUrl,
  encryptionKey: config.databaseKey,
});

// Create Prisma adapter
const adapter = new PrismaLibSQL(libsql);

// Create Prisma client with adapter
export const prisma = new PrismaClient({
  adapter,
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
