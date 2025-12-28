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
 * User data without sensitive fields
 */
export interface SafeUser {
  id: string;
  email: string;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for user registration
 */
export interface RegisterInput {
  email: string;
  password: string;
}

/**
 * Input for user login
 */
export interface LoginInput {
  email: string;
  password: string;
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
   * Creates user with hashed password and sends verification email
   *
   * @param input - Registration details (email, password)
   * @returns Authentication result with user and tokens
   * @throws ConflictError if email already exists
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create user and tokens in a transaction
    const { user, refreshTokenRecord, emailVerifyToken } = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          password: hashedPassword,
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
}

// Export singleton instance
export const userService = new UserService();
