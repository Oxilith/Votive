/**
 * @file prompt-service/src/routes/user-auth.routes.ts
 * @purpose Express router for user authentication endpoints
 * @functionality
 * - Routes for user registration and login
 * - Routes for token refresh and logout
 * - Routes for password reset flow (request and confirm)
 * - Routes for email verification
 * - Wraps controller methods with async error handling
 * - Applies JWT authentication middleware to protected routes
 * @dependencies
 * - express Router
 * - @/controllers/user-auth.controller for request handling
 * - @/middleware/jwt-auth.middleware for protected routes
 */

import { Router, Request, Response, NextFunction } from 'express';
import { userAuthController } from '@/controllers/user-auth.controller.js';
import { jwtAuthMiddleware } from '@/middleware/jwt-auth.middleware.js';

const router = Router();

// Async wrapper to catch errors
const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res)).catch(next);
  };

// Public routes - no authentication required

// Registration
router.post('/register', asyncHandler(userAuthController.register.bind(userAuthController)));

// Login
router.post('/login', asyncHandler(userAuthController.login.bind(userAuthController)));

// Token refresh (uses cookie for refresh token)
router.post('/refresh', asyncHandler(userAuthController.refresh.bind(userAuthController)));

// Password reset - request email
router.post(
  '/password-reset',
  asyncHandler(userAuthController.requestPasswordReset.bind(userAuthController))
);

// Password reset - confirm with token
router.post(
  '/password-reset/confirm',
  asyncHandler(userAuthController.confirmPasswordReset.bind(userAuthController))
);

// Email verification (token in URL)
router.get(
  '/verify-email/:token',
  asyncHandler(userAuthController.verifyEmail.bind(userAuthController))
);

// Logout (works with or without authentication)
router.post('/logout', asyncHandler(userAuthController.logout.bind(userAuthController)));

// Protected routes - require JWT authentication

// Resend verification email
router.post(
  '/resend-verification',
  jwtAuthMiddleware,
  asyncHandler(userAuthController.resendVerification.bind(userAuthController))
);

// Logout from all sessions
router.post(
  '/logout-all',
  jwtAuthMiddleware,
  asyncHandler(userAuthController.logoutAll.bind(userAuthController))
);

// Get current user profile
router.get(
  '/me',
  jwtAuthMiddleware,
  asyncHandler(userAuthController.getCurrentUser.bind(userAuthController))
);

export { router as userAuthRoutes };
