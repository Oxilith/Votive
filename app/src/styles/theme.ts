/**
 * @file src/styles/theme.ts
 * @purpose Shared theme style definitions using CSS custom properties for consistent styling
 * @functionality
 * - Provides card background/border color classes using CSS variables
 * - Provides text color classes (primary, secondary, muted, subtle)
 * - Provides hero card gradient classes with tech gradient accents
 * - Provides badge and circle badge styles with tech gradient
 * @dependencies
 * - CSS custom properties defined in src/index.css
 */

// Card styles - using CSS custom properties
export const cardStyles = {
  base: 'bg-[var(--bg-card)] border border-[var(--border-subtle)]',
  // Special highlighted card with hover effect
  hero: 'phase-card bg-[var(--bg-card)] border border-[var(--border-subtle)]',
  // Dark card (inverted) for contrast sections
  dark: 'bg-[var(--bg-section-alt)] text-[var(--text-primary)]',
};

// Text colors using CSS custom properties
export const textStyles = {
  primary: 'text-[var(--text-primary)]',
  secondary: 'text-[var(--text-secondary)]',
  muted: 'text-[var(--text-muted)]',
  subtle: 'text-[var(--text-muted)]',
};

// Badge styles
export const badgeStyles = {
  default: 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
  emphasis: 'bg-[var(--color-electric)]/10 text-[var(--color-electric)] border border-[var(--color-electric)]/20',
};

// Circle/number badge with tech gradient (legacy - circular)
export const circleBadge = 'tech-gradient text-white';

// Rectangular number badge with tech gradient (matches landing page phase cards)
export const rectBadge = 'tech-gradient text-white font-sans text-sm font-bold';
