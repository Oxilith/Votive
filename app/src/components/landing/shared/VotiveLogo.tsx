/**
 * @file src/components/landing/shared/VotiveLogo.tsx
 * @purpose Animated SVG logo component representing identity network convergence
 * @functionality
 * - Renders abstract "V" with network nodes symbolizing identity convergence
 * - Supports three size variants: sm (nav), md (default), lg (hero)
 * - Includes node pulse and data-flow line animations via CSS classes
 * - Provides optional glow filter effect for emphasis
 * @dependencies
 * - React
 */

import type { FC } from 'react';

type LogoSize = 'sm' | 'md' | 'lg';

interface VotiveLogoProps {
  size?: LogoSize;
  withGlow?: boolean;
  className?: string;
}

const sizeConfig: Record<LogoSize, { viewBox: string; class: string; strokeWidth: number; nodeRadius: [number, number, number]; sideNodeRadius: number; lineWidth: number }> = {
  sm: {
    viewBox: '0 0 32 32',
    class: 'w-8 h-8',
    strokeWidth: 2.5,
    nodeRadius: [3, 3, 3.5],
    sideNodeRadius: 0,
    lineWidth: 1,
  },
  md: {
    viewBox: '0 0 48 48',
    class: 'w-12 h-12',
    strokeWidth: 3,
    nodeRadius: [4, 4, 4.5],
    sideNodeRadius: 2,
    lineWidth: 1.2,
  },
  lg: {
    viewBox: '0 0 64 64',
    class: 'w-20 h-20',
    strokeWidth: 4,
    nodeRadius: [5, 5, 6],
    sideNodeRadius: 2.5,
    lineWidth: 1.5,
  },
};

const VotiveLogo: FC<VotiveLogoProps> = ({ size = 'md', withGlow = false, className = '' }) => {
  const config = sizeConfig[size];
  const scale = size === 'sm' ? 0.5 : size === 'md' ? 0.75 : 1;

  // Scaled coordinates
  const topY = 18 * scale;
  const bottomY = 46 * scale;
  const leftX = 16 * scale;
  const rightX = 48 * scale;
  const centerX = 32 * scale;
  const sideY = 32 * scale;
  const sideLeftX = 24 * scale;
  const sideRightX = 40 * scale;

  const glowClass = withGlow ? 'logo-glow' : '';

  return (
    <svg
      className={`logo-icon ${glowClass} ${config.class} ${className}`.trim()}
      viewBox={config.viewBox}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`techGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#00d4aa' }} />
          <stop offset="100%" style={{ stopColor: '#7c3aed' }} />
        </linearGradient>
        {withGlow && (
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Central V shape */}
      <path
        d={`M${leftX} ${topY}L${centerX} ${bottomY}L${rightX} ${topY}`}
        stroke={`url(#techGrad-${size})`}
        strokeWidth={config.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={withGlow ? `url(#glow-${size})` : undefined}
      />

      {/* Primary identity nodes */}
      <circle className="node" cx={leftX} cy={topY} r={config.nodeRadius[0]} fill={`url(#techGrad-${size})`} />
      <circle className="node" cx={rightX} cy={topY} r={config.nodeRadius[1]} fill={`url(#techGrad-${size})`} />
      <circle className="node" cx={centerX} cy={bottomY} r={config.nodeRadius[2]} fill={`url(#techGrad-${size})`} />

      {/* Network connection line (top) */}
      <line
        className="data-line"
        x1={leftX}
        y1={topY}
        x2={rightX}
        y2={topY}
        stroke={`url(#techGrad-${size})`}
        strokeWidth={config.lineWidth}
        opacity={0.4}
      />

      {/* Side nodes and connections (only for md and lg) */}
      {config.sideNodeRadius > 0 && (
        <>
          <circle className="node" cx={sideLeftX} cy={sideY} r={config.sideNodeRadius} fill={`url(#techGrad-${size})`} opacity={0.6} />
          <circle className="node" cx={sideRightX} cy={sideY} r={config.sideNodeRadius} fill={`url(#techGrad-${size})`} opacity={0.6} />
          <line
            className="data-line"
            x1={sideLeftX}
            y1={sideY}
            x2={centerX}
            y2={bottomY}
            stroke={`url(#techGrad-${size})`}
            strokeWidth={config.lineWidth * 0.8}
            opacity={0.3}
          />
          <line
            className="data-line"
            x1={sideRightX}
            y1={sideY}
            x2={centerX}
            y2={bottomY}
            stroke={`url(#techGrad-${size})`}
            strokeWidth={config.lineWidth * 0.8}
            opacity={0.3}
          />
        </>
      )}
    </svg>
  );
};

export default VotiveLogo;
