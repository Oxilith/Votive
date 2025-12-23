/**
 * @file src/components/landing/sections/PhilosophySection.tsx
 * @purpose Philosophy section explaining the problem with traditional habit approaches
 * @functionality
 * - Displays section label and gradient title
 * - Explains the problem with goal-setting without self-understanding
 * - Features Carl Rogers quote with decorative quote marks
 * - Features subtle grid pattern background overlay
 * - Adapts styling for light (dark background) and dark (graphite background) themes
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

const PhilosophySection: FC = () => {
  const { t } = useTranslation();

  return (
    <section
      id="philosophy"
      className="py-24 px-6 bg-[var(--bg-section-alt)] text-[var(--color-parchment)] dark:text-[var(--color-mist)] relative overflow-hidden"
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-[0.18] dark:opacity-[0.09]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="philosophy-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#philosophy-grid)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto relative">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Section Label */}
            <span className="inline-block text-xs uppercase tracking-[0.3em] tech-gradient-text mb-6">
              {t('landing.philosophy.label')}
            </span>

            {/* Title */}
            <h2 className="font-serif text-3xl md:text-4xl font-medium leading-tight mb-6">
              {t('landing.philosophy.title')}
            </h2>

            {/* Problem Description */}
            <div className="space-y-6">
              <p className="text-[var(--color-parchment)]/70 dark:text-[var(--color-fog)] leading-relaxed">
                {t('landing.philosophy.p1')}
              </p>
              <p className="text-[var(--color-parchment)]/70 dark:text-[var(--color-fog)] leading-relaxed">
                {t('landing.philosophy.p2')}
              </p>
            </div>
          </div>

          {/* Right Column - Carl Rogers Quote */}
          <div className="relative">
            <span className="quote-mark absolute -top-8 -left-4 text-[var(--color-parchment)] dark:text-[var(--color-mist)]">"</span>
            <blockquote className="pl-6 border-l-2 border-[var(--color-electric)]">
              <p className="font-serif text-2xl md:text-3xl italic leading-snug text-[var(--color-parchment)] dark:text-[var(--color-mist)]">
                {t('landing.philosophy.quote')}
              </p>
              <cite className="block mt-6 text-sm tracking-wide text-[var(--color-parchment)]/60 dark:text-[var(--color-fog)] not-italic">
                — {t('landing.philosophy.quoteAuthor')}
              </cite>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhilosophySection;
