/**
 * @file src/components/shared/icons/CheckIcon.tsx
 * @purpose Checkmark icon for selected/checked states
 * @functionality
 * - Renders a filled checkmark SVG icon
 * - Supports size variants: xs (12px), sm (16px), md (20px), lg (24px)
 * - Uses currentColor for fill to inherit text color
 * - Uses 24x24 viewBox for consistency with other icons
 * @dependencies
 * - React
 * - ./Icon (IconProps, IconSize)
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
 * Check Icon
 * Used for checkbox checked states and selection indicators
 */
const CheckIcon: FC<IconProps> = ({
  size = 'md',
  className = '',
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
}) => {
  const config = sizeConfig[size];

  return (
    <svg
      className={`${config.className} ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    >
      <path
        fillRule="evenodd"
        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export default CheckIcon;
