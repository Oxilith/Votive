/**
 * @file vitest.setup.ts
 * @purpose Set required environment variables before test execution
 * @functionality
 * - Sets ANTHROPIC_API_KEY to prevent config validation errors
 * - Sets NODE_ENV to test mode
 * - Sets LOG_LEVEL to error to reduce test output noise
 * @dependencies
 * - Vitest setup mechanism
 */

// Set required env vars before any module imports
// This runs before test files load, preventing config validation errors
process.env['ANTHROPIC_API_KEY'] = 'test-api-key-for-unit-tests';
process.env['NODE_ENV'] = 'test';
process.env['LOG_LEVEL'] = 'error';
