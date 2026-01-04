/**
 * @file worker/src/config/index.ts
 * @purpose Centralized environment configuration with validation for worker service
 * @functionality
 * - Loads environment variables from .env file
 * - Validates required DATABASE_URL for PostgreSQL connection
 * - Provides typed configuration object for application use
 * - Configures job-specific settings (enabled/schedule)
 * - Configures health server port (default: 3003)
 * @dependencies
 * - dotenv for environment variable loading
 * - zod for schema validation
 */

import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

dotenvConfig();

const configSchema = z.object({
  // Environment
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),

  // Database (shared with prompt-service) - PostgreSQL connection string
  databaseUrl: z.string().min(1, 'DATABASE_URL is required'),

  // Logging
  logLevel: z.enum(['silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Health check server port
  healthPort: z.coerce.number().int().positive().default(3003),

  // Job Configuration
  jobs: z.object({
    tokenCleanup: z.object({
      enabled: z
        .string()
        .default('true')
        .transform((val) => val !== 'false'),
      schedule: z.string().default('0 * * * *'), // Every hour by default
    }),
  }),
});

type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const result = configSchema.safeParse({
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    logLevel: process.env.LOG_LEVEL,
    healthPort: process.env.WORKER_HEALTH_PORT,
    jobs: {
      tokenCleanup: {
        enabled: process.env.JOB_TOKEN_CLEANUP_ENABLED,
        schedule: process.env.JOB_TOKEN_CLEANUP_SCHEDULE,
      },
    },
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Configuration validation failed:\n${errors}`);
  }

  return result.data;
}

export const config = loadConfig();

export type { Config };
