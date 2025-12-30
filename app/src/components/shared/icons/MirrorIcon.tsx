/**
 * @file src/components/shared/icons/MirrorIcon.tsx
 * @purpose Mirror/reflection icon for identity synthesis
 * @functionality
 * - Renders a stylized mirror/reflection SVG icon
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
 * Mirror Icon (reflection/identity)
 * Used for synthesis insight type
 */
const MirrorIcon: FC<IconProps> = ({
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
      {/* Oval mirror frame */}
      <ellipse cx="12" cy="11" rx="7" ry="9" strokeWidth={2} />
      {/* Mirror stand */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 20h8M12 20v-2"
      />
      {/* Reflection highlight */}
      <path
        strokeLinecap="round"
        strokeWidth={1.5}
        d="M9 7c1-1.5 3-2 5-1"
        opacity={0.6}
      />
    </svg>
  );
};

export default MirrorIcon;
