/**
 * @file src/components/landing/sections/NavSection.tsx
 * @purpose Fixed navigation bar for landing page with theme and language controls
 * @functionality
 * - Displays Votive logo and brand name
 * - Provides anchor links to page sections (Philosophy, Journey, Insights)
 * - Includes theme toggle button (sun/moon icons)
 * - Includes language selector dropdown (EN/PL)
 * - Includes Begin Discovery CTA button
 * - Fixed position with blur background effect
 * @dependencies
 * - React (useState, useEffect, useRef)
 * - react-i18next (useTranslation)
 * - @/components/landing/shared/VotiveLogo
 * - @/hooks/useThemeContext
 */

import { useState, useEffect, useRef, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import VotiveLogo from '@/components/landing/shared/VotiveLogo';
import { useThemeContext } from '@/hooks/useThemeContext';

interface NavSectionProps {
  onStartDiscovery: () => void;
}

const NavSection: FC<NavSectionProps> = ({ onStartDiscovery }) => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useThemeContext();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo and Brand */}
        <a href="#" className="flex items-center gap-3">
          <VotiveLogo size="sm" />
          <span className="font-serif text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t('landing.nav.brand')}
          </span>
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#philosophy"
            className="nav-link text-sm tracking-wide text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('landing.nav.philosophy')}
          </a>
          <a
            href="#journey"
            className="nav-link text-sm tracking-wide text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('landing.nav.journey')}
          </a>
          <a
            href="#insights"
            className="nav-link text-sm tracking-wide text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('landing.nav.insights')}
          </a>

          {/* Begin Discovery Button */}
          <button
            onClick={onStartDiscovery}
            className="cta-button inline-flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-5 py-2.5 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
          >
            {t('landing.nav.beginDiscovery')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-[var(--border-subtle)] mx-1" />

          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]  font-medium transition-colors flex items-center gap-1.5"
            >
              <span>{i18n.language === 'pl' ? 'PL' : 'EN'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-1 py-1 w-32 bg-[var(--bg-card)] border border-[var(--border-subtle)]  shadow-lg z-50">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] ${
                    i18n.language === 'en'
                      ? 'text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {t('landing.nav.language.en')}
                </button>
                <button
                  onClick={() => changeLanguage('pl')}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] ${
                    i18n.language === 'pl'
                      ? 'text-[var(--text-primary)] font-medium'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {t('landing.nav.language.pl')}
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2  text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label={isDark ? t('header.theme.toggleLight') : t('header.theme.toggleDark')}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Button (simplified - just show CTA) */}
        <div className="md:hidden flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2  text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          <button
            onClick={onStartDiscovery}
            className="cta-button inline-flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-4 py-2 text-sm font-medium"
          >
            {t('landing.nav.begin')}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavSection;
