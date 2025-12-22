/**
 * @file index.ts
 * @purpose Express server entry point
 * @functionality
 * - Runs startup health checks before starting server
 * - Starts HTTP server on configured port
 * - Handles graceful shutdown
 * - Logs server startup information
 * @dependencies
 * - @/app for Express application
 * - @/config for server configuration
 * - @/utils/logger for logging
 * - @/health for health service
 */

import app from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { healthService } from './health/index.js';

async function startServer(): Promise<void> {
  // Run startup health checks
  logger.info('Running startup health checks...');
  const { success, results } = await healthService.runStartupChecks();

  // Log health check results
  for (const [name, result] of Object.entries(results)) {
    if (result.status === 'healthy') {
      logger.info(
        { check: name, latencyMs: result.latencyMs },
        `Health check passed: ${result.message}`
      );
    } else {
      logger.error(
        { check: name, latencyMs: result.latencyMs },
        `Health check failed: ${result.message}`
      );
    }
  }

  if (!success) {
    logger.error('Critical health checks failed, server will not start');
    process.exit(1);
  }

  logger.info('All startup health checks passed');

  // Start the server
  const server = app.listen(config.port, () => {
    logger.info(
      {
        port: config.port,
        env: config.nodeEnv,
        corsOrigin: config.corsOrigin,
      },
      `Server started on port ${config.port}`
    );
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal, closing server');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });
}

startServer().catch((error: unknown) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
