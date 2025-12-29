/**
 * @file components/assessment/steps/SynthesisStep.tsx
 * @purpose Renders the synthesis/summary step with Ink & Stone styling
 * @functionality
 * - Displays organized summary of all collected responses
 * - Groups responses into themed sections (rhythm, energy, identity, etc.)
 * - Uses stone cards with vermilion phase badges
 * - Shows what's next guidance with accent card
 * - Navigation handled by parent NavigationControls component
 * @dependencies
 * - React
 * - react-i18next (useTranslation)
 * - @/types/assessment.types (AssessmentResponses)
 * - @/styles/theme (cardStyles, textStyles, phaseBadge)
 * - @/components/assessment/types (Phase, MultiSelectStep, SingleSelectStep, SelectOption)
 */

import { useTranslation } from 'react-i18next';
import type { AssessmentResponses } from '@/types/assessment.types';
import { cardStyles, textStyles, phaseBadge } from '@/styles/theme';
import type { Phase, MultiSelectStep, SingleSelectStep, SelectOption } from '../types';

interface SynthesisStepProps {
  responses: Partial<AssessmentResponses>;
  phases: Phase[];
}

export const SynthesisStep: React.FC<SynthesisStepProps> = ({
  responses,
  phases,
}) => {
  const { t } = useTranslation();

  const getSelectedLabels = (stepId: keyof AssessmentResponses, options: SelectOption[]) => {
    const selected = (responses[stepId] as string[] | undefined) ?? [];
    return options.filter((opt) => selected.includes(opt.id)).map((opt) => opt.label);
  };

  // Get steps from phases for option lookups
  const phase1Steps = phases[1]?.steps ?? [];
  const phase2Steps = phases[2]?.steps ?? [];

  const peakTimesStep = phase1Steps[0] as MultiSelectStep | undefined;
  const lowTimesStep = phase1Steps[1] as MultiSelectStep | undefined;
  const moodTriggersStep = phase1Steps[5] as MultiSelectStep | undefined;
  const willpowerStep = phase1Steps[7] as SingleSelectStep | undefined;
  const coreValuesStep = phase2Steps[5] as MultiSelectStep | undefined;

  const peakTimes = peakTimesStep ? getSelectedLabels('peak_energy_times', peakTimesStep.options) : [];
  const lowTimes = lowTimesStep ? getSelectedLabels('low_energy_times', lowTimesStep.options) : [];
  const moodTriggers = moodTriggersStep ? getSelectedLabels('mood_triggers_negative', moodTriggersStep.options) : [];
  const coreValues = coreValuesStep ? getSelectedLabels('core_values', coreValuesStep.options) : [];
  const willpowerPattern = willpowerStep?.options.find((o) => o.id === responses.willpower_pattern);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)] mb-2">
          {t('assessment.synthesis.heading')}
        </h2>
        <p className="font-body text-[var(--text-secondary)]">
          {t('assessment.synthesis.description')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Operating Rhythm */}
        <div className={`p-6 ${cardStyles.base}`}>
          <h3 className={`font-display font-semibold ${textStyles.primary} mb-4 flex items-center gap-3`}>
            <span className={phaseBadge}>
              {String(t('assessment.synthesis.sections.operatingRhythm.number')).padStart(2, '0')}
            </span>
            <span className="text-base">
              {t('assessment.synthesis.sections.operatingRhythm.title')}
            </span>
          </h3>
          <div className={`space-y-3 font-body ${textStyles.secondary}`}>
            {peakTimes.length > 0 && (
              <p>
                <span className="font-medium">{t('assessment.synthesis.labels.peakEnergy')}</span>{' '}
                {peakTimes.join(', ')}
              </p>
            )}
            {lowTimes.length > 0 && (
              <p>
                <span className="font-medium">{t('assessment.synthesis.labels.lowEnergy')}</span>{' '}
                {lowTimes.join(', ')}
              </p>
            )}
            <p>
              <span className="font-medium">{t('assessment.synthesis.labels.energyConsistency')}</span>{' '}
              {responses.energy_consistency ?? 3}/5
            </p>
            <p>
              <span className="font-medium">{t('assessment.synthesis.labels.motivationReliability')}</span>{' '}
              {responses.motivation_reliability ?? 3}/5
            </p>
            {willpowerPattern && (
              <p>
                <span className="font-medium">{t('assessment.synthesis.labels.primaryFailurePattern')}</span>{' '}
                {willpowerPattern.label}
              </p>
            )}
          </div>
        </div>

        {/* Energy Management */}
        <div className={`p-6 ${cardStyles.base}`}>
          <h3 className={`font-display font-semibold ${textStyles.primary} mb-4 flex items-center gap-3`}>
            <span className={phaseBadge}>
              {String(t('assessment.synthesis.sections.energyManagement.number')).padStart(2, '0')}
            </span>
            <span className="text-base">
              {t('assessment.synthesis.sections.energyManagement.title')}
            </span>
          </h3>
          <div className={`space-y-3 font-body ${textStyles.secondary}`}>
            {responses.energy_drains && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.whatDrainsYou')}</p>
                <p className="pl-4 text-[var(--text-secondary)] whitespace-pre-line">
                  {responses.energy_drains}
                </p>
              </div>
            )}
            {responses.energy_restores && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.whatRestoresYou')}</p>
                <p className="pl-4 text-[var(--text-secondary)] whitespace-pre-line">
                  {responses.energy_restores}
                </p>
              </div>
            )}
            {moodTriggers.length > 0 && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.keyMoodTriggers')}</p>
                <p className="pl-4 text-[var(--text-secondary)]">{moodTriggers.join(', ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Identity */}
        <div className={`p-6 ${cardStyles.base}`}>
          <h3 className={`font-display font-semibold ${textStyles.primary} mb-4 flex items-center gap-3`}>
            <span className={phaseBadge}>
              {String(t('assessment.synthesis.sections.currentIdentity.number')).padStart(2, '0')}
            </span>
            <span className="text-base">
              {t('assessment.synthesis.sections.currentIdentity.title')}
            </span>
          </h3>
          <div className={`space-y-3 font-body ${textStyles.secondary}`}>
            {responses.identity_statements && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.identityStatements')}</p>
                <p className="pl-4 text-[var(--text-secondary)] whitespace-pre-line">
                  {responses.identity_statements}
                </p>
              </div>
            )}
            {responses.others_describe && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.howOthersSeeYou')}</p>
                <p className="pl-4 text-[var(--text-secondary)] whitespace-pre-line">
                  {responses.others_describe}
                </p>
              </div>
            )}
            <p>
              <span className="font-medium">{t('assessment.synthesis.labels.identityClarity')}</span>{' '}
              {responses.identity_clarity ?? 3}/5
            </p>
          </div>
        </div>

        {/* Behavioral Foundation */}
        <div className={`p-6 ${cardStyles.base}`}>
          <h3 className={`font-display font-semibold ${textStyles.primary} mb-4 flex items-center gap-3`}>
            <span className={phaseBadge}>
              {String(t('assessment.synthesis.sections.behavioralFoundation.number')).padStart(2, '0')}
            </span>
            <span className="text-base">
              {t('assessment.synthesis.sections.behavioralFoundation.title')}
            </span>
          </h3>
          <div className={`space-y-3 font-body ${textStyles.secondary}`}>
            {responses.automatic_behaviors && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.automaticBehaviors')}</p>
                <p className="pl-4 text-[var(--text-secondary)] whitespace-pre-line">
                  {responses.automatic_behaviors}
                </p>
              </div>
            )}
            {responses.keystone_behaviors && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.keystoneBehaviors')}</p>
                <p className="pl-4 text-[var(--text-secondary)] whitespace-pre-line">
                  {responses.keystone_behaviors}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Values & Strengths */}
        <div className={`p-6 ${cardStyles.base}`}>
          <h3 className={`font-display font-semibold ${textStyles.primary} mb-4 flex items-center gap-3`}>
            <span className={phaseBadge}>
              {String(t('assessment.synthesis.sections.valuesStrengths.number')).padStart(2, '0')}
            </span>
            <span className="text-base">
              {t('assessment.synthesis.sections.valuesStrengths.title')}
            </span>
          </h3>
          <div className={`space-y-3 font-body ${textStyles.secondary}`}>
            {coreValues.length > 0 && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.coreValues')}</p>
                <p className="pl-4 text-[var(--text-secondary)]">{coreValues.join(', ')}</p>
              </div>
            )}
            {responses.natural_strengths && (
              <div>
                <p className="font-medium mb-1">{t('assessment.synthesis.labels.naturalStrengths')}</p>
                <p className="pl-4 text-[var(--text-secondary)] whitespace-pre-line">
                  {responses.natural_strengths}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Resistance Patterns */}
        <div className={`p-6 ${cardStyles.base}`}>
          <h3 className={`font-display font-semibold ${textStyles.primary} mb-4 flex items-center gap-2`}>
            <span className="text-xl">⚠️</span>
            {t('assessment.synthesis.sections.resistancePatterns.title')}
          </h3>
          {responses.resistance_patterns && (
            <p className={`font-body ${textStyles.secondary} whitespace-pre-line`}>
              {responses.resistance_patterns}
            </p>
          )}
          <p className={`font-body ${textStyles.muted} text-sm mt-3 italic`}>
            {t('assessment.synthesis.sections.resistancePatterns.helpText')}
          </p>
        </div>
      </div>

      {/* What's Next - Stone card with vermilion top accent */}
      <div className={`p-6 ${cardStyles.hero}`}>
        <h3 className={`font-display font-semibold ${textStyles.primary} mb-3`}>
          {t('assessment.synthesis.whatsNext.title')}
        </h3>
        <p className={`font-body ${textStyles.secondary} mb-4`}>
          {t('assessment.synthesis.whatsNext.description')}
        </p>
        <ul className={`space-y-2 font-body ${textStyles.secondary}`}>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
            <span>
              <span className={`${textStyles.primary} font-medium`}>
                {t('assessment.synthesis.whatsNext.achievable.title')}
              </span>{' '}
              — {t('assessment.synthesis.whatsNext.achievable.description')}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
            <span>
              <span className={`${textStyles.primary} font-medium`}>
                {t('assessment.synthesis.whatsNext.aligned.title')}
              </span>{' '}
              — {t('assessment.synthesis.whatsNext.aligned.description')}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
            <span>
              <span className={`${textStyles.primary} font-medium`}>
                {t('assessment.synthesis.whatsNext.bridged.title')}
              </span>{' '}
              — {t('assessment.synthesis.whatsNext.bridged.description')}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
