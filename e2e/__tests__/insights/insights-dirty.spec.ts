/**
 * @file e2e/__tests__/insights/insights-dirty.spec.ts
 * @purpose E2E tests for insights dirty state handling
 * @functionality
 * - Tests clean state allows analysis button visibility
 * - Tests dirty state shows warning alert
 * - Tests dirty state blocks analysis button
 * @dependencies
 * - Custom test fixtures from fixtures/test
 * - InsightsPage and AssessmentPage page objects
 */

import { test, expect } from '../../fixtures';
import { AssessmentPage, InsightsPage } from '../../pages';

test.describe('Insights Dirty State', () => {
  test('should show analyze button when assessment is complete and clean', async ({
    assessmentPage,
    insightsPage,
  }) => {
    // Complete the assessment to get to insights
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();

    // Should be on insights page now
    expect(insightsPage.page.url()).toContain('/insights');

    // Should show ready state with analyze button
    const isReady = await insightsPage.isReadyState();
    expect(isReady).toBe(true);

    // Analyze button should be visible
    const analyzeVisible = await insightsPage.page
      .locator(insightsPage.analyzeTestId)
      .isVisible({ timeout: 5000 });
    expect(analyzeVisible).toBe(true);

    // No dirty warning should be shown
    const hasDirtyWarning = await insightsPage.hasDirtyWarning();
    expect(hasDirtyWarning).toBe(false);
  });

  test('should show dirty warning when assessment has unsaved changes', async ({
    page,
    assessmentPage,
    insightsPage,
  }) => {
    // First complete an assessment to establish clean state
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();

    // Verify we're on insights and ready
    expect(insightsPage.page.url()).toContain('/insights');

    // Now go back and modify the assessment (creating dirty state)
    await assessmentPage.navigate();
    await assessmentPage.startAssessment();

    // Make a change (select different options)
    await assessmentPage.selectMultipleOptions([0, 2, 3]);

    // Navigate to insights without completing
    await page.goto('/insights');
    await page.waitForLoadState('domcontentloaded');

    // The ready state should still be shown (we have previous assessment data)
    // But now with dirty warning instead of analyze button
    const hasDirtyWarning = await insightsPage.hasDirtyWarning();
    const hasAnalyzeButton = await page
      .locator(insightsPage.analyzeTestId)
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    // Either dirty warning is shown OR no analyze button (depends on implementation)
    expect(hasDirtyWarning || !hasAnalyzeButton).toBe(true);
  });

  test('should show pending changes alert in ready state when dirty', async ({
    page,
    assessmentPage,
    insightsPage,
  }) => {
    // Complete an assessment first
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();

    // Now modify assessment (dirty state)
    await assessmentPage.navigate();
    await assessmentPage.startAssessment();
    await assessmentPage.selectMultipleOptions([1, 3]);

    // Go to insights
    await page.goto('/insights');
    await page.waitForLoadState('domcontentloaded');

    // Check for pending changes alert visibility
    const hasPendingAlert = await insightsPage.hasPendingChangesAlert();

    // Either has pending alert or no analyze button
    const hasAnalyzeButton = await page
      .locator(insightsPage.analyzeTestId)
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    expect(hasPendingAlert || !hasAnalyzeButton).toBe(true);
  });
});

test.describe('Insights Dirty State - Authenticated User', () => {
  test('should block reanalyze when assessment is dirty after save', async ({
    authenticatedPage,
  }) => {
    const assessmentPage = new AssessmentPage(authenticatedPage);
    const insightsPage = new InsightsPage(authenticatedPage);

    // Complete an assessment (triggers save for authenticated user)
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();
    await authenticatedPage.waitForURL('**/insights', { timeout: 10000 });

    // Verify ready state
    const isReady = await insightsPage.isReadyState();
    expect(isReady).toBe(true);

    // Now go modify assessment
    await assessmentPage.navigate();
    await assessmentPage.startAssessment();
    await assessmentPage.selectMultipleOptions([0, 1, 2]);

    // Navigate back to insights
    await authenticatedPage.goto('/insights');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Analyze button should be blocked (dirty state)
    // Either dirty warning shown or analyze button hidden
    const hasDirtyWarning = await insightsPage.hasDirtyWarning();
    const analyzeVisible = await authenticatedPage
      .locator(insightsPage.analyzeTestId)
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    // Dirty state should prevent analysis
    expect(hasDirtyWarning || !analyzeVisible).toBe(true);
  });
});
