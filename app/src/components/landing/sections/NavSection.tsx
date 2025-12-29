/**
 * @file src/components/landing/sections/NavSection.tsx
 * @purpose Floating navigation bar with Ink & Stone Japanese minimalism aesthetic
 * @functionality
 * - Displays Votive hanko seal logo and brand name
 * - Provides anchor links with calligraphic underline hover effect
 * - Includes theme toggle button with border styling
 * - Includes inline language toggle (EN | PL)
 * - Includes vermilion Begin Discovery CTA button
 * - Floating position with paper background, blur, and subtle border
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 * - @/components/landing/shared/VotiveLogo
 * - @/hooks/useThemeContext
 * - @/components/shared/icons (SunIcon, MoonIcon)
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import VotiveLogo from '@/components/landing/shared/VotiveLogo';
import { useThemeContext } from '@/hooks/useThemeContext';
import { SunIcon, MoonIcon } from '@/components/shared/icons';

interface NavSectionProps {
  onStartDiscovery: () => void;
}

const NavSection: FC<NavSectionProps> = ({ onStartDiscovery }) => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useThemeContext();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="fixed top-4 left-4 right-4 lg:top-6 lg:left-10 lg:right-10 z-50 flex justify-between items-center px-4 py-3 lg:px-6 bg-[var(--bg-primary)]/85 backdrop-blur-[12px] border border-[var(--border)] transition-colors">
      {/* Logo and Brand */}
      <a href="#" className="flex items-center gap-2 group">
        <VotiveLogo size="sm" />
        <span className="font-display text-xl font-semibold tracking-[0.05em] text-[var(--text-primary)]">
          {t('landing.nav.brand')}
        </span>
      </a>

      {/* Right Side - Links, CTA, Controls */}
      <div className="flex items-center gap-6 lg:gap-10">
        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#philosophy"
            className="nav-link font-body text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('landing.nav.philosophy')}
          </a>
          <a
            href="#journey"
            className="nav-link font-body text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('landing.nav.journey')}
          </a>
          <a
            href="#insights"
            className="nav-link font-body text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('landing.nav.insights')}
          </a>
        </div>

        {/* Begin Discovery Button - Vermilion CTA - Hidden on mobile */}
        <button
          onClick={onStartDiscovery}
          className="hidden md:block cta-button px-4 py-2 text-[0.8125rem] font-medium text-white bg-[var(--accent)] transition-all"
        >
          {t('landing.nav.beginDiscovery')}
        </button>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Language Toggle - Inline EN | PL */}
          <div className="flex items-center gap-0.5 font-mono text-xs text-[var(--text-faint)]">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-1.5 py-1 transition-colors ${
                i18n.language === 'en'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'
              }`}
            >
              EN
            </button>
            <span className="text-[var(--border-strong)]">|</span>
            <button
              onClick={() => changeLanguage('pl')}
              className={`px-1.5 py-1 transition-colors ${
                i18n.language === 'pl'
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'
              }`}
            >
              PL
            </button>
          </div>

          {/* Theme Toggle - Square with border */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            aria-label={isDark ? t('header.theme.toggleLight') : t('header.theme.toggleDark')}
          >
            {isDark ? <SunIcon size="sm" /> : <MoonIcon size="sm" />}
          </button>

          {/* Mobile CTA Button */}
          <button
            onClick={onStartDiscovery}
            className="md:hidden cta-button px-3 py-1.5 text-xs font-medium text-white bg-[var(--accent)]"
          >
            {t('landing.nav.begin')}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavSection;
