/**
 * @file src/components/landing/sections/InsightsSection.tsx
 * @purpose AI Insights preview section with warm paper background
 * @functionality
 * - Displays section marker with vermilion line prefix
 * - Shows four insight feature items with vermilion dots
 * - Features sample insight card with vermilion accent line
 * - Uses asymmetric grid layout (0.4fr / 0.6fr)
 * - Highlights key phrases in vermilion
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const InsightsSection: FC = () => {
  const { t } = useTranslation();

  const features = [
    t('landing.insights.types.patterns'),
    t('landing.insights.types.contradictions'),
    t('landing.insights.types.blindSpots'),
    t('landing.insights.types.leverage'),
  ];

  return (
    <section id="insights" className="py-28 bg-[var(--bg-secondary)]">
      <div className="grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] gap-12 lg:gap-20 max-w-[1200px] mx-auto px-6 lg:px-10 items-start">
        {/* Left Column: Header + Features */}
        <div className="max-w-[400px] scroll-reveal">
          {/* Section Marker */}
          <div className="flex items-center gap-4 mb-4">
            <span className="w-6 h-px bg-[var(--accent)]" />
            <span className="font-mono text-[0.6875rem] tracking-[0.15em] uppercase text-[var(--text-muted)]">
              {t('landing.insights.label')}
            </span>
          </div>

          <h2 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] font-medium leading-[1.3] mb-4">
            {t('landing.insights.title')}
          </h2>

          <p className="font-body text-base text-[var(--text-secondary)] leading-[1.8] mb-10">
            {t('landing.insights.subtitle')}
          </p>

          {/* Feature list with vermilion dots */}
          <div className="flex flex-col gap-2">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-all"
              >
                <span className="w-1.5 h-1.5 bg-[var(--accent)] flex-shrink-0" />
                <span className="font-body text-[0.9375rem] text-[var(--text-primary)]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sample Insight Card */}
        <div className="scroll-reveal" style={{ animationDelay: '100ms' }}>
          <div className="relative bg-[var(--bg-primary)] border border-[var(--border)] p-10">
            {/* Vermilion accent line */}
            <div className="absolute top-0 left-10 w-10 h-0.5 bg-[var(--accent)]" />

            {/* Card Header */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-mono text-[0.625rem] tracking-[0.1em] uppercase text-[var(--text-faint)]">
                {t('landing.insights.sampleCard.label')}
              </span>
              <span className="font-mono text-[0.625rem] tracking-[0.05em] uppercase text-[var(--accent)] px-2 py-1 border border-[var(--accent)]">
                {t('landing.insights.sampleCard.category')}
              </span>
            </div>

            {/* Quote */}
            <p className="font-display text-[1.125rem] italic leading-[1.8] text-[var(--text-primary)] mb-6">
              "You describe yourself as{' '}
              <span className="text-[var(--accent)] font-semibold not-italic">disciplined</span>, yet your energy
              crashes and mood triggers suggest you're running on{' '}
              <span className="text-[var(--accent)] font-semibold not-italic">willpower alone</span>, a finite
              resource. Your keystone behavior of morning exercise could be the anchor that replenishes rather than
              depletes, if you shift from forcing performance to honoring rhythm."
            </p>

            {/* Analysis */}
            <p className="font-body text-[0.9375rem] text-[var(--text-secondary)] leading-[1.8] pt-6 border-t border-[var(--border)] mb-6">
              {t('landing.insights.sampleCard.analysis')}
            </p>

            {/* Footer */}
            <p className="font-mono text-[0.625rem] tracking-[0.05em] text-[var(--text-faint)] uppercase">
              {t('landing.insights.sampleCard.poweredBy')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;
