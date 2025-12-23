/**
 * @file components/assessment/navigation/AssessmentProgress.tsx
 * @purpose Progress bar and phase info header for assessment
 * @functionality
 * - Displays current phase title and subtitle
 * - Shows step progress (e.g., "Step 5 of 20")
 * - Renders animated progress bar
 * - Sticky positioning at top of viewport
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 */

import { useTranslation } from 'react-i18next';

interface AssessmentProgressProps {
  phaseTitle: string;
  phaseSubtitle: string;
  currentStep: number;
  totalSteps: number;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({
  phaseTitle,
  phaseSubtitle,
  currentStep,
  totalSteps,
}) => {
  const { t } = useTranslation();
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-secondary)] z-10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-medium text-[var(--text-muted)]">
              {phaseTitle}
            </span>
            <span className="text-sm text-[var(--text-muted)] mx-2">·</span>
            <span className="text-sm text-[var(--text-secondary)]">
              {phaseSubtitle}
            </span>
          </div>
          <span className="text-sm text-[var(--text-muted)]">
            {t('common.progress.stepOf', { current: currentStep, total: totalSteps })}
          </span>
        </div>
        <div className="h-1 bg-[var(--bg-card)] overflow-hidden">
          <div
            className="h-full tech-gradient transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
