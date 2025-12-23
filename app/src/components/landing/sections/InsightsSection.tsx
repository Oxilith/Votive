/**
 * @file src/components/landing/sections/InsightsSection.tsx
 * @purpose AI Insights preview section showcasing analysis capabilities
 * @functionality
 * - Displays two-column layout: LEFT has header text + insight pills, RIGHT has sample card
 * - Shows four insight type pills with icons (patterns, contradictions, blind spots, leverage)
 * - Features sample insight card with glow effect demonstrating AI synthesis output
 * - Highlights key phrases with colored emphasis (electric/violet)
 * - Adapts styling for light and dark themes
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 * - @/components/landing/shared/InsightPill
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import InsightPill from '@/components/landing/shared/InsightPill';

const InsightsSection: FC = () => {
  const { t } = useTranslation();

  const insightTypes = [
    {
      key: 'patterns',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      key: 'contradictions',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      key: 'blindSpots',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      key: 'leverage',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="insights" className="py-24 px-6 bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column: Header + Insight Pills */}
          <div>
            <span className="inline-block text-xs uppercase tracking-[0.3em] tech-gradient-text mb-4">
              {t('landing.insights.label')}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-medium leading-tight text-[var(--text-primary)] mb-6">
              {t('landing.insights.title')}
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
              {t('landing.insights.subtitle')}
            </p>
            <div className="space-y-3">
              {insightTypes.map((insight) => (
                <InsightPill
                  key={insight.key}
                  icon={insight.icon}
                  label={t(`landing.insights.types.${insight.key}`)}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Sample Insight Card with Glow Effect */}
          <div className="relative">
            {/* Glow layer */}
            <div className="absolute -inset-4 bg-gradient-to-br from-[var(--color-electric)]/10 via-transparent to-[var(--color-violet)]/10  blur-xl" />

            {/* Card */}
            <div className="relative bg-[var(--bg-card)]  p-8 border border-[var(--border-subtle)] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs uppercase tracking-[0.2em] tech-gradient-text">
                  {t('landing.insights.sampleCard.label')}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {t('landing.insights.sampleCard.category')}
                </span>
              </div>
              <p className="font-serif text-lg text-[var(--text-primary)]/90 leading-relaxed mb-6">
                "You describe yourself as disciplined, yet your energy crashes and mood triggers suggest you're running on willpower alone, a finite resource. Your keystone behavior of morning exercise could be the anchor that replenishes rather than depletes, if you shift from{' '}
                <em className="text-[var(--color-electric)] font-medium">forcing performance</em>
                {' '}to{' '}
                <em className="text-[var(--color-violet)] font-medium">honoring rhythm</em>."
              </p>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <svg className="w-4 h-4 text-[var(--color-violet)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>{t('landing.insights.sampleCard.poweredBy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsSection;
