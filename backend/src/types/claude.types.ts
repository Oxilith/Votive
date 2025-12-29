/**
 * @file types/claude.types.ts
 * @purpose Type definitions for Claude API integration
 * @functionality
 * - Re-exports shared assessment and analysis types for use in backend
 * - Re-exports AnalysisLanguage type for language handling
 * - Defines request/response types for Claude analysis endpoint
 * @dependencies
 * - @shared/index for shared types (assessment, analysis, api)
 */

// Re-export shared types
export type {
  TimeOfDay,
  MoodTrigger,
  WillpowerPattern,
  CoreValue,
  AssessmentResponses,
  AnalysisPattern,
  AnalysisContradiction,
  AnalysisBlindSpot,
  AnalysisLeveragePoint,
  AnalysisRisk,
  IdentitySynthesis,
  AIAnalysisResult,
  AnalysisLanguage,
} from 'shared';

// Import for local use
import type { AssessmentResponses, AIAnalysisResult, AnalysisLanguage } from 'shared';

// Analysis request
export interface AnalyzeRequest {
  responses: AssessmentResponses;
  language: AnalysisLanguage;
}

// API response wrapper
export interface AnalyzeResponse {
  success: boolean;
  data?: {
    analysis: AIAnalysisResult;
    rawResponse: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
