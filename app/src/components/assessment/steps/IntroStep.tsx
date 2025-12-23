/**
 * @file components/assessment/steps/IntroStep.tsx
 * @purpose Renders introduction/welcome step content
 * @functionality
 * - Displays heading, subheading, and description
 * - Provides continue button to proceed to next step
 * - Provides back button when not on first step (for navigation to previous phases)
 * - Supports multi-paragraph descriptions
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 * - @/components/assessment/types (IntroContent)
 */

import { useTranslation } from 'react-i18next';
import type { IntroContent } from '../types';

interface IntroStepProps {
  content: IntroContent;
  onNext: () => void;
  onBack?: () => void;
  isFirstStep?: boolean;
}

export const IntroStep: React.FC<IntroStepProps> = ({
  content,
  onNext,
  onBack,
  isFirstStep = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-rise" style={{ animationFillMode: 'forwards' }}>
        <h2 className="font-serif text-3xl md:text-4xl font-medium text-[var(--text-primary)] mb-2">
          {content.heading}
        </h2>
        <p className="text-lg text-[var(--text-secondary)]">
          {content.subheading}
        </p>
      </div>
      <div className="prose max-w-none opacity-0 animate-rise delay-200" style={{ animationFillMode: 'forwards' }}>
        {content.description.split('\n\n').map((para, i) => (
          <p key={i} className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
            {para}
          </p>
        ))}
      </div>
      <div className="flex justify-between mt-4 opacity-0 animate-rise delay-400" style={{ animationFillMode: 'forwards' }}>
        {!isFirstStep && onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            {t('assessment.navigation.back')}
          </button>
        )}
        <button
          onClick={onNext}
          className="cta-button px-6 py-3 tech-gradient text-white font-medium hover:opacity-90 transition-opacity"
        >
          {content.buttonText}
        </button>
      </div>
    </div>
  );
};
