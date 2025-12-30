/**
 * @file prompt-service/src/utils/auth.ts
 * @purpose Shared authentication validation utilities
 * @functionality
 * - Validates admin authentication configuration
 * - Returns structured validation results for route handlers and middleware
 * - Centralizes auth config logic to prevent duplication
 * @dependencies
 * - @/config for configuration access
 */

import { config } from '@/config';

/**
 * Result of auth configuration validation
 */
export interface AuthConfigValidationResult {
  /** Whether the configuration is valid for proceeding */
  isValid: boolean;
  /** Error response to send if isValid is false */
  errorResponse: { status: number; error: string } | null;
}

/**
 * Validates the authentication configuration
 * Centralizes the logic for checking admin API key
 * @returns Validation result with status and error details
 */
export function validateAuthConfig(): AuthConfigValidationResult {
  // Check if admin API key is configured
  if (!config.adminApiKey) {
    return {
      isValid: false,
      errorResponse: { status: 503, error: 'Admin access not configured' },
    };
  }

  // Admin API key is configured, proceed normally
  return {
    isValid: true,
    errorResponse: null,
  };
}
