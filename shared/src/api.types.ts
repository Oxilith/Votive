/**
 * @file shared/src/api.types.ts
 * @purpose Shared API type definitions for frontend and backend
 * @functionality
 * - Exports AnalysisLanguage type for language selection
 * - Exports SUPPORTED_LANGUAGES const array for validation
 * - Ensures consistent language handling across packages
 * @dependencies
 * - None (pure TypeScript types)
 */

// Supported languages for AI analysis
export const SUPPORTED_LANGUAGES = ['english', 'polish'] as const;

// Language type derived from const array
export type AnalysisLanguage = (typeof SUPPORTED_LANGUAGES)[number];
