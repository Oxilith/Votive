/**
 * @file components/assessment/steps/ScaleStep.tsx
 * @purpose Renders 1-5 scale rating question step
 * @functionality
 * - Displays question with optional context
 * - Shows low and high labels for scale ends
 * - Renders clickable scale buttons (1-5)
 * - Highlights selected value
 * @dependencies
 * - React
 * - @/components/assessment/types (ScaleStep)
 */

import type { ScaleStep as ScaleStepType } from '../types';

interface ScaleStepProps {
  step: ScaleStepType;
  value: number;
  onChange: (value: number) => void;
}

export const ScaleStep: React.FC<ScaleStepProps> = ({ step, value, onChange }) => {
  const currentValue = value ?? 3;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-[var(--text-primary)] mb-2">
          {step.question}
        </h3>
        {step.context && (
          <p className="text-[var(--text-secondary)] text-sm">{step.context}</p>
        )}
      </div>
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-[var(--text-muted)]">
          <span className="max-w-32">{step.lowLabel}</span>
          <span className="max-w-32 text-right">{step.highLabel}</span>
        </div>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={`w-14 h-14 border-2 text-lg font-medium transition-all ${
                currentValue === num
                  ? 'tech-gradient text-white border-transparent'
                  : 'border-[var(--border-subtle)] hover:border-[var(--color-electric)]/50 text-[var(--text-secondary)]'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
