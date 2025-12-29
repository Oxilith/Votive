/**
 * @file prompt-service/src/services/user.service.ts
 * @purpose User authentication operations with JWT token management
 * @functionality
 * - Registers new users with hashed passwords
 * - Authenticates users and issues JWT access/refresh tokens
 * - Refreshes access tokens using valid refresh tokens
 * - Initiates password reset with email delivery
 * - Confirms password reset with token validation
 * - Verifies email addresses with token validation
 * - Invalidates refresh tokens on logout
 * @dependencies
 * - @/prisma/client for database access
 * - @/utils/jwt for token generation/verification
 * - @/utils/password for bcrypt hashing
 * - @/utils/token for secure token generation
 * - @/services/email.service for email delivery
 * - @/config for application configuration
 * - @/errors for custom error types
 */

import { prisma } from '@/prisma/client.js';
import type { User } from '@prisma/client';
import { config } from '@/config/index.js';
import { NotFoundError, ConflictError } from '@/errors/index.js';
import { hashPassword, comparePassword } from '@/utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  type JwtConfig,
} from '@/utils/jwt.js';
import {
  generateTokenId,
  generatePasswordResetToken,
  generateEmailVerificationToken,
} from '@/utils/token.js';
import { emailService } from '@/services/email.service.js';

/**
 * Token expiry constants in milliseconds
 */
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PASSWORD_RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFY_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Gender options for user profile
 */
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

/**
 * User data without sensitive fields
 */
export interface SafeUser {
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  name: string;
  gender: Gender | null;
  birthYear: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for user registration
 */
export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  gender?: Gender;
  birthYear: number;
}

/**
 * Input for user login
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Input for profile update
 */
export interface ProfileUpdateInput {
  name?: string;
  gender?: Gender;
  birthYear?: number;
}

/**
 * Input for password change
 */
export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Saved assessment with metadata
 */
export interface SavedAssessment {
  id: string;
  userId: string;
  responses: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Saved analysis with metadata
 */
export interface SavedAnalysis {
  id: string;
  userId: string;
  assessmentId: string | null;
  result: string; // JSON string
  createdAt: Date;
}

/**
 * Result of successful authentication
 */
export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Result of token refresh
 */
export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

/**
 * Result of registration request
 * Returns generic message to prevent email enumeration
 */
export interface RegistrationResult {
  success: true;
  message: string;
}

/**
 * Custom error for authentication failures
 */
export class AuthenticationError extends Error {
  readonly statusCode = 401;
  readonly code = 'AUTHENTICATION_FAILED';

  constructor(message: string = 'Invalid email or password') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Custom error for invalid/expired tokens
 */
export class TokenError extends Error {
  readonly statusCode = 401;
  readonly code: string;

