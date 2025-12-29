/**
 * @file src/components/auth/PasswordResetPage.tsx
 * @purpose Password reset confirmation page for handling reset tokens from email links
 * @functionality
 * - Validates reset token from URL
 * - Renders PasswordResetConfirmForm for setting new password
 * - Shows error state for missing/invalid tokens
 * - Uses shared AuthLayout for consistent styling
 * @dependencies
 * - React (useCallback)
 * - @/components/auth/AuthLayout
 * - @/components/auth/forms/PasswordResetConfirmForm
 * - @/components/shared/icons
 * - @/hooks/useRouting
 */

import { useCallback } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import { PasswordResetConfirmForm } from '@/components/auth/forms';
import { ErrorCircleIcon } from '@/components/shared/icons';
import { useRouting } from '@/hooks/useRouting';

/**
 * Props for PasswordResetPage
 */
export interface PasswordResetPageProps {
  /** Reset token from URL */
  token?: string;
}

/**
 * PasswordResetPage - Handles password reset confirmation from email links
 */
const PasswordResetPage: React.FC<PasswordResetPageProps> = ({ token }) => {
  const { navigate } = useRouting();

  const handleNavigateToLanding = useCallback(() => {
    navigate('landing');
  }, [navigate]);

  const handleNavigateToLogin = useCallback(() => {
    navigate('auth', { authMode: 'login' });
  }, [navigate]);

  return (
    <AuthLayout maxWidth="md">
      {token ? (
        <PasswordResetConfirmForm
          token={token}
          onNavigateToLogin={handleNavigateToLogin}
        />
      ) : (
        /* No Token State */
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-red-500 flex items-center justify-center">
            <ErrorCircleIcon size="lg" className="text-red-500" />
          </div>
          <h2 className="font-display text-2xl text-[var(--text-primary)] mb-2">
            Invalid Reset Link
          </h2>
          <p className="font-body text-[var(--text-secondary)] mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleNavigateToLogin}
              className="cta-button w-full py-3 px-6 font-body font-medium text-white bg-[var(--accent)]"
            >
              Go to Sign In
            </button>
            <button
              onClick={handleNavigateToLanding}
              className="w-full py-2 font-body text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default PasswordResetPage;
