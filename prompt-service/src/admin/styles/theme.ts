/**
 * @file prompt-service/src/admin/styles/theme.ts
 * @purpose Shared theme constants for the admin dashboard using Ink & Stone design system
 * @functionality
 * - Defines color references using CSS variables for light/dark theme switching
 * - Provides reusable style objects for common components (cards, buttons, forms, modals)
 * - Exports theme toggle utility function with localStorage persistence
 * - Exports getTheme function to check current theme state
 * @dependencies
 * - CSS variables defined in index.html (--bg-primary, --text-primary, --accent, etc.)
 * - React CSSProperties for type-safe inline styles
 */

import type React from 'react';

// Color references using CSS variables
export const colors = {
  bgPrimary: 'var(--bg-primary)',
  bgSecondary: 'var(--bg-secondary)',
  bgTertiary: 'var(--bg-tertiary)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  textFaint: 'var(--text-faint)',
  accent: 'var(--accent)',
  accentHover: 'var(--accent-hover)',
  border: 'var(--border)',
  borderStrong: 'var(--border-strong)',
  success: 'var(--color-success)',
  successText: 'var(--color-success-text)',
  successBg: 'var(--color-success-bg)',
  danger: 'var(--color-danger)',
  dangerText: 'var(--color-danger-text)',
  dangerBg: 'var(--color-danger-bg)',
  dangerBorder: 'var(--color-danger-border)',
};

export const fonts = {
  display: 'var(--font-display)',
  body: 'var(--font-body)',
  mono: 'var(--font-mono)',
};

export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
};

// Common reusable styles
export const commonStyles: Record<string, React.CSSProperties> = {
  // Layout
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  // Cards
  card: {
    backgroundColor: colors.bgPrimary,
    borderRadius: '0.75rem',
    padding: '1.5rem',
    boxShadow: shadows.sm,
    border: `1px solid ${colors.border}`,
  },

  // Section titles
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.textPrimary,
    margin: '0 0 1rem 0',
  },

  // Primary button
  buttonPrimary: {
    padding: '0.625rem 1.25rem',
    backgroundColor: colors.accent,
    border: 'none',
    borderRadius: '0.5rem',
    color: '#fff',
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },

  // Secondary/outline button
  buttonSecondary: {
    padding: '0.625rem 1.25rem',
    backgroundColor: colors.bgPrimary,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: '0.5rem',
    color: colors.textPrimary,
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },

  // Danger button
  buttonDanger: {
    padding: '0.625rem 1.25rem',
    backgroundColor: colors.danger,
    border: 'none',
    borderRadius: '0.5rem',
    color: '#fff',
    fontWeight: 500,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },

  // Form input
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: fonts.body,
    backgroundColor: colors.bgPrimary,
    color: colors.textPrimary,
    resize: 'vertical' as const,
  },

  // Form select
  select: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: fonts.body,
    backgroundColor: colors.bgPrimary,
    color: colors.textPrimary,
  },

  // Form label
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.textSecondary,
    marginBottom: '0.375rem',
  },

  // Form group
  formGroup: {
    marginBottom: '1rem',
    flex: 1,
  },

  // Link style
  link: {
    color: colors.accent,
    textDecoration: 'none',
    fontWeight: 500,
    cursor: 'pointer',
  },

  // Back link
  backLink: {
    color: colors.textMuted,
    textDecoration: 'none',
    fontSize: '0.875rem',
    display: 'inline-block',
    marginBottom: '0.5rem',
  },

  // Page title
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
  },

  // Error box
  errorBox: {
    padding: '1rem',
    backgroundColor: colors.dangerBg,
    border: `1px solid ${colors.dangerBorder}`,
    borderRadius: '0.5rem',
    color: colors.dangerText,
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  },

  // Status badges
  badgeActive: {
    padding: '0.25rem 0.75rem',
    backgroundColor: colors.successBg,
    color: colors.successText,
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  badgeInactive: {
    padding: '0.25rem 0.75rem',
    backgroundColor: colors.dangerBg,
    color: colors.dangerText,
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
  },

  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeader: {
    backgroundColor: colors.bgSecondary,
    textAlign: 'left' as const,
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: `1px solid ${colors.border}`,
  },
  tableCell: {
    padding: '1rem',
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textPrimary,
  },

  // Modal
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.bgPrimary,
    borderRadius: '0.75rem',
    padding: '1.5rem',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    border: `1px solid ${colors.border}`,
    boxShadow: shadows.md,
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.textPrimary,
    margin: '0 0 1.5rem 0',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },

  // Code/monospace text
  code: {
    fontFamily: fonts.mono,
    fontSize: '0.8125rem',
    backgroundColor: colors.bgTertiary,
    padding: '0.75rem',
    borderRadius: '0.375rem',
    overflow: 'auto',
    whiteSpace: 'pre-wrap' as const,
  },

  // Danger zone
  dangerZone: {
    backgroundColor: colors.bgPrimary,
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: `1px solid ${colors.dangerBorder}`,
  },
};

// Theme toggle utility
export function toggleTheme(): boolean {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('votive-admin-theme', isDark ? 'dark' : 'light');
  return isDark;
}

export function getTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
