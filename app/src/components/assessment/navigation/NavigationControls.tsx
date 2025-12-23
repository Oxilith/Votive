/**
 * @file components/assessment/navigation/NavigationControls.tsx
 * @purpose Back and Continue navigation buttons for assessment
 * @functionality
 * - Renders back button (disabled on first step)
 * - Renders continue button for progression
 * - Sticky positioning at bottom of viewport
 * - Supports dark mode styling
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 */

import { useTranslation } from 'react-i18next';

interface NavigationControlsProps {
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  showNavigation: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onBack,
  onNext,
  isFirstStep,
  showNavigation,
}) => {
  const { t } = useTranslation();

  if (!showNavigation) {
    return null;
  }

  return (
    <div className="border-t border-[var(--border-subtle)] sticky bottom-0 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`px-5 py-2.5 font-medium transition-colors ${
            isFirstStep
              ? 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
          }`}
        >
          {t('assessment.navigation.back')}
        </button>
        <button
          onClick={onNext}
          className="cta-button px-5 py-2.5 tech-gradient text-white font-medium hover:opacity-90 transition-opacity"
        >
          {t('assessment.navigation.continue')}
        </button>
      </div>
    </div>
  );
};
