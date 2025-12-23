/**
 * @file src/components/landing/sections/HeroSection.tsx
 * @purpose Hero section with animated logo, tagline, CTA buttons, and vote counter
 * @functionality
 * - Displays animated Votive logo with glow effect
 * - Shows hero tagline with gradient text effect
 * - Provides primary CTA button to start discovery
 * - Provides secondary link to philosophy section
 * - Shows animated vote counter for social proof
 * - Includes scroll indicator animation
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 * - @/components/landing/shared/VotiveLogo
 * - @/components/landing/shared/VoteCounter
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import VotiveLogo from '@/components/landing/shared/VotiveLogo';
import VoteCounter from '@/components/landing/shared/VoteCounter';

interface HeroSectionProps {
  onStartDiscovery: () => void;
}

const HeroSection: FC<HeroSectionProps> = ({ onStartDiscovery }) => {
  const { t } = useTranslation();

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 pb-16 px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        {/* Hero Logo */}
        <div
          className="opacity-0 animate-fade delay-100"
          style={{ animationFillMode: 'forwards' }}
        >
          <div className="flex justify-center mb-8">
            <VotiveLogo size="lg" withGlow />
          </div>
        </div>

        {/* Hero Tagline */}
        <h1
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-[0.9] mb-8 opacity-0 animate-rise delay-200"
          style={{ animationFillMode: 'forwards' }}
        >
          {t('landing.hero.tagline1')}
          <br />
          {t('landing.hero.tagline2Prefix')}{' '}
          <span className="italic text-gradient-hero">{t('landing.hero.tagline2Highlight')}</span>
          <br />
          {t('landing.hero.tagline3')}
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 opacity-0 animate-rise delay-400"
          style={{ animationFillMode: 'forwards' }}
        >
          {t('landing.hero.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-rise delay-500"
          style={{ animationFillMode: 'forwards' }}
        >
          <button
            onClick={onStartDiscovery}
            className="cta-button inline-flex items-center gap-3 tech-gradient text-white px-8 py-4 text-base font-medium tracking-wide hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-electric)]/20"
          >
            {t('landing.hero.cta')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <a
            href="#philosophy"
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-4 py-4"
          >
            {t('landing.hero.learnMore')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Vote Counter */}
        <div
          className="mt-20 opacity-0 animate-fade delay-700"
          style={{ animationFillMode: 'forwards' }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
            {t('landing.hero.votesLabel')}
          </p>
          <div className="font-serif text-4xl md:text-5xl font-light tech-gradient-text">
            <VoteCounter targetValue={47832} duration={2500} />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator opacity-0 animate-fade delay-800"
        style={{ animationFillMode: 'forwards' }}
      >
        <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
