/**
 * @file src/components/landing/shared/InsightPill.tsx
 * @purpose Interactive pill component for displaying AI insight categories
 * @functionality
 * - Displays insight type with icon and label
 * - Includes hover animation with horizontal translation
 * - Supports custom icon rendering via children prop
 * - Adapts styling for light and dark themes
 * @dependencies
 * - React (ReactNode)
 */

import type { FC, ReactNode } from 'react';

interface InsightPillProps {
  icon: ReactNode;
  label: string;
  className?: string;
}

const InsightPill: FC<InsightPillProps> = ({ icon, label, className = '' }) => {
  return (
    <div
      className={`insight-pill flex items-center gap-3 px-4 py-3  border border-[var(--border-subtle)] dark:border-white/5 ${className}`.trim()}
    >
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center  bg-[var(--color-electric)]/10 text-[var(--color-electric)]">
        {icon}
      </span>
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
    </div>
  );
};

export default InsightPill;
