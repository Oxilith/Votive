/**
 * @file src/components/landing/sections/FooterSection.tsx
 * @purpose Footer section with hanko seal logo, copyright, and simple border
 * @functionality
 * - Displays Votive hanko seal logo and brand name
 * - Shows GitHub repository link with icon
 * - Displays copyright text with dynamic year
 * - Displays author attribution
 * - Features simple border-top (not gradient)
 * - Adapts styling for light and dark themes
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 * - @/components/landing/shared/VotiveLogo
 * - @/components/shared/icons (GitHubIcon)
 */

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import VotiveLogo from '@/components/landing/shared/VotiveLogo';
import { GitHubIcon } from '@/components/shared/icons';

const FooterSection: FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-10 px-6 lg:px-10 border-t border-[var(--border)]">
      <div className="flex items-center justify-between max-w-[1200px] mx-auto">
        {/* Logo and Brand - Left */}
        <div className="flex items-center gap-2">
          <VotiveLogo size="sm" />
          <span className="font-display text-base font-semibold tracking-[0.05em]">
            {t('landing.footer.brand')}
          </span>
        </div>

        {/* Copyright - Center */}
        <span className="font-body text-sm text-[var(--text-muted)]">
          {t('landing.footer.copyright', { year: currentYear })}
        </span>

        {/* GitHub and Author - Right */}
        <div className="flex items-center gap-4 font-body text-sm text-[var(--text-muted)]">
          <a
            href="https://github.com/Oxilith/Votive"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
          >
            <GitHubIcon size="sm" />
            {t('landing.footer.github')}
          </a>
          <span>{t('landing.footer.author')}</span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
