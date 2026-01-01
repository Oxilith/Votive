/**
 * @file prompt-service/src/testing/index.ts
 * @purpose Barrel export for prompt-service testing utilities
 * @functionality
 * - Exports integration test setup and helpers
 * - Exports test app factory and authenticated request builders
 * - Re-exports shared fixtures (MOCK_PASSWORD)
 * @dependencies
 * - ./integration-setup
 * - shared (MOCK_PASSWORD)
 */

export {
  TEST_CONFIG,
  createIntegrationTestApp,
  createTestAgent,
  createAuthenticatedRequest,
  integrationTestHooks,
  registerTestUser,
  loginTestUser,
  prisma,
  type AuthenticatedRequestBuilder,
} from './integration-setup';

// Re-export shared fixtures for convenience
export { MOCK_PASSWORD } from '@votive/shared/testing';
