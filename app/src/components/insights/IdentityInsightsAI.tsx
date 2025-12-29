/**
 * @file src/components/insights/IdentityInsightsAI.tsx
 * @purpose AI-powered analysis display with Ink & Stone styling
 * @functionality
 * - Receives assessment responses as props
 * - Uses Zustand analysis store for state management
 * - Displays analysis results in tabbed interface with vermilion accents
 * - Shows identity synthesis with hidden strengths and next steps
 * - Provides re-analyze functionality for additional insights
 * - Includes loading states with ink-style dots and error handling
 * - Provides floating navigation with import/export and assessment link
 * - Includes decorative ink brush SVG and footer
 * - Supports dark mode theme switching
 * - Supports internationalization (English/Polish)
 * @dependencies
 * - React (useState, useCallback, useRef)
 * - react-i18next (useTranslation)
 * - @/types/assessment.types (InsightsProps)
 * - @/stores (useAnalysisStore)
 * - @/styles/theme (cardStyles, textStyles)
 * - @/components/landing/sections/FooterSection
 * - @/components/landing/shared/VotiveLogo
 * - @/components/shared/icons
 * - @/hooks/useThemeContext
 * - @/utils/fileUtils
 * - ./InsightCard (InsightCard component)
 */

import { useState, useCallback, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { InsightsProps } from '@/types/assessment.types';
import { useAnalysisStore } from '@/stores';
import { cardStyles, textStyles } from '@/styles/theme';
import InsightCard from './InsightCard';
import FooterSection from '@/components/landing/sections/FooterSection';
import VotiveLogo from '@/components/landing/shared/VotiveLogo';
import { useThemeContext } from '@/hooks/useThemeContext';
import { importFromJson } from '@/utils/fileUtils';
import {
  SunIcon,
  MoonIcon,
  ErrorCircleIcon,
  SearchIcon,
  SwitchHorizontalIcon,
  EyeIcon,
  TargetIcon,
  AlertTriangleIcon,
  MirrorIcon,
  RefreshIcon,
  LightningBoltIcon,
  ArrowRightIcon,
} from '@/components/shared/icons';

interface Tab {
  id: string;
  label: string;
  count: number | null;
  icon: ReactNode;
}

const IdentityInsightsAI: React.FC<InsightsProps> = ({
  responses,
  onExport,
  onImport,
  onExportAnalysis,
  hasAnalysis,
  onNavigateToLanding,
  onNavigateToAssessment,
}) => {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useThemeContext();
  const [activeTab, setActiveTab] = useState('patterns');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use Zustand analysis store
  const {
    analysis,
    rawResponse,
    isAnalyzing: loading,
    analysisError: error,
    analyze,
    downloadRawResponse,
  } = useAnalysisStore();

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportError(null);
      const data = await importFromJson(file);
      onImport?.(data);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : t('header.errors.importFailed'));
    }
  };

  const handleExportClick = () => {
    onExport?.();
  };

  const handleExportAnalysisClick = () => {
    onExportAnalysis?.();
  };

  const hasResponses = Object.keys(responses).length > 0;

  const analyzeWithClaude = useCallback(async () => {
    const language = i18n.language === 'pl' ? 'polish' : 'english';
    await analyze(responses, language);
  }, [analyze, responses, i18n.language]);

  const tabs: Tab[] = analysis
    ? [
        { id: 'patterns', label: t('insights.tabs.patterns'), count: analysis.patterns?.length ?? 0, icon: <SearchIcon size="sm" /> },
        { id: 'contradictions', label: t('insights.tabs.contradictions'), count: analysis.contradictions?.length ?? 0, icon: <SwitchHorizontalIcon size="sm" /> },
        { id: 'blindSpots', label: t('insights.tabs.blindSpots'), count: analysis.blindSpots?.length ?? 0, icon: <EyeIcon size="sm" /> },
        { id: 'leverage', label: t('insights.tabs.leverage'), count: analysis.leveragePoints?.length ?? 0, icon: <TargetIcon size="sm" /> },
        { id: 'risks', label: t('insights.tabs.risks'), count: analysis.risks?.length ?? 0, icon: <AlertTriangleIcon size="sm" /> },
        { id: 'synthesis', label: t('insights.tabs.synthesis'), count: null, icon: <MirrorIcon size="sm" /> },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col relative">
      {/* Hidden file input for import - placed at root level for browser compatibility */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ position: 'fixed', top: '-100px', left: '-100px', opacity: 0 }}
      />

      {/* Fixed Ink Brush Decoration - Right side */}
      <svg
        className="fixed right-0 top-[10%] h-[80vh] w-auto max-w-[500px] opacity-[0.06] dark:opacity-[0.08] pointer-events-none z-[1] hidden lg:block"
        viewBox="0 0 400 800"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M200 0 Q 250 200 180 400 Q 120 600 220 800"
          stroke="currentColor"
          strokeWidth="80"
          strokeLinecap="round"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: 2000,
            animation: 'ink-draw 3s var(--ease-out) 0.5s forwards',
          }}
        />
        <circle
          cx="200"
          cy="150"
          r="60"
          fill="currentColor"
          style={{
            opacity: 0,
            animation: 'ink-splash 0.8s var(--ease-out) 2s forwards',
          }}
        />
        <circle
          cx="180"
          cy="450"
          r="40"
          fill="currentColor"
          style={{
            opacity: 0,
            animation: 'ink-splash 0.8s var(--ease-out) 2.5s forwards',
          }}
        />
      </svg>

      {/* Insights Navigation - Floating style */}
      <nav className="fixed top-4 left-4 right-4 lg:top-6 lg:left-10 lg:right-10 z-[100] flex justify-between items-center px-4 py-3 lg:px-6 bg-[var(--bg-primary)]/85 backdrop-blur-[12px] border border-[var(--border)] transition-colors">
        {/* Logo and Brand - Click to go back to landing */}
        <button
          onClick={onNavigateToLanding}
          className="flex items-center gap-2 group"
        >
          <VotiveLogo size="sm" />
          <span className="font-display text-xl font-semibold tracking-[0.05em] text-[var(--text-primary)]">
            {t('landing.nav.brand')}
          </span>
        </button>

        {/* Right side - Links and Controls */}
        <div className="flex items-center gap-6 lg:gap-10">
          {/* Nav Links - styled like landing nav links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              type="button"
              onClick={onNavigateToAssessment}
              className="nav-link font-body text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {t('header.nav.assessment')}
            </button>
            <button
              type="button"
              onClick={handleImportClick}
              className="nav-link font-body text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {t('header.buttons.import')}
            </button>
            {hasResponses && (
              <button
                type="button"
                onClick={handleExportClick}
                className="nav-link font-body text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t('header.buttons.export')}
              </button>
            )}
            {hasAnalysis && onExportAnalysis && (
              <button
                type="button"
                onClick={handleExportAnalysisClick}
                className="nav-link font-body text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t('header.buttons.exportAnalysis')}
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Language Toggle - Inline EN | PL */}
            <div className="flex items-center gap-0.5 font-mono text-xs text-[var(--text-faint)]">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-1.5 py-1 transition-colors ${
                  i18n.language === 'en'
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'
                }`}
              >
                EN
              </button>
              <span className="text-[var(--border-strong)]">|</span>
              <button
                onClick={() => changeLanguage('pl')}
                className={`px-1.5 py-1 transition-colors ${
                  i18n.language === 'pl'
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-faint)] hover:text-[var(--text-primary)]'
                }`}
              >
                PL
              </button>
            </div>

            {/* Theme Toggle - Square with border */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
              aria-label={isDark ? t('header.theme.toggleLight') : t('header.theme.toggleDark')}
            >
              {isDark ? <SunIcon size="sm" /> : <MoonIcon size="sm" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Import error message */}
      {importError && (
        <div className="fixed top-20 lg:top-24 left-4 right-4 lg:left-10 lg:right-10 z-40 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <ErrorCircleIcon size="sm" className="flex-shrink-0" />
          <span>{importError}</span>
          <button
            onClick={() => setImportError(null)}
            className="ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content with top padding for floating nav */}
      <div className="flex-1 pt-20 lg:pt-24">
        <div className="max-w-6xl mx-auto px-6 py-8">
        {!analysis && !loading && (
          <div className="text-center py-16 scroll-reveal">
            {/* Ink brush circle - minimalist ready state */}
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="180 20"
                  className="opacity-20"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="24"
                  fill="var(--accent)"
                  className="opacity-10"
                />
                <path
                  d="M32 40 L38 46 L50 34"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">{t('insights.ready.title')}</h2>
            <p className="font-body text-[var(--text-secondary)] mb-6 max-w-md mx-auto">{t('insights.ready.description')}</p>
            <button
              onClick={analyzeWithClaude}
              className="cta-button px-6 py-3 bg-[var(--accent)] text-white font-body font-medium rounded-sm inline-flex items-center gap-2"
            >
              <span>{t('insights.ready.button')}</span>
              <span>→</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            {/* Ink brush loading animation */}
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <svg viewBox="0 0 80 80" className="w-full h-full animate-spin" style={{ animationDuration: '3s' }} aria-hidden="true">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="60 140"
                  className="opacity-60"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="40 120"
                  className="opacity-30"
                />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">{t('insights.loading.title')}</h2>
            <p className="font-body text-[var(--text-secondary)]">{t('insights.loading.description')}</p>
            <div className="mt-6 flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"
                  style={{
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            {/* Minimalist error indicator */}
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="180 20"
                  className="text-red-500/30"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="24"
                  fill="currentColor"
                  className="text-red-500/10"
                />
                <path
                  d="M40 28 L40 44 M40 50 L40 52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-red-500"
                />
              </svg>
            </div>
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">{t('insights.error.title')}</h2>
            <p className="font-body text-[var(--text-secondary)] mb-4">{error}</p>
            <div className="flex items-center justify-center gap-3">
              {rawResponse && (
                <button
                  onClick={downloadRawResponse}
                  className="px-4 py-2.5 text-amber-600 hover:bg-amber-500/10 border border-amber-500/30 font-body font-medium rounded-sm transition-colors"
                >
                  {t('insights.error.downloadRaw')}
                </button>
              )}
              <button
                onClick={analyzeWithClaude}
                className="cta-button px-6 py-3 bg-[var(--accent)] text-white font-body font-medium rounded-sm"
              >
                {t('insights.error.tryAgain')}
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <>
            {/* Tabs */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-sm mb-6 overflow-hidden">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-body text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-1 ${
                      activeTab === tab.id
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <span className="mr-1.5">{tab.icon}</span>
                    {tab.label}
                    {tab.count !== null && (
                      <span
                        className={`ml-2 px-1.5 py-0.5 text-xs rounded-sm ${
                          activeTab === tab.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {activeTab === 'patterns' && analysis.patterns?.map((item, i) => <InsightCard key={i} item={item} />)}

              {activeTab === 'contradictions' && analysis.contradictions?.map((item, i) => <InsightCard key={i} item={item} />)}

              {activeTab === 'blindSpots' && analysis.blindSpots?.map((item, i) => <InsightCard key={i} item={item} />)}

              {activeTab === 'leverage' && analysis.leveragePoints?.map((item, i) => <InsightCard key={i} item={item} />)}

              {activeTab === 'risks' && analysis.risks?.map((item, i) => <InsightCard key={i} item={item} />)}

              {activeTab === 'synthesis' && analysis.identitySynthesis && (
                <div className="space-y-6">
                  <div className={`p-6 ${cardStyles.hero}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <MirrorIcon size="lg" className="text-[var(--accent)]" />
                      <h3 className={`font-display font-semibold text-lg ${textStyles.primary}`}>{t('insights.synthesisTab.whoYouAre')}</h3>
                    </div>
                    <p className={`font-body ${textStyles.secondary} leading-relaxed`}>{analysis.identitySynthesis.currentIdentityCore}</p>
                  </div>

                  {analysis.identitySynthesis.hiddenStrengths?.length > 0 && (
                    <div className={`p-5 ${cardStyles.base}`}>
                      <h4 className={`font-display font-semibold ${textStyles.primary} mb-3 flex items-center gap-2`}>
                        <LightningBoltIcon size="md" className="text-[var(--accent)]" />
                        {t('insights.synthesisTab.hiddenStrengths')}
                      </h4>
                      <ul className="space-y-2">
                        {analysis.identitySynthesis.hiddenStrengths.map((s, i) => (
                          <li key={i} className={`flex items-start gap-2 font-body ${textStyles.secondary}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.identitySynthesis.keyTension && (
                    <div className={`p-5 ${cardStyles.base}`}>
                      <h4 className={`font-display font-semibold ${textStyles.primary} mb-3 flex items-center gap-2`}>
                        <SwitchHorizontalIcon size="md" className="text-[var(--accent)]" />
                        {t('insights.synthesisTab.keyTension')}
                      </h4>
                      <p className={`font-body ${textStyles.secondary}`}>{analysis.identitySynthesis.keyTension}</p>
                    </div>
                  )}

                  {analysis.identitySynthesis.nextIdentityStep && (
                    <div className={`p-5 ${cardStyles.base}`}>
                      <h4 className={`font-display font-semibold ${textStyles.primary} mb-3 flex items-center gap-2`}>
                        <ArrowRightIcon size="md" className="text-[var(--accent)]" />
                        {t('insights.synthesisTab.nextStep')}
                      </h4>
                      <p className={`font-body ${textStyles.secondary}`}>{analysis.identitySynthesis.nextIdentityStep}</p>
                      <p className={`font-body ${textStyles.muted} text-sm mt-3 italic`}>{t('insights.synthesisTab.nextStepHelp')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Re-analyze button */}
            <div className="mt-8 text-center">
              <button
                onClick={analyzeWithClaude}
                className="px-5 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-sm font-body font-medium hover:bg-[var(--bg-tertiary)] border border-[var(--border)] transition-colors inline-flex items-center gap-2"
              >
                <RefreshIcon size="sm" />
                <span>{t('insights.reanalyze.button')}</span>
              </button>
              <p className="font-body text-[var(--text-muted)] text-sm mt-2">{t('insights.reanalyze.description')}</p>
            </div>
          </>
        )}
        </div>
      </div>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default IdentityInsightsAI;
