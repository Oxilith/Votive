/**
 * @file src/components/landing/sections/PhilosophySection.tsx
 * @purpose Philosophy section with centered layout and styled quote block
 * @functionality
 * - Displays section marker with vermilion line prefix
 * - Explains the problem with goal-setting without self-understanding
 * - Features Carl Rogers quote with border-top and animated quote marks
 * - Uses warm paper background for visual rhythm
 * - Centered single-column layout (max-width: 720px)
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const PhilosophySection: FC = () => {
  const { t } = useTranslation();

  return (
    <section id="philosophy" className="py-28 bg-[var(--bg-secondary)]">
      <div className="max-w-[720px] mx-auto px-6 lg:px-10">
        {/* Section Marker */}
        <div className="flex items-center gap-4 mb-4 scroll-reveal">
          <span className="w-6 h-px bg-[var(--accent)]" />
          <span className="font-mono text-[0.6875rem] tracking-[0.15em] uppercase text-[var(--text-muted)]">
            {t('landing.philosophy.label')}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-medium leading-[1.3] mb-10 scroll-reveal">
          {t('landing.philosophy.title')}
        </h2>

        {/* Problem Description */}
        <div className="text-[1.0625rem] text-[var(--text-secondary)] leading-[2] mb-10 space-y-6 scroll-reveal">
          <p>{t('landing.philosophy.p1')}</p>
          <p>{t('landing.philosophy.p2')}</p>
        </div>

        {/* Carl Rogers Quote */}
        <div className="pt-10 border-t border-[var(--border)] scroll-reveal">
          <blockquote className="pl-10">
            <p className="font-display text-[clamp(1.25rem,3vw,1.625rem)] italic leading-[1.6] text-[var(--text-primary)] mb-4">
              <span
                className="inline text-[var(--accent)]"
                style={{ animation: 'quote-fade 0.8s var(--ease-out) 0.4s forwards', opacity: 0 }}
              >
                "
              </span>
              {t('landing.philosophy.quote')}
              <span
                className="inline text-[var(--accent)]"
                style={{ animation: 'quote-fade 0.8s var(--ease-out) 0.4s forwards', opacity: 0 }}
              >
                "
              </span>
            </p>
            <cite className="font-mono text-xs tracking-[0.05em] text-[var(--text-muted)] not-italic pl-10">
              — {t('landing.philosophy.quoteAuthor')}
            </cite>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
