/**
 * @file shared/src/testing/utils/index.ts
 * @purpose Barrel export for testing utility functions
 * @functionality
 * - Exports async utilities (flushPromises, advanceTimersAndFlush, runAllTimersAndFlush)
 * - Exports Express mock utilities (createMockRequest, createMockResponse, createMockNext)
 * - Exports RequestBuilder for fluent HTTP request building in tests
 * - Exports test app utilities (createTestApp, createTestRequest, createAuthenticatedRequest)
 * @dependencies
 * - ./async.utils
 * - ./express.utils
 * - ./request-builder
 * - ./test-app.utils
 */

export {
  flushPromises,
  advanceTimersAndFlush,
  runAllTimersAndFlush,
} from './async.utils';

export {
  createMockRequest,
  createMockResponse,
  createMockNext,
  type MockRequest,
  type MockRequestOptions,
  type MockResponse,
  type MockNextFunction,
} from './express.utils';

export { RequestBuilder, requestBuilder } from './request-builder';

export {
  createTestApp,
  createTestRequest,
  createTestAgent,
  createAuthenticatedRequest,
  type TestAppOptions,
  type AuthenticatedRequestBuilder,
} from './test-app.utils';
