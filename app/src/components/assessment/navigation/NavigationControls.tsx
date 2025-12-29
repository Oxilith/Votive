/**
 * @file components/assessment/navigation/NavigationControls.tsx
 * @purpose Back and Continue/Complete navigation buttons with Ink & Stone styling
 * @functionality
 * - Renders back button (disabled on first step)
 * - Renders vermilion continue button for regular steps
 * - Renders complete button for synthesis step
 * - Sticky positioning at bottom of viewport
 * - Uses cta-button class for lift/shrink hover effects
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
  isSynthesis?: boolean;
  onComplete?: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onBack,
  onNext,
  isFirstStep,
  showNavigation,
  isSynthesis = false,
  onComplete,
}) => {
  const { t } = useTranslation();

  if (!showNavigation) {
    return null;
  }

  const handlePrimaryAction = isSynthesis && onComplete ? onComplete : onNext;
  const primaryButtonText = isSynthesis
    ? t('assessment.navigation.complete')
    : t('assessment.navigation.continue');

  return (
    <div className="border-t border-[var(--border)] sticky bottom-0 bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`px-5 py-2.5 font-body font-medium rounded-sm transition-colors ${
            isFirstStep
              ? 'text-[var(--text-muted)] cursor-not-allowed opacity-50'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
          }`}
        >
          {t('assessment.navigation.back')}
        </button>
        <button
          onClick={handlePrimaryAction}
          className="cta-button px-5 py-2.5 bg-[var(--accent)] text-white font-body font-medium rounded-sm"
        >
          {primaryButtonText}
        </button>
      </div>
    </div>
  );
};
