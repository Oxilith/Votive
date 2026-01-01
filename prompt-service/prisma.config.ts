/**
 * @file prompt-service/prisma.config.ts
 * @purpose Prisma 7 configuration for database migrations
 * @functionality
 * - Provides database URL for Prisma Migrate
 * - Required since Prisma 7 removed url from schema.prisma datasource
 * @dependencies
 * - @prisma/config for defineConfig
 */

import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  },
});
