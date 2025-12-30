/**
 * @file src/config/auth.config.ts
 * @purpose Configuration constants for authentication behavior
 * @functionality
 * - Defines cache staleness threshold for auth data
 * - Centralizes auth-related timing constants
 * @dependencies
 * - None
 */

/**
 * Cache staleness threshold in milliseconds.
 * After this duration, cached assessments/analyses lists are considered stale
 * and will be refreshed on next access.
 *
 * Default: 5 minutes (300,000ms)
 */
export const AUTH_CACHE_STALE_THRESHOLD_MS = 5 * 60 * 1000;
