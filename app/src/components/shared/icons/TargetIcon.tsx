/**
 * @file src/components/shared/icons/TargetIcon.tsx
 * @purpose Bullseye/target icon for leverage points
 * @functionality
 * - Renders a target/crosshair SVG icon
 * - Supports size variants: xs (12px), sm (16px), md (20px), lg (24px)
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
 * Target Icon (crosshair/bullseye)
 * Used for leverage points insight type
 */
const TargetIcon: FC<IconProps> = ({
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
      fill="none"
      stroke="currentColor"
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    >
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
      <circle cx="12" cy="12" r="6" strokeWidth={2} />
      <circle cx="12" cy="12" r="2" strokeWidth={2} />
    </svg>
  );
};

export default TargetIcon;
