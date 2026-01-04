/**
 * @file prompt-service/prisma.config.ts
 * @purpose Prisma 7 configuration for database migrations
 * @functionality
 * - Provides PostgreSQL database URL for Prisma Migrate
 * - Required since Prisma 7 removed url from schema.prisma datasource
 * - Only requires DATABASE_URL for commands that connect to DB
 * @dependencies
 * - @prisma/config for defineConfig
 */

import { defineConfig } from '@prisma/config';

// Commands that don't need database connection
const nonDbCommands = ['generate', 'format', 'validate'];
const currentCommand = process.argv[2]; // e.g., 'generate', 'migrate'

const isDbRequired = !nonDbCommands.includes(currentCommand);
const databaseUrl = process.env.DATABASE_URL;

if (isDbRequired && !databaseUrl) {
  throw new Error(
    `DATABASE_URL environment variable is required for 'prisma ${currentCommand}'`
  );
}

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    // For generate/format/validate: use placeholder (no DB connection needed)
    // For migrate: databaseUrl is guaranteed by the check above
    url: databaseUrl ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
