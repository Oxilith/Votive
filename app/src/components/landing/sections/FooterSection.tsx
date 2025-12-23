/**
 * @file src/components/landing/sections/FooterSection.tsx
 * @purpose Footer section with branding, GitHub link, and attribution
 * @functionality
 * - Displays Votive logo and brand name
 * - Shows GitHub repository link with icon
 * - Displays MIT License and author attribution
 * - Features electric gradient divider line at top
 * - Adapts styling for light and dark themes
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 * - @/components/landing/shared/VotiveLogo
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import VotiveLogo from '@/components/landing/shared/VotiveLogo';

const FooterSection: FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="relative py-12 px-6 bg-[var(--bg-primary)] border-t border-white/5">
      {/* Gradient divider line - violet in light mode, electric in dark mode */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-violet)]/40 dark:via-[var(--color-electric)]/40 to-transparent" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <VotiveLogo size="sm" />
          <span className="font-serif text-lg text-[var(--text-primary)]">
            {t('landing.footer.brand')}
          </span>
        </div>

        {/* Links and Attribution */}
        <div className="flex items-center gap-8 text-sm text-[var(--text-muted)]">
          <a
            href="https://github.com/Oxilith/Votive"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            {t('landing.footer.github')}
          </a>
          <span className="text-[var(--text-muted)]/60">{t('landing.footer.license')}</span>
          <span className="text-[var(--text-muted)]/60">{t('landing.footer.author')}</span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
