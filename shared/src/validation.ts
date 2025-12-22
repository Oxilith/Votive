/**
 * @file shared/src/validation.ts
 * @purpose Single source of truth for validation constants and field metadata
 * @functionality
 * - Exports enum value arrays for Zod schema construction in backend
 * - Exports REQUIRED_FIELDS array for completion validation
 * - Exports field categorization (array, number, string fields)
 * - Ensures backend and frontend validation stays in sync
 * @dependencies
 * - ./assessment.types for AssessmentResponses type
 */

import type { AssessmentResponses } from './assessment.types.js';

// Enum value arrays (used by backend Zod schemas)
export const TIME_OF_DAY_VALUES = [
  'early_morning',
  'mid_morning',
  'midday',
  'afternoon',
  'evening',
  'night',
  'late_night',
] as const;

export const MOOD_TRIGGER_VALUES = [
  'lack_of_progress',
  'conflict',
  'uncertainty',
  'overwhelm',
  'lack_of_control',
  'poor_sleep',
  'physical',
  'isolation',
  'overstimulation',
  'criticism',
  'comparison',
  'boredom',
] as const;

export const WILLPOWER_PATTERN_VALUES = [
  'never_start',
  'start_stop',
  'distraction',
  'perfectionism',
  'energy',
  'forget',
] as const;

export const CORE_VALUE_VALUES = [
  'growth',
  'autonomy',
  'mastery',
  'impact',
  'connection',
  'integrity',
  'creativity',
  'security',
  'adventure',
  'balance',
  'recognition',
  'service',
  'wisdom',
  'efficiency',
  'authenticity',
  'leadership',
] as const;

// Required fields for completion validation
export const REQUIRED_FIELDS: (keyof AssessmentResponses)[] = [
  'peak_energy_times',
  'low_energy_times',
  'energy_consistency',
  'energy_drains',
  'energy_restores',
  'mood_triggers_negative',
  'motivation_reliability',
  'willpower_pattern',
  'identity_statements',
  'others_describe',
  'automatic_behaviors',
  'keystone_behaviors',
  'core_values',
  'natural_strengths',
  'resistance_patterns',
  'identity_clarity',
];

// Field categorization for validation logic
export const ARRAY_FIELDS: (keyof AssessmentResponses)[] = [
  'peak_energy_times',
  'low_energy_times',
  'mood_triggers_negative',
  'core_values',
];

export const NUMBER_FIELDS: (keyof AssessmentResponses)[] = [
  'energy_consistency',
  'motivation_reliability',
  'identity_clarity',
];

export const STRING_FIELDS: (keyof AssessmentResponses)[] = [
  'energy_drains',
  'energy_restores',
  'willpower_pattern',
  'identity_statements',
  'others_describe',
  'automatic_behaviors',
  'keystone_behaviors',
  'natural_strengths',
  'resistance_patterns',
];
