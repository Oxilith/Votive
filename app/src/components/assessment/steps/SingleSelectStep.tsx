/**
 * @file components/assessment/steps/SingleSelectStep.tsx
 * @purpose Renders single-select radio button question step
 * @functionality
 * - Displays question with optional context
 * - Renders selectable option cards with radio buttons
 * - Manages single selection state
 * - Supports option descriptions
 * @dependencies
 * - React
 * - @/components/assessment/types (SingleSelectStep, SelectOption)
 */

import type { SingleSelectStep as SingleSelectStepType, SelectOption } from '../types';

interface SingleSelectStepProps {
  step: SingleSelectStepType;
  value: string | undefined;
  onChange: (value: string) => void;
}

export const SingleSelectStep: React.FC<SingleSelectStepProps> = ({ step, value, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-xl font-medium text-[var(--text-primary)] mb-2">
          {step.question}
        </h3>
        {step.context && (
          <p className="text-[var(--text-secondary)] text-sm">{step.context}</p>
        )}
      </div>
      <div className="grid gap-2">
        {step.options.map((option: SelectOption) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`text-left p-4 border-2 transition-all ${
              value === option.id
                ? 'border-[var(--color-electric)] bg-[var(--color-electric)]/10'
                : 'border-[var(--border-subtle)] hover:border-[var(--color-electric)]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 flex items-center justify-center transition-all ${
                  value === option.id
                    ? 'tech-gradient'
                    : 'border-2 border-[var(--border-subtle)]'
                }`}
              >
                {value === option.id && (
                  <div className="w-2 h-2 bg-white" />
                )}
              </div>
              <div>
                <div className="font-medium text-[var(--text-primary)]">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-sm text-[var(--text-muted)]">
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
