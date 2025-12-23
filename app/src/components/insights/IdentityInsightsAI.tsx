/**
 * @file src/components/insights/IdentityInsightsAI.tsx
 * @purpose AI-powered analysis of assessment responses using Claude API via backend proxy
 * @functionality
 * - Receives assessment responses as props
 * - Uses Zustand analysis store for state management
 * - Displays analysis results in tabbed interface (patterns, contradictions, blind spots, etc.)
 * - Shows identity synthesis with hidden strengths and next steps
 * - Provides re-analyze functionality for additional insights
 * - Includes loading states and error handling
 * - Supports dark mode theme switching
 * - Supports internationalization (English/Polish)
 * @dependencies
 * - React (useState, useCallback)
 * - react-i18next (useTranslation)
 * - @/types/assessment.types (InsightsProps, AnalysisPattern, etc.)
 * - @/stores (useAnalysisStore)
 * - @/styles/theme (cardStyles, textStyles, badgeStyles)
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  InsightsProps,
  AnalysisPattern,
  AnalysisContradiction,
  AnalysisBlindSpot,
  AnalysisLeveragePoint,
  AnalysisRisk,
} from '@/types/assessment.types';
import { useAnalysisStore } from '@/stores';
import { cardStyles, textStyles, badgeStyles } from '@/styles/theme';

type InsightType = 'pattern' | 'contradiction' | 'blindSpot' | 'leverage' | 'risk';

interface InsightCardProps {
  item: AnalysisPattern | AnalysisContradiction | AnalysisBlindSpot | (AnalysisLeveragePoint & { icon?: string }) | (AnalysisRisk & { icon?: string });
  type: InsightType;
}

const InsightCard: React.FC<InsightCardProps> = ({ item, type }) => {
  const { t } = useTranslation();

  // Use shared theme styles - all insight types use consistent neutral colors
  void type; // Type is kept for potential future per-type styling

  const patternItem = item as AnalysisPattern;
  const contradictionItem = item as AnalysisContradiction;
  const blindSpotItem = item as AnalysisBlindSpot;
  const leverageItem = item as AnalysisLeveragePoint & { icon?: string };

  return (
    <div className={`p-5 ${cardStyles.base} space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {'icon' in item && item.icon && <span className="text-2xl">{item.icon}</span>}
          <h4 className={`font-semibold ${textStyles.primary}`}>{item.title}</h4>
        </div>
        {'severity' in item && item.severity && (
          <span
            className={`text-xs px-2 py-0.5  ${
              item.severity === 'high' ? badgeStyles.emphasis : badgeStyles.default
            }`}
          >
            {item.severity === 'high' ? t('insights.cards.highImpact') : t('insights.cards.mediumImpact')}
          </span>
        )}
      </div>

      {'description' in item && item.description && <p className={`${textStyles.primary} opacity-90`}>{item.description}</p>}

      {'observation' in item && item.observation && <p className={`${textStyles.primary} opacity-90`}>{blindSpotItem.observation}</p>}

      {'evidence' in item && item.evidence && Array.isArray(item.evidence) && (
        <div className="space-y-1">
          <p className={`text-xs font-medium uppercase tracking-wide ${textStyles.secondary} opacity-70`}>{t('insights.cards.evidence')}</p>
          <ul className={`text-sm ${textStyles.secondary} space-y-1`}>
            {(item.evidence as string[]).map((e, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="opacity-50">•</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {'evidence' in item && item.evidence && typeof item.evidence === 'string' && (
        <div className="space-y-1">
          <p className={`text-xs font-medium uppercase tracking-wide ${textStyles.secondary} opacity-70`}>{t('insights.cards.evidence')}</p>
          <p className={`text-sm ${textStyles.secondary}`}>{item.evidence}</p>
        </div>
      )}

      {'sides' in item && item.sides && (
        <div className="space-y-1">
          <p className={`text-xs font-medium uppercase tracking-wide ${textStyles.secondary} opacity-70`}>{t('insights.cards.theTension')}</p>
          <div className={`flex items-center gap-3 text-sm ${textStyles.secondary}`}>
            <span className="px-3 py-1.5 bg-[var(--bg-secondary)] ">{contradictionItem.sides[0]}</span>
            <span className="opacity-50">{t('insights.cards.vs')}</span>
            <span className="px-3 py-1.5 bg-[var(--bg-secondary)] ">{contradictionItem.sides[1]}</span>
          </div>
        </div>
      )}

      {'implication' in item && item.implication && (
        <div className="space-y-1">
          <p className={`text-xs font-medium uppercase tracking-wide ${textStyles.secondary} opacity-70`}>{t('insights.cards.whatThisMeans')}</p>
          <p className={`text-sm ${textStyles.secondary}`}>{patternItem.implication}</p>
        </div>
      )}

      {'hypothesis' in item && item.hypothesis && (
        <div className="space-y-1">
          <p className={`text-xs font-medium uppercase tracking-wide ${textStyles.secondary} opacity-70`}>{t('insights.cards.hypothesis')}</p>
          <p className={`text-sm ${textStyles.secondary}`}>{contradictionItem.hypothesis}</p>
        </div>
      )}

      {'reframe' in item && item.reframe && (
        <div className="space-y-1">
          <p className={`text-xs font-medium uppercase tracking-wide ${textStyles.secondary} opacity-70`}>{t('insights.cards.reframe')}</p>
          <p className={`text-sm font-medium ${textStyles.secondary}`}>{blindSpotItem.reframe}</p>
        </div>
      )}

      {'leverage' in item && item.leverage && (
        <div className="space-y-1">
          <p className={`text-xs font-medium uppercase tracking-wide ${textStyles.secondary} opacity-70`}>{t('insights.cards.leveragePoint')}</p>
          <p className={`text-sm font-medium ${textStyles.secondary}`}>{patternItem.leverage}</p>
        </div>
      )}

      {'insight' in item && item.insight && <p className={`${textStyles.primary} opacity-90`}>{leverageItem.insight}</p>}

      {'question' in item && item.question && (
        <div className="mt-3 p-3 bg-[var(--bg-secondary)] ">
          <p className={`text-xs font-medium uppercase tracking-wide ${textStyles.secondary} opacity-70 mb-1`}>{t('insights.cards.reflectionQuestion')}</p>
          <p className={`text-sm italic ${textStyles.secondary}`}>{contradictionItem.question}</p>
        </div>
      )}
    </div>
  );
};

interface Tab {
  id: string;
  label: string;
  count: number | null;
  icon: string;
}

const IdentityInsightsAI: React.FC<InsightsProps> = ({ responses }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('patterns');

  // Use Zustand analysis store
  const {
    analysis,
    rawResponse,
    isAnalyzing: loading,
    analysisError: error,
    analyze,
    downloadRawResponse,
  } = useAnalysisStore();

  const analyzeWithClaude = useCallback(async () => {
    const language = i18n.language === 'pl' ? 'polish' : 'english';
    await analyze(responses, language);
  }, [analyze, responses, i18n.language]);

  const tabs: Tab[] = analysis
    ? [
        { id: 'patterns', label: t('insights.tabs.patterns'), count: analysis.patterns?.length ?? 0, icon: '🔍' },
        { id: 'contradictions', label: t('insights.tabs.contradictions'), count: analysis.contradictions?.length ?? 0, icon: '🔀' },
        { id: 'blindSpots', label: t('insights.tabs.blindSpots'), count: analysis.blindSpots?.length ?? 0, icon: '👁️' },
        { id: 'leverage', label: t('insights.tabs.leverage'), count: analysis.leveragePoints?.length ?? 0, icon: '🎯' },
        { id: 'risks', label: t('insights.tabs.risks'), count: analysis.risks?.length ?? 0, icon: '⚠️' },
        { id: 'synthesis', label: t('insights.tabs.synthesis'), count: null, icon: '🪞' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {!analysis && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[var(--color-violet)]/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🔮</span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)] mb-2">{t('insights.ready.title')}</h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">{t('insights.ready.description')}</p>
            <button
              onClick={analyzeWithClaude}
              className="cta-button px-6 py-3 tech-gradient text-white font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <span>{t('insights.ready.button')}</span>
              <span>→</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[var(--color-violet)]/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <span className="text-4xl">🧠</span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)] mb-2">{t('insights.loading.title')}</h2>
            <p className="text-[var(--text-secondary)]">{t('insights.loading.description')}</p>
            <div className="mt-6 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 bg-[var(--color-violet)]  animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="font-serif text-xl font-semibold text-[var(--text-primary)] mb-2">{t('insights.error.title')}</h2>
            <p className="text-[var(--text-secondary)] mb-4">{error}</p>
            <div className="flex items-center justify-center gap-3">
              {rawResponse && (
                <button
                  onClick={downloadRawResponse}
                  className="px-4 py-2.5 text-amber-600 hover:bg-amber-500/10 border border-amber-500/30 font-medium transition-colors"
                >
                  {t('insights.error.downloadRaw')}
                </button>
              )}
              <button
                onClick={analyzeWithClaude}
                className="cta-button px-6 py-3 tech-gradient text-white font-medium hover:opacity-90 transition-opacity"
              >
                {t('insights.error.tryAgain')}
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <>
            {/* Tabs */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] mb-6 overflow-hidden">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-1 ${
                      activeTab === tab.id
                        ? 'border-[var(--color-violet)] text-[var(--color-violet)] bg-[var(--color-violet)]/10'
                        : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <span className="mr-1.5">{tab.icon}</span>
                    {tab.label}
                    {tab.count !== null && (
                      <span
                        className={`ml-2 px-1.5 py-0.5 text-xs ${
                          activeTab === tab.id ? 'bg-[var(--color-violet)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
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
              {activeTab === 'patterns' && analysis.patterns?.map((item, i) => <InsightCard key={i} item={item} type="pattern" />)}

              {activeTab === 'contradictions' && analysis.contradictions?.map((item, i) => <InsightCard key={i} item={item} type="contradiction" />)}

              {activeTab === 'blindSpots' && analysis.blindSpots?.map((item, i) => <InsightCard key={i} item={item} type="blindSpot" />)}

              {activeTab === 'leverage' && analysis.leveragePoints?.map((item, i) => <InsightCard key={i} item={{ ...item, icon: '🎯' }} type="leverage" />)}

              {activeTab === 'risks' && analysis.risks?.map((item, i) => <InsightCard key={i} item={{ ...item, icon: '⚠️' }} type="risk" />)}

              {activeTab === 'synthesis' && analysis.identitySynthesis && (
                <div className="space-y-6">
                  <div className={`p-6 ${cardStyles.hero} ${textStyles.primary}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🪞</span>
                      <h3 className="font-semibold text-lg">{t('insights.synthesisTab.whoYouAre')}</h3>
                    </div>
                    <p className={`${textStyles.secondary} leading-relaxed`}>{analysis.identitySynthesis.currentIdentityCore}</p>
                  </div>

                  {analysis.identitySynthesis.hiddenStrengths?.length > 0 && (
                    <div className={`p-5 ${cardStyles.base}`}>
                      <h4 className={`font-semibold ${textStyles.primary} mb-3 flex items-center gap-2`}>
                        <span>💪</span> {t('insights.synthesisTab.hiddenStrengths')}
                      </h4>
                      <ul className="space-y-2">
                        {analysis.identitySynthesis.hiddenStrengths.map((s, i) => (
                          <li key={i} className={`flex items-start gap-2 ${textStyles.secondary}`}>
                            <span className={textStyles.subtle}>•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.identitySynthesis.keyTension && (
                    <div className={`p-5 ${cardStyles.base}`}>
                      <h4 className={`font-semibold ${textStyles.primary} mb-3 flex items-center gap-2`}>
                        <span>⚡</span> {t('insights.synthesisTab.keyTension')}
                      </h4>
                      <p className={textStyles.secondary}>{analysis.identitySynthesis.keyTension}</p>
                    </div>
                  )}

                  {analysis.identitySynthesis.nextIdentityStep && (
                    <div className={`p-5 ${cardStyles.base}`}>
                      <h4 className={`font-semibold ${textStyles.primary} mb-3 flex items-center gap-2`}>
                        <span>🚀</span> {t('insights.synthesisTab.nextStep')}
                      </h4>
                      <p className={textStyles.secondary}>{analysis.identitySynthesis.nextIdentityStep}</p>
                      <p className={`${textStyles.muted} text-sm mt-3 italic`}>{t('insights.synthesisTab.nextStepHelp')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Re-analyze button */}
            <div className="mt-8 text-center">
              <button
                onClick={analyzeWithClaude}
                className="px-5 py-2.5 bg-[var(--bg-card)] text-[var(--text-secondary)]  font-medium hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] transition-colors inline-flex items-center gap-2"
              >
                <span>🔄</span>
                <span>{t('insights.reanalyze.button')}</span>
              </button>
              <p className="text-[var(--text-muted)] text-sm mt-2">{t('insights.reanalyze.description')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IdentityInsightsAI;
