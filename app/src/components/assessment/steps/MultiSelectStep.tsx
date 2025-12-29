/**
 * @file components/assessment/steps/MultiSelectStep.tsx
 * @purpose Renders multi-select checkbox question with Ink & Stone styling
 * @functionality
 * - Displays question with optional context
 * - Renders selectable option cards with vermilion checkboxes
 * - Manages multi-selection state
 * - Supports option descriptions
 * @dependencies
 * - React
 * - @/components/assessment/types (MultiSelectStep, SelectOption)
 * - @/components/shared/icons (CheckIcon)
 */

import { CheckIcon } from '@/components/shared/icons';
import type { MultiSelectStep as MultiSelectStepType, SelectOption } from '../types';

interface MultiSelectStepProps {
  step: MultiSelectStepType;
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultiSelectStep: React.FC<MultiSelectStepProps> = ({ step, value, onChange }) => {
  const selected = value ?? [];

  const toggleOption = (optionId: string) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter((id) => id !== optionId)
      : [...selected, optionId];
    onChange(newSelected);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-xl font-medium text-[var(--text-primary)] mb-2">
          {step.question}
        </h3>
        {step.context && (
          <p className="font-body text-[var(--text-secondary)] text-sm">{step.context}</p>
        )}
      </div>
      <div className="grid gap-2">
        {step.options.map((option: SelectOption) => (
          <button
            key={option.id}
            onClick={() => toggleOption(option.id)}
            className={`text-left p-4 border-2 rounded-sm transition-all ${
              selected.includes(option.id)
                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                : 'border-[var(--border)] hover:border-[var(--accent)]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-sm flex items-center justify-center transition-all ${
                  selected.includes(option.id)
                    ? 'bg-[var(--accent)]'
                    : 'border-2 border-[var(--border)]'
                }`}
              >
                {selected.includes(option.id) && (
                  <CheckIcon size="xs" className="text-white" />
                )}
              </div>
              <div>
                <div className="font-body font-medium text-[var(--text-primary)]">
                  {option.label}
                </div>
                {option.description && (
                  <div className="font-body text-sm text-[var(--text-muted)]">
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
