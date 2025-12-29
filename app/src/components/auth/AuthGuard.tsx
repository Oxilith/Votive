/**
 * @file src/components/auth/AuthGuard.tsx
 * @purpose Wrapper component that handles authentication requirements for protected views
 * @functionality
 * - Checks if user is authenticated
 * - Redirects to auth page when authentication is required
 * - Supports "soft" guard mode for prompting instead of blocking
 * - Initializes auth state on first render
 * @dependencies
 * - React (useEffect, useState)
 * - @/stores/useAuthStore
 * - @/hooks/useRouting
 * - @/services/api/AuthService
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore, useIsAuthenticated, useAuthInitialized } from '@/stores/useAuthStore';
import { useRouting } from '@/hooks/useRouting';
import { authService } from '@/services/api/AuthService';
import { LoadingSpinnerIcon } from '@/components/shared/icons';

/**
 * Props for AuthGuard component
 */
export interface AuthGuardProps {
  /** Child content to render when authenticated */
  children: ReactNode;
  /** Whether authentication is strictly required (redirects) or optional (shows prompt) */
  mode?: 'required' | 'optional';
  /** Fallback component to show while checking auth */
  fallback?: ReactNode;
}

/**
 * Loading spinner for auth check
 */
const AuthLoading: React.FC = () => (
  <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinnerIcon size="lg" className="text-[var(--accent)] mx-auto mb-4" />
      <p className="font-body text-[var(--text-secondary)]">Loading...</p>
    </div>
  </div>
);

/**
 * AuthGuard - Protects views that require authentication
 *
 * @example
 * // Required auth - redirects to login
 * <AuthGuard mode="required">
 *   <ProfilePage />
 * </AuthGuard>
 *
 * @example
 * // Optional auth - allows access, can show prompts
 * <AuthGuard mode="optional">
 *   <InsightsPage />
 * </AuthGuard>
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  mode = 'required',
  fallback,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useAuthInitialized();
  const { setAuth, setInitialized, setLoading, clearAuth } = useAuthStore();
  const { navigate } = useRouting();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Skip if already initialized
      if (isInitialized) return;

      setLoading(true);

      try {
        // Try to refresh token and get current user
        const refreshResponse = await authService.refreshToken();
        const user = await authService.getCurrentUser();
        setAuth(user, refreshResponse.accessToken);
      } catch {
        // No valid session - clear any stale auth state
        clearAuth();
      } finally {
        setLoading(false);
        setInitialized();
      }
    };

    initAuth();
  }, [isInitialized, setAuth, setInitialized, setLoading, clearAuth]);

  // Handle redirect for required mode
  useEffect(() => {
    if (isInitialized && mode === 'required' && !isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      navigate('auth', { authMode: 'login', replace: true });
    }
  }, [isInitialized, mode, isAuthenticated, hasRedirected, navigate]);

  // Show loading while initializing or redirecting
  if (!isInitialized || (mode === 'required' && !isAuthenticated)) {
    return <>{fallback ?? <AuthLoading />}</>;
  }

  // Render children (for optional mode, always render regardless of auth state)
  return <>{children}</>;
};

export default AuthGuard;
