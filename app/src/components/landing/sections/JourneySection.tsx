/**
 * @file src/components/landing/sections/JourneySection.tsx
 * @purpose Journey section showcasing the five transformation phases
 * @functionality
 * - Displays section label, title, and subtitle
 * - Renders five PhaseCards with phase information and feature lists
 * - Indicates active phases (1-2) and coming soon phases (3-5)
 * - Responsive grid layout for different screen sizes
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 * - @/components/landing/shared/PhaseCard
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import PhaseCard from '@/components/landing/shared/PhaseCard';

const JourneySection: FC = () => {
  const { t } = useTranslation();

  const phases = [
    { number: 1, isActive: true },
    { number: 2, isActive: true },
    { number: 3, isActive: false },
    { number: 4, isActive: false },
    { number: 5, isActive: false },
  ];

  return (
    <section id="journey" className="py-24 px-6 bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs uppercase tracking-[0.3em] tech-gradient-text mb-4">
            {t('landing.journey.label')}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-medium text-[var(--text-primary)] mb-6">
            {t('landing.journey.title')}
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t('landing.journey.subtitle')}
          </p>
        </div>

        {/* Phase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.map((phase) => (
            <PhaseCard
              key={phase.number}
              phaseNumber={phase.number}
              phaseName={t(`landing.journey.phases.${phase.number}.name`)}
              title={t(`landing.journey.phases.${phase.number}.title`)}
              description={t(`landing.journey.phases.${phase.number}.description`)}
              features={t(`landing.journey.phases.${phase.number}.features`, { returnObjects: true }) as string[]}
              isActive={phase.isActive}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
