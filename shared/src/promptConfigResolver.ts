/**
 * @file shared/src/promptConfigResolver.ts
 * @purpose Resolves prompt configurations based on thinking mode feature flag
 * @functionality
 * - Defines prompt configuration definitions with thinking variants
 * - Provides PromptConfigResolver class to select appropriate config
 * - Uses strategy pattern for thinking mode selection
 * @dependencies
 * - ./prompt.types for PromptConfig, ClaudeModel, PromptConfigDefinition
 * - @anthropic-ai/sdk for ThinkingConfigEnabled, ThinkingConfigDisabled types
 * - ./prompts for IDENTITY_ANALYSIS_PROMPT
 */

import {ClaudeModel, type PromptConfig, type PromptConfigDefinition} from './prompt.types.js';

import type { ThinkingConfigDisabled, ThinkingConfigEnabled } from '@anthropic-ai/sdk/resources/messages';
import { IDENTITY_ANALYSIS_PROMPT } from './prompts.js';

export type PromptConfigKey = 'IDENTITY_ANALYSIS';

interface ThinkingModeStrategy {
    selectVariant(definition: PromptConfigDefinition): PromptConfig;
}

class ThinkingEnabledStrategy implements ThinkingModeStrategy {
    selectVariant(def: PromptConfigDefinition): PromptConfig {
        return {
            model: def.model,
            prompt: def.prompt,
            ...def.variants.withThinking,
        };
    }
}

class ThinkingDisabledStrategy implements ThinkingModeStrategy {
    selectVariant(def: PromptConfigDefinition): PromptConfig {
        return {
            model: def.model,
            prompt: def.prompt,
            ...def.variants.withoutThinking,
        };
    }
}


const thinking_enabled: ThinkingConfigEnabled = {
    type: 'enabled',
    budget_tokens: 8000,
};

const thinking_disabled: ThinkingConfigDisabled = {
    type: 'disabled'
};

const PROMPT_CONFIG_DEFINITIONS: Record<PromptConfigKey, PromptConfigDefinition> = {
    IDENTITY_ANALYSIS: {
        model: ClaudeModel.SONNET_4_5,
        prompt: IDENTITY_ANALYSIS_PROMPT,
        variants: {
            withThinking: { temperature: 1, max_tokens: 16000, thinking: thinking_enabled },
            withoutThinking: { temperature: 0.6, max_tokens: 8000, thinking: thinking_disabled },
        },
    }
};

export class PromptConfigResolver {
    private readonly strategy: ThinkingModeStrategy;

    constructor(thinkingEnabled: boolean) {
        this.strategy = thinkingEnabled
            ? new ThinkingEnabledStrategy()
            : new ThinkingDisabledStrategy();
    }

    resolve(key: PromptConfigKey): PromptConfig {
        const definition = PROMPT_CONFIG_DEFINITIONS[key];
        return this.strategy.selectVariant(definition);
    }

    static fromFlag(thinkingEnabled: boolean): PromptConfigResolver {
        return new PromptConfigResolver(thinkingEnabled);
    }
}