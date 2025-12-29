/**
 * @file src/components/shared/DateBadge.tsx
 * @purpose Display formatted date badge for view-only resources
 * @functionality
 * - Displays creation date in localized format (DD MMM YYYY HH:mm)
 * - Styled consistently with Ink & Stone design system
 * - Supports English and Polish locales
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface DateBadgeProps {
  /** ISO date string to display */
  date: string;
  /** Optional label prefix (defaults to 'Created') */
  labelKey?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * DateBadge - Displays formatted date for view-only resources
 */
const DateBadge: FC<DateBadgeProps> = ({ date, labelKey = 'createdAt', className = '' }) => {
  const { t, i18n } = useTranslation('common');

  const formatDate = (dateString: string): string => {
    const locale = i18n.language === 'pl' ? 'pl-PL' : 'en-GB';
    const dateObj = new Date(dateString);

    return dateObj.toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 border border-[var(--border)] bg-[var(--bg-secondary)] ${className}`}
    >
      <span className="font-mono text-[0.625rem] tracking-[0.05em] uppercase text-[var(--text-faint)]">
        {t(labelKey)}
      </span>
      <span className="font-mono text-[0.6875rem] text-[var(--text-muted)]">{formatDate(date)}</span>
    </div>
  );
};

export default DateBadge;
