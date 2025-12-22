/**
 * @file services/claude.service.ts
 * @purpose Secure server-side Claude API integration
 * @functionality
 * - Sends prompts to Claude API using official SDK
 * - Handles response parsing and error handling
 * - Implements retry logic with exponential backoff
 * - Provides type-safe responses
 * @dependencies
 * - @anthropic-ai/sdk for Claude API
 * - @/config for API key
 * - @/utils/logger for logging
 * - @/types/claude.types for type definitions
 * - @shared/index for shared prompt and response formatter
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import type { AssessmentResponses, AIAnalysisResult } from '../types/claude.types.js';
import type { AnalysisLanguage } from 'shared/index.js';
import { IDENTITY_ANALYSIS_PROMPT, formatResponsesForPrompt } from 'shared/index.js';

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8000;
const TEMPERATURE = 0.6;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function buildPrompt(): string {
  return IDENTITY_ANALYSIS_PROMPT;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeAssessment(
  responses: AssessmentResponses,
  language: AnalysisLanguage
): Promise<{ analysis: AIAnalysisResult; rawResponse: string }> {
  const prompt = buildPrompt();
  const formattedResponses = formatResponsesForPrompt(responses, language);
  const fullPrompt = prompt + formattedResponses;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info({ attempt, maxRetries: MAX_RETRIES }, 'Calling Claude API');

      const message = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      });

      const textBlock = message.content.find((block) => block.type === 'text');
      if (!textBlock) {
        throw new Error('No text content in Claude response');
      }

      const rawResponse = textBlock.text;

      // Clean up potential markdown formatting
      const cleanText = rawResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const analysis = JSON.parse(cleanText) as AIAnalysisResult;

      logger.info('Claude API call successful');
      return { analysis, rawResponse };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(
        { attempt, error: lastError.message },
        'Claude API call failed, retrying'
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  logger.error({ error: lastError?.message }, 'All Claude API retries exhausted');
  throw lastError ?? new Error('Claude API call failed after all retries');
}
