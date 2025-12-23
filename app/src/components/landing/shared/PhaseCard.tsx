/**
 * @file src/components/landing/shared/PhaseCard.tsx
 * @purpose Reusable card component for displaying journey phase information
 * @functionality
 * - Displays phase number and name on same row
 * - Shows Coming Soon badge in top-right corner for inactive phases
 * - Includes feature bullet point list
 * - Supports active and coming-soon states with visual differentiation
 * - Includes hover animations with gradient top border reveal
 * - Adapts styling for light and dark themes
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface PhaseCardProps {
  phaseNumber: number;
  phaseName: string;
  title: string;
  description: string;
  features?: string[];
  isActive?: boolean;
  className?: string;
}

const PhaseCard: FC<PhaseCardProps> = ({
  phaseNumber,
  phaseName,
  title,
  description,
  features = [],
  isActive = true,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`phase-card relative  p-8 bg-[var(--bg-card)] border border-white/5 dark:card-glow ${
        isActive ? 'opacity-100' : 'opacity-70'
      } ${className}`.trim()}
    >
      {/* Coming Soon badge - absolute top right */}
      {!isActive && (
        <div className="absolute top-4 right-4">
          <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-[var(--color-violet)]/20 text-[var(--color-violet)]">
            {t('landing.journey.comingSoon')}
          </span>
        </div>
      )}

      {/* Phase number badge + Phase name on same row */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className={`w-10 h-10 flex items-center justify-center font-sans text-sm font-bold ${
            isActive
              ? 'tech-gradient text-white'
              : 'bg-[var(--color-ash)] text-[var(--color-fog)]'
          }`}
        >
          {phaseNumber.toString().padStart(2, '0')}
        </span>
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          {phaseName}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-serif text-xl font-medium text-[var(--text-primary)] mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
        {description}
      </p>

      {/* Feature bullet points */}
      {features.length > 0 && (
        <ul className={`space-y-2 text-sm ${isActive ? 'text-[var(--text-secondary)]/80' : 'text-[var(--text-secondary)]/60'}`}>
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5  flex-shrink-0 ${
                  isActive ? 'bg-[var(--color-electric)]' : 'bg-[var(--text-muted)]/30'
                }`}
              />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PhaseCard;
