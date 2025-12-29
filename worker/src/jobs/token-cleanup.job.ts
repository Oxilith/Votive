/**
 * @file worker/src/jobs/token-cleanup.job.ts
 * @purpose Scheduled job to clean up expired authentication tokens
 * @functionality
 * - Deletes expired refresh tokens
 * - Deletes expired or used password reset tokens
 * - Deletes expired or used email verification tokens
 * - Reports cleanup metrics for monitoring
 * @dependencies
 * - @/prisma/client for database access
 * - @/config for job configuration
 * - @/jobs for Job interface
 */

import { prisma } from '@/prisma/client.js';
import { config } from '@/config/index.js';
import type { Job, JobResult } from '@/jobs/index.js';

/**
 * Token cleanup job
 * Removes expired and used tokens to prevent database bloat
 * Default schedule: Every hour (0 * * * *)
 */
export const tokenCleanupJob: Job = {
  name: 'token-cleanup',
  schedule: config.jobs.tokenCleanup.schedule,
  enabled: config.jobs.tokenCleanup.enabled,

  async run(): Promise<JobResult> {
    const now = new Date();

    try {
      // Delete expired refresh tokens
      const refreshResult = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: { lt: now },
        },
      });

      // Delete expired OR used password reset tokens
      const passwordResult = await prisma.passwordResetToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }],
        },
      });

      // Delete expired OR used email verification tokens
      const emailResult = await prisma.emailVerifyToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: now } }, { usedAt: { not: null } }],
        },
      });

      const totalDeleted = refreshResult.count + passwordResult.count + emailResult.count;

      return {
        success: true,
        message: `Token cleanup completed. Deleted ${totalDeleted} expired/used tokens.`,
        metrics: {
          refreshTokensDeleted: refreshResult.count,
          passwordResetTokensDeleted: passwordResult.count,
          emailVerifyTokensDeleted: emailResult.count,
          totalDeleted,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `Token cleanup failed: ${message}`,
        metrics: {
          refreshTokensDeleted: 0,
          passwordResetTokensDeleted: 0,
          emailVerifyTokensDeleted: 0,
          totalDeleted: 0,
        },
      };
    }
  },
};
