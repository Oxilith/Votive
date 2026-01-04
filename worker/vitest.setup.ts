/**
 * @file vitest.setup.ts
 * @purpose Set required environment variables before test execution
 * @functionality
 * - Mocks dotenv to suppress promotional tips during tests
 * - Sets NODE_ENV to test mode
 * - Sets LOG_LEVEL to silent to suppress all log output during tests
 * - Clears mocks after each test
 * @dependencies
 * - Vitest setup mechanism
 */

// Mock dotenv to suppress promotional tips during tests
vi.mock('dotenv', () => ({
  config: vi.fn(() => ({ parsed: process.env })),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
// Use 'silent' to suppress all log output during tests
process.env.LOG_LEVEL = 'silent';
// Use PostgreSQL for tests - integration tests will check actual availability
// Unit tests mock Prisma so this just needs to be a valid connection string
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/votive_test';

// Reset mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Restore mocks after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
