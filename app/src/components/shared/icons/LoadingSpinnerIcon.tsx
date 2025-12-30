/**
 * @file src/components/shared/icons/LoadingSpinnerIcon.tsx
 * @purpose Animated spinner icon for loading states
 * @functionality
 * - Renders spinning circle SVG icon for loading indicators
 * - Supports size variants: xs (12px), sm (16px), md (20px), lg (24px)
 * - Includes CSS animation for continuous rotation
 * - Uses currentColor for stroke to inherit text color
 * @dependencies
 * - React
 * - ./Icon (IconProps)
 */

import type { FC } from 'react';
import type { IconProps, IconSize } from './Icon';

const sizeConfig: Record<IconSize, { className: string }> = {
  xs: { className: 'w-3 h-3' },
  sm: { className: 'w-4 h-4' },
  md: { className: 'w-5 h-5' },
  lg: { className: 'w-6 h-6' },
};

/**
 * Loading Spinner Icon (animated circle)
 * Used for loading states in buttons and other components
 */
const LoadingSpinnerIcon: FC<IconProps> = ({
  size = 'md',
  className = '',
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel = 'Loading',
}) => {
  const config = sizeConfig[size];

  return (
    <svg
      className={`${config.className} animate-spin ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

export default LoadingSpinnerIcon;
