/**
 * @file prompt-service/src/utils/token.ts
 * @purpose Token generation and hashing utilities for authentication flows
 * @functionality
 * - Generates cryptographically secure random tokens
 * - Hashes tokens with SHA-256 for secure database storage
 * - Used for password reset and email verification tokens
 * - Generates token IDs for refresh tokens
 * - Generates family IDs for token chain tracking
 * - Provides configurable token length for different use cases
 * @dependencies
 * - crypto (Node.js built-in)
 */

import crypto from 'crypto';

/**
 * Default length in bytes for generated tokens.
 * 32 bytes = 256 bits of entropy, resulting in a 64-character hex string.
 */
const DEFAULT_TOKEN_LENGTH = 32;

/**
 * Generates a cryptographically secure random token.
 *
 * @param length - The number of bytes for the token (default: 32)
 * @returns A hex-encoded random token string
 *
 * @example
 * const token = generateSecureToken();
 * // token will be a 64-character hex string like '7f3a2b1c...'
 */
export function generateSecureToken(length: number = DEFAULT_TOKEN_LENGTH): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates a token specifically for password reset flows.
 * Uses 32 bytes (256 bits) of entropy for high security.
 *
 * @returns A 64-character hex-encoded token
 *
 * @example
 * const resetToken = generatePasswordResetToken();
 * // Store in database with expiry time (1 hour recommended)
 */
export function generatePasswordResetToken(): string {
  return generateSecureToken(DEFAULT_TOKEN_LENGTH);
}

/**
 * Generates a token specifically for email verification flows.
 * Uses 32 bytes (256 bits) of entropy for high security.
 *
 * @returns A 64-character hex-encoded token
 *
 * @example
 * const verifyToken = generateEmailVerificationToken();
 * // Store in database with expiry time (24 hours recommended)
 */
export function generateEmailVerificationToken(): string {
  return generateSecureToken(DEFAULT_TOKEN_LENGTH);
}

/**
 * Generates a unique identifier suitable for database records.
 * Uses 16 bytes (128 bits) of entropy, resulting in a 32-character hex string.
 *
 * @returns A 32-character hex-encoded unique identifier
 *
 * @example
 * const tokenId = generateTokenId();
 * // Use as unique identifier for refresh tokens in database
 */
export function generateTokenId(): string {
  return generateSecureToken(16);
}

/**
 * Generates a unique family ID for refresh token chains.
 * All tokens in a refresh chain share the same family ID.
 * Used for token theft detection - if a revoked token is reused,
 * the entire family is invalidated.
 *
 * @returns A 32-character hex-encoded family identifier
 *
 * @example
 * const familyId = generateFamilyId();
 * // Store with initial token, preserve through refreshes
 */
export function generateFamilyId(): string {
  return generateSecureToken(16);
}

/**
 * Hash a token using SHA-256 for secure database storage.
 * Used for password reset and email verification tokens.
 *
 * This provides defense-in-depth: if the database is compromised,
 * attackers cannot use the stored hashes to forge valid tokens.
 *
 * NOTE: SHA-256 is appropriate here because we're hashing cryptographically
 * random tokens with 256 bits of entropy (from crypto.randomBytes), NOT
 * user passwords. bcrypt/scrypt are designed for low-entropy passwords where
 * attackers can perform dictionary attacks. For high-entropy random tokens,
 * SHA-256 provides sufficient security without the computational overhead.
 *
 * @param token - The plaintext token to hash (must be cryptographically random)
 * @returns A 64-character hex-encoded SHA-256 hash
 *
 * @example
 * const token = generatePasswordResetToken();
 * const hashedToken = hashToken(token);
 * // Store hashedToken in database, send token to user
 */
export function hashToken(token: string): string {
  // codeql[js/insufficient-password-hash]: This hashes high-entropy random tokens (256 bits),
  // not user passwords. SHA-256 is appropriate for cryptographically random values.
  return crypto.createHash('sha256').update(token).digest('hex');
}
