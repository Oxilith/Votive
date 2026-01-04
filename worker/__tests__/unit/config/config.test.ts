/**
 * @file worker/__tests__/unit/config/config.test.ts
 * @purpose Unit tests for configuration loading and validation
 * @functionality
 * - Tests default development configuration values
 * - Tests production validation requirements
 * - Tests Zod schema validation for invalid values
 * - Tests environment variable transformation (string to boolean)
 * @dependencies
 * - vitest for testing framework
 * - Config module under test (dynamically imported)
 */

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    // Reset environment to a clean state
    process.env = { ...originalEnv };
    // Clear any existing env vars that might affect tests
    delete process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
    delete process.env.LOG_LEVEL;
    delete process.env.JOB_TOKEN_CLEANUP_ENABLED;
    delete process.env.JOB_TOKEN_CLEANUP_SCHEDULE;
    delete process.env.WORKER_HEALTH_PORT;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('DATABASE_URL validation', () => {
    it('should throw error if DATABASE_URL is not provided', async () => {
      process.env.NODE_ENV = 'development';

      await expect(import('@/config')).rejects.toThrow('Configuration validation failed');
    });

    it('should accept DATABASE_URL when provided', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/votive';

      const { config } = await import('@/config');

      expect(config.databaseUrl).toBe('postgresql://user:pass@localhost:5432/votive');
    });
  });

  describe('development defaults', () => {
    it('should use default job schedule', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';

      const { config } = await import('@/config');

      expect(config.jobs.tokenCleanup.schedule).toBe('0 * * * *');
    });

    it('should enable job by default', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';

      const { config } = await import('@/config');

      expect(config.jobs.tokenCleanup.enabled).toBe(true);
    });

    it('should use default log level', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';

      const { config } = await import('@/config');

      expect(config.logLevel).toBe('info');
    });

    it('should use default health port', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';

      const { config } = await import('@/config');

      expect(config.healthPort).toBe(3003);
    });
  });

  describe('production configuration', () => {
    it('should throw error if DATABASE_URL is missing in production', async () => {
      process.env.NODE_ENV = 'production';

      await expect(import('@/config')).rejects.toThrow('Configuration validation failed');
    });

    it('should accept DATABASE_URL in production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://prod-db:5432/votive';

      const { config } = await import('@/config');

      expect(config.databaseUrl).toBe('postgresql://prod-db:5432/votive');
    });
  });

  describe('job enabled transformation', () => {
    it('should transform "true" string to boolean true', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';
      process.env.JOB_TOKEN_CLEANUP_ENABLED = 'true';

      const { config } = await import('@/config');

      expect(config.jobs.tokenCleanup.enabled).toBe(true);
    });

    it('should transform "false" string to boolean false', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';
      process.env.JOB_TOKEN_CLEANUP_ENABLED = 'false';

      const { config } = await import('@/config');

      expect(config.jobs.tokenCleanup.enabled).toBe(false);
    });

    it('should treat any non-"false" value as true', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';
      process.env.JOB_TOKEN_CLEANUP_ENABLED = '1';

      const { config } = await import('@/config');

      expect(config.jobs.tokenCleanup.enabled).toBe(true);
    });
  });

  describe('custom schedule', () => {
    it('should use custom schedule when provided', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';
      process.env.JOB_TOKEN_CLEANUP_SCHEDULE = '*/30 * * * *';

      const { config } = await import('@/config');

      expect(config.jobs.tokenCleanup.schedule).toBe('*/30 * * * *');
    });
  });

  describe('log level validation', () => {
    it('should accept valid log levels', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';
      process.env.LOG_LEVEL = 'debug';

      const { config } = await import('@/config');

      expect(config.logLevel).toBe('debug');
    });

    it('should throw error for invalid log level', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';
      process.env.LOG_LEVEL = 'invalid-level';

      await expect(import('@/config')).rejects.toThrow('Configuration validation failed');
    });
  });

  describe('health port configuration', () => {
    it('should use custom health port when provided', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';
      process.env.WORKER_HEALTH_PORT = '4000';

      const { config } = await import('@/config');

      expect(config.healthPort).toBe(4000);
    });
  });

  describe('nodeEnv validation', () => {
    it('should accept development environment', async () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';

      const { config } = await import('@/config');

      expect(config.nodeEnv).toBe('development');
    });

    it('should accept test environment', async () => {
      process.env.NODE_ENV = 'test';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';

      const { config } = await import('@/config');

      expect(config.nodeEnv).toBe('test');
    });

    it('should accept production environment', async () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://prod-db:5432/votive';

      const { config } = await import('@/config');

      expect(config.nodeEnv).toBe('production');
    });

    it('should default to development when NODE_ENV is not set', async () => {
      delete process.env.NODE_ENV;
      process.env.DATABASE_URL = 'postgresql://localhost:5432/votive';

      const { config } = await import('@/config');

      expect(config.nodeEnv).toBe('development');
    });
  });
});
