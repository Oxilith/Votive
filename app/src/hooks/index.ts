/**
 * @file src/hooks/index.ts
 * @purpose Barrel export for custom React hooks
 * @functionality
 * - Exports theme management hooks (useTheme, useThemeContext)
 * - Exports routing hook (useRouting) with types
 * - Exports scroll reveal animation hook (useScrollReveal)
 * - Exports resource loader hook (useResourceLoader) with types
 * @dependencies
 * - ./useTheme
 * - ./useThemeContext
 * - ./useRouting
 * - ./useScrollReveal
 * - ./useResourceLoader
 */

// Theme hooks
export { useTheme } from './useTheme';
export type { Theme } from './useTheme';
export { useThemeContext } from './useThemeContext';

// Routing
export { useRouting, parseRoute, buildPath } from './useRouting';
export type { AuthMode, RouteParams, NavigateOptions } from './useRouting';

// Scroll reveal
export { default as useScrollReveal } from './useScrollReveal';

// Resource loader
export { useResourceLoader } from './useResourceLoader';
export type { ViewOnlyAssessment, ViewOnlyAnalysis } from './useResourceLoader';