  constructor(message: string, code: string = 'INVALID_TOKEN') {
    super(message);
    this.name = 'TokenError';
    this.code = code;
  }
}

/**
 * Strips sensitive fields from user object
 */
function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    emailVerifiedAt: user.emailVerifiedAt,
    name: user.name,
    gender: user.gender as Gender | null,
    birthYear: user.birthYear,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserService {
  private jwtConfig: JwtConfig;

  constructor() {
    // Build JWT config from application configuration
    // Use fallback secrets in development for testing
    this.jwtConfig = {
      accessSecret: config.jwtAccessSecret ?? 'dev-access-secret-change-in-production',
      refreshSecret: config.jwtRefreshSecret ?? 'dev-refresh-secret-change-in-production',
      accessExpiresIn: config.jwtAccessExpiry,
      refreshExpiresIn: config.jwtRefreshExpiry,
    };
  }

  /**
   * Register a new user account
   * Creates user with hashed password and optionally sends verification email
   *
   * Security: Uses timing-safe comparison to prevent enumeration via timing attacks.
   * Returns tokens immediately - email verification is optional (for SMTP-less deployments).
   *
   * @param input - Registration details (email, password)
   * @returns Authentication result with user and tokens, or throws ConflictError
   * @throws ConflictError if email already exists
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      // Hash dummy password to prevent timing attacks
      await hashPassword('dummy-password-for-timing');
      throw new ConflictError('Email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user and tokens in a transaction
    const { user, refreshTokenRecord, emailVerifyToken } = await prisma.$transaction(async (tx) => {
      // Create user with profile fields
      const newUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          password: hashedPassword,
          name: input.name,
          gender: input.gender ?? null,
          birthYear: input.birthYear,
        },
      });

      // Generate and store refresh token
      const tokenId = generateTokenId();
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
      const refreshTokenValue = generateRefreshToken(newUser.id, tokenId, this.jwtConfig);

      const newRefreshToken = await tx.refreshToken.create({
        data: {
          userId: newUser.id,
          token: tokenId,
          expiresAt,
        },
      });

      // Generate and store email verification token
      const verificationToken = generateEmailVerificationToken();
      const verifyExpiresAt = new Date(Date.now() + EMAIL_VERIFY_TOKEN_EXPIRY_MS);

      const newEmailVerifyToken = await tx.emailVerifyToken.create({
        data: {
          userId: newUser.id,
          token: verificationToken,
          expiresAt: verifyExpiresAt,
        },
      });

      return {
        user: newUser,
        refreshTokenRecord: { ...newRefreshToken, tokenValue: refreshTokenValue },
        emailVerifyToken: newEmailVerifyToken,
      };
    });

    // Send verification email (don't fail registration if email fails)
    // This is optional - works without SMTP configured
    await emailService.sendEmailVerificationEmail({
      to: user.email,
      verificationToken: emailVerifyToken.token,
    });

    // Generate access token
    const accessToken = generateAccessToken(user.id, this.jwtConfig);

    return {
      user: toSafeUser(user),
      accessToken,
      refreshToken: refreshTokenRecord.tokenValue,
    };
  }

  /**
   * Authenticate a user with email and password
   *
   * @param input - Login credentials (email, password)
   * @returns Authentication result with user and tokens
   * @throws AuthenticationError if credentials are invalid
   */
  async login(input: LoginInput): Promise<AuthResult> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    // Use constant-time comparison to prevent timing attacks
    // Always hash password even if user doesn't exist
    if (!user) {
      // Hash a dummy password to prevent timing-based user enumeration
      await hashPassword('dummy-password-for-timing');
      throw new AuthenticationError();
    }

    // Verify password
    const isValidPassword = await comparePassword(input.password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError();
    }

    // Generate and store refresh token
    const tokenId = generateTokenId();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
    const refreshTokenValue = generateRefreshToken(user.id, tokenId, this.jwtConfig);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokenId,
        expiresAt,
      },
    });

    // Generate access token
    const accessToken = generateAccessToken(user.id, this.jwtConfig);

    return {
      user: toSafeUser(user),
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  /**
   * Refresh access token using a valid refresh token
   *
   * @param refreshTokenJwt - The JWT refresh token
   * @returns New access and refresh tokens
   * @throws TokenError if refresh token is invalid or expired
   */
  async refreshTokens(refreshTokenJwt: string): Promise<RefreshResult> {
    // Verify the refresh token JWT
    const verifyResult = verifyRefreshToken(refreshTokenJwt, this.jwtConfig);

    if (!verifyResult.success || !verifyResult.payload) {
      const errorMessage = verifyResult.error === 'expired'
        ? 'Refresh token expired'
        : 'Invalid refresh token';
      throw new TokenError(errorMessage, verifyResult.error === 'expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN');
    }

    const { userId, tokenId } = verifyResult.payload;

    // Find the refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenId },
    });

    // Validate stored token
    if (!storedToken || storedToken.userId !== userId) {
      throw new TokenError('Invalid refresh token');
    }

    // Check if token is expired in database
    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new TokenError('Refresh token expired', 'TOKEN_EXPIRED');
    }

    // Rotate refresh token for security
    const newTokenId = generateTokenId();
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
    const newRefreshTokenValue = generateRefreshToken(userId, newTokenId, this.jwtConfig);

    // Delete old token and create new one in transaction
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({
        where: { id: storedToken.id },
      });

      await tx.refreshToken.create({
        data: {
          userId,
          token: newTokenId,
          expiresAt: newExpiresAt,
        },
      });
    });

    // Generate new access token
    const accessToken = generateAccessToken(userId, this.jwtConfig);

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
    };
  }

  /**
   * Initiate password reset flow
   * Generates reset token and sends email
   *
   * @param email - User's email address
   * @returns True if email was sent (always returns true to prevent enumeration)
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent user enumeration
    if (!user) {
      return true;
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY_MS);

    // Store token in database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Send reset email
    await emailService.sendPasswordResetEmail({
      to: user.email,
      resetToken,
    });

    return true;
  }

  /**
   * Complete password reset with token validation
   *
   * @param token - Password reset token from email
   * @param newPassword - New password to set
   * @throws TokenError if token is invalid or expired
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Validate token exists and hasn't been used
    if (!resetToken || resetToken.usedAt !== null) {
      throw new TokenError('Invalid or expired password reset token');
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      throw new TokenError('Password reset token expired', 'TOKEN_EXPIRED');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and mark token as used in transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });

      // Invalidate all refresh tokens for security
      await tx.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      });
    });
  }

  /**
   * Verify user's email address
   *
   * @param token - Email verification token
   * @throws TokenError if token is invalid or expired
   */
  async verifyEmail(token: string): Promise<SafeUser> {
    // Find the verification token
    const verifyToken = await prisma.emailVerifyToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Validate token exists and hasn't been used
    if (!verifyToken || verifyToken.usedAt !== null) {
      throw new TokenError('Invalid or expired verification token');
    }

    // Check if token is expired
    if (verifyToken.expiresAt < new Date()) {
      throw new TokenError('Verification token expired', 'TOKEN_EXPIRED');
    }

    // Update user and mark token as used in transaction
    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: verifyToken.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      await tx.emailVerifyToken.update({
        where: { id: verifyToken.id },
        data: { usedAt: new Date() },
      });

      return updatedUser;
    });

    return toSafeUser(user);
  }

  /**
   * Resend email verification
   *
   * @param userId - User ID to resend verification for
   * @returns True if email was sent
   * @throws NotFoundError if user not found
   */
  async resendEmailVerification(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    if (user.emailVerified) {
      return false; // Already verified
    }

    // Generate new verification token
    const verificationToken = generateEmailVerificationToken();
    const expiresAt = new Date(Date.now() + EMAIL_VERIFY_TOKEN_EXPIRY_MS);

    await prisma.emailVerifyToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // Send verification email
    await emailService.sendEmailVerificationEmail({
      to: user.email,
      verificationToken,
    });

    return true;
  }

  /**
   * Logout user by invalidating refresh token
   *
   * @param refreshTokenJwt - The JWT refresh token to invalidate
   * @returns True if token was invalidated
   */
  async logout(refreshTokenJwt: string): Promise<boolean> {
    // Verify the refresh token JWT to get the token ID
    const verifyResult = verifyRefreshToken(refreshTokenJwt, this.jwtConfig);

    if (!verifyResult.success || !verifyResult.payload) {
      return false; // Invalid token, nothing to do
    }

    const { tokenId } = verifyResult.payload;

    // Delete the refresh token from database
    const result = await prisma.refreshToken.deleteMany({
      where: { token: tokenId },
    });

    return result.count > 0;
  }

  /**
   * Logout user from all sessions by invalidating all refresh tokens
   *
   * @param userId - User ID to logout from all sessions
   * @returns Number of sessions invalidated
   */
  async logoutAll(userId: string): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  /**
   * Get user by ID
   *
   * @param id - User ID
   * @returns User without sensitive fields, or null if not found
   */
  async getById(id: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? toSafeUser(user) : null;
  }

  /**
   * Get user by email
   *
   * @param email - User email
   * @returns User without sensitive fields, or null if not found
   */
  async getByEmail(email: string): Promise<SafeUser | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    return user ? toSafeUser(user) : null;
  }

  /**
   * Update user profile
   *
   * @param userId - User ID
   * @param input - Profile update data
   * @returns Updated user without sensitive fields
   * @throws NotFoundError if user not found
   */
  async updateProfile(userId: string, input: ProfileUpdateInput): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.gender !== undefined && { gender: input.gender }),
        ...(input.birthYear !== undefined && { birthYear: input.birthYear }),
      },
    });

    return toSafeUser(updatedUser);
  }

  /**
   * Change user password
   *
   * @param userId - User ID
   * @param input - Current and new password
   * @throws NotFoundError if user not found
   * @throws AuthenticationError if current password is wrong
   */
  async changePassword(userId: string, input: PasswordChangeInput): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Verify current password
    const isValidPassword = await comparePassword(input.currentPassword, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password and update
    const hashedPassword = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete user account and all related data
   *
   * @param userId - User ID
   * @throws NotFoundError if user not found
   */
  async deleteAccount(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User', userId);
    }

    // Cascade delete will handle related records
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Save assessment for user
   *
   * @param userId - User ID
   * @param responses - Assessment responses as JSON string
   * @returns Saved assessment
   */
  async saveAssessment(userId: string, responses: string): Promise<SavedAssessment> {
    const assessment = await prisma.assessment.create({
      data: {
        userId,
        responses,
      },
    });

    return assessment;
  }

  /**
   * Get user's assessments
   *
   * @param userId - User ID
   * @returns List of saved assessments
   */
  async getAssessments(userId: string): Promise<SavedAssessment[]> {
    const assessments = await prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return assessments;
  }

  /**
   * Get specific assessment by ID
   *
   * @param assessmentId - Assessment ID
   * @param userId - User ID for ownership verification
   * @returns Assessment or null if not found/not owned
   */
  async getAssessmentById(assessmentId: string, userId: string): Promise<SavedAssessment | null> {
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        userId,
      },
    });

    return assessment;
  }

  /**
   * Save analysis for user
   *
   * @param userId - User ID
   * @param result - Analysis result as JSON string
   * @param assessmentId - Optional linked assessment ID
   * @returns Saved analysis
   */
  async saveAnalysis(userId: string, result: string, assessmentId?: string): Promise<SavedAnalysis> {
    const analysis = await prisma.analysis.create({
      data: {
        userId,
        result,
        assessmentId: assessmentId ?? null,
      },
    });

    return analysis;
  }

  /**
   * Get user's analyses
   *
   * @param userId - User ID
   * @returns List of saved analyses
   */
  async getAnalyses(userId: string): Promise<SavedAnalysis[]> {
    const analyses = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return analyses;
  }

  /**
   * Get specific analysis by ID
   *
   * @param analysisId - Analysis ID
   * @param userId - User ID for ownership verification
   * @returns Analysis or null if not found/not owned
   */
  async getAnalysisById(analysisId: string, userId: string): Promise<SavedAnalysis | null> {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId,
      },
    });

    return analysis;
  }
}

// Export singleton instance
export const userService = new UserService();
