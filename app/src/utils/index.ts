/**
 * @file src/utils/index.ts
 * @purpose Barrel export for utility functions
 * @functionality
 * - Exports response formatting utilities (label mappings, formatter)
 * - Exports file import/export utilities
 * @dependencies
 * - ./responseFormatter
 * - ./fileUtils
 */

// Response formatting
export {
  valueLabels,
  timeLabels,
  triggerLabels,
  willpowerLabels,
  formatResponsesForPrompt,
} from './responseFormatter';

// File utilities
export { exportToJson, importFromJson, validateResponses } from './fileUtils';
