/**
 * @file src/App.tsx
 * @purpose Root application component with Zustand state management
 * @functionality
 * - Uses Zustand stores for state management
 * - Coordinates view transitions between landing, assessment, and insights
 * - Provides persistent header with navigation and data management (assessment/insights views)
 * - Handles navigation between views including landing page sections
 * - Provides theme context to component tree for dark/light mode
 * - Displays landing page as default entry point
 * @dependencies
 * - React (useCallback)
 * - @/stores (useAssessmentStore, useUIStore, useAnalysisStore)
 * - @/components/landing/LandingPage
 * - @/components/assessment/IdentityFoundationsAssessment
 * - @/components/insights/IdentityInsightsAI
 * - @/components/shared/Header
 * - @/types/assessment.types
 * - @/utils/fileUtils
 * - @/components/providers/ThemeProvider
 */

import { useCallback } from 'react';
import { LandingPage } from '@/components/landing';
import IdentityFoundationsAssessment from '@/components/assessment/IdentityFoundationsAssessment';
import IdentityInsightsAI from '@/components/insights/IdentityInsightsAI';
import Header from '@/components/shared/Header';
import type { AssessmentResponses } from '@/types/assessment.types';
import { exportToJson } from '@/utils/fileUtils';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { useAssessmentStore, useUIStore, useAnalysisStore } from '@/stores';

function App() {
  // Zustand stores
  const { responses, setResponses } = useAssessmentStore();
  const { currentView, setView, assessmentKey, incrementAssessmentKey, startAtSynthesis, setStartAtSynthesis, hasReachedSynthesis } = useUIStore();
  const { analysis, exportAnalysisToJson } = useAnalysisStore();

  const handleAssessmentComplete = useCallback(
    (completedResponses: AssessmentResponses) => {
      setResponses(completedResponses);
      setView('insights');
    },
    [setResponses, setView]
  );

  const handleImportResponses = useCallback(
    (imported: AssessmentResponses) => {
      setResponses(imported);
      setStartAtSynthesis(true);
      incrementAssessmentKey();
    },
    [setResponses, setStartAtSynthesis, incrementAssessmentKey]
  );

  const handleExportResponses = useCallback(() => {
    if (Object.keys(responses).length > 0) {
      exportToJson(responses as AssessmentResponses);
    }
  }, [responses]);

  const handleStartDiscovery = useCallback(() => {
    setView('assessment');
  }, [setView]);

  const handleNavigateToLanding = useCallback((hash?: string) => {
    setView('landing');
    // Navigate to hash after view change
    if (hash) {
      setTimeout(() => {
        window.location.hash = hash;
      }, 100);
    }
  }, [setView]);

  const handleNavigateToAssessment = useCallback(() => {
    setView('assessment');
  }, [setView]);

  const handleNavigateToInsights = useCallback(() => {
    if (hasReachedSynthesis) {
      setView('insights');
    }
  }, [setView, hasReachedSynthesis]);

  const hasResponses = Object.keys(responses).length > 0;
  const hasAnalysis = !!analysis;

  // Landing page has its own navigation and styling
  if (currentView === 'landing') {
    return (
      <ThemeProvider>
        <LandingPage onStartDiscovery={handleStartDiscovery} />
      </ThemeProvider>
    );
  }

  // Assessment and Insights views use the shared Header
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header
          currentView={currentView}
          hasResponses={hasResponses}
          hasReachedSynthesis={hasReachedSynthesis}
          onImport={handleImportResponses}
          onExport={handleExportResponses}
          onExportAnalysis={hasAnalysis ? exportAnalysisToJson : undefined}
          hasAnalysis={hasAnalysis}
          onNavigateToLanding={handleNavigateToLanding}
          onNavigateToAssessment={handleNavigateToAssessment}
          onNavigateToInsights={handleNavigateToInsights}
        />

        {currentView === 'assessment' ? (
          <IdentityFoundationsAssessment
            key={assessmentKey}
            initialResponses={responses}
            onComplete={handleAssessmentComplete}
            startAtSynthesis={startAtSynthesis}
          />
        ) : (
          <IdentityInsightsAI
            responses={responses as AssessmentResponses}
            onExport={handleExportResponses}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
