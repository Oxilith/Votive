/**
 * @file components/assessment/steps/TextareaStep.tsx
 * @purpose Renders free-text input question step
 * @functionality
 * - Displays question with optional context
 * - Provides resizable textarea input
 * - Supports placeholder text and custom row count
 * @dependencies
 * - React
 * - @/components/assessment/types (TextareaStep)
 */

import type { TextareaStep as TextareaStepType } from '../types';

interface TextareaStepProps {
  step: TextareaStepType;
  value: string;
  onChange: (value: string) => void;
}

export const TextareaStep: React.FC<TextareaStepProps> = ({ step, value, onChange }) => {
  const currentValue = value ?? '';

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
      <textarea
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        rows={step.rows ?? 5}
        className="w-full p-4 border-2 border-[var(--border-subtle)] focus:border-[var(--color-electric)] focus:outline-none resize-none text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-[var(--bg-card)]"
      />
    </div>
  );
};
