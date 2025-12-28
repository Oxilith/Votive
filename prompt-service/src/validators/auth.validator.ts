/**
 * @file prompt-service/src/validators/auth.validator.ts
 * @purpose Zod validation schemas for authentication API endpoints
 * @functionality
 * - Validates user registration requests
 * - Validates login requests
 * - Validates password reset requests (request and confirm)
 * - Validates email verification token parameters
 * - Provides type-safe request body parsing
 * @dependencies
 * - zod for schema validation
 */

import { z } from 'zod';

/**
 * Minimum password length as per security requirements
 * @see spec.md - "Validation: Email format, password minimum 8 characters"
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Maximum password length to prevent DoS via bcrypt
 * bcrypt has a 72-byte limit, but we set a reasonable max
 */
export const MAX_PASSWORD_LENGTH = 128;

/**
 * Maximum email length to prevent abuse
 */
export const MAX_EMAIL_LENGTH = 254;

/**
 * Schema for user registration
 * POST /api/auth/register
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(MAX_EMAIL_LENGTH, `Email must be at most ${MAX_EMAIL_LENGTH} characters`)
    .email('Invalid email format'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`),
});

/**
 * Schema for user login
 * POST /api/auth/login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(MAX_EMAIL_LENGTH)
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(MAX_PASSWORD_LENGTH),
});

/**
 * Schema for password reset request
 * POST /api/auth/password-reset
 */
export const passwordResetRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(MAX_EMAIL_LENGTH)
    .email('Invalid email format'),
});

/**
 * Schema for password reset confirmation
 * POST /api/auth/password-reset/confirm
 */
export const passwordResetConfirmSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`),
});

/**
 * Schema for email verification token parameter
 * GET /api/auth/verify-email/:token
 */
export const emailVerifyTokenParamSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required'),
});

/**
 * Schema for resend email verification request
 * POST /api/auth/resend-verification
 */
export const resendVerificationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(MAX_EMAIL_LENGTH)
    .email('Invalid email format'),
});

// Type exports for type-safe request handling
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
