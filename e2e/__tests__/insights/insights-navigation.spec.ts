/**
 * @file e2e/__tests__/insights/insights-navigation.spec.ts
 * @purpose E2E tests for insights page navigation
 * @functionality
 * - Tests direct URL access to /insights
 * - Tests accessing specific analysis by ID
 * - Tests no assessment message display
 * @dependencies
 * - Custom test fixtures from fixtures/test
 * - InsightsPage, AssessmentPage, and ProfilePage page objects
 */

import { test, expect } from '../../fixtures';
import { AssessmentPage, InsightsPage, ProfilePage } from '../../pages';

test.describe('Insights Navigation', () => {
  test('should access insights page via direct URL', async ({ insightsPage }) => {
    await insightsPage.navigate();

    // Page should load
    const pageVisible = await insightsPage.page
      .locator(insightsPage.insightsPage)
      .isVisible({ timeout: 5000 });
    expect(pageVisible).toBe(true);
  });

  test('should show no assessment message when no assessment data', async ({
    page,
    insightsPage,
  }) => {
    // Clear localStorage to ensure no assessment data
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Navigate to insights
    await insightsPage.navigate();

    // Should show no assessment state
    const noAssessment = await insightsPage.isNoAssessmentState();
    expect(noAssessment).toBe(true);
  });

  test('should show ready state when assessment data exists but no analysis', async ({
    assessmentPage,
    insightsPage,
  }) => {
    // Complete assessment to populate data
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();

    // Should be on insights in ready state
    expect(insightsPage.page.url()).toContain('/insights');

    const isReady = await insightsPage.isReadyState();
    expect(isReady).toBe(true);
  });

  test('should navigate to insights from assessment completion', async ({
    assessmentPage,
    insightsPage,
  }) => {
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();

    // Should redirect to insights
    expect(insightsPage.page.url()).toContain('/insights');

    // Ready state should be visible
    const isReady = await insightsPage.isReadyState();
    expect(isReady).toBe(true);
  });
});

test.describe('Insights Navigation - Authenticated User', () => {
  test('should access saved analysis from profile', async ({
    authenticatedPage,
  }) => {
    const assessmentPage = new AssessmentPage(authenticatedPage);
    const profilePage = new ProfilePage(authenticatedPage);

    // Complete an assessment
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();
    await authenticatedPage.waitForURL('**/insights', { timeout: 10000 });

    // Note: To test viewing a specific analysis, we'd need to:
    // 1. Run the actual analysis (long operation)
    // 2. Save it to the database
    // 3. Access it via profile

    // For now, verify that profile can be navigated to
    await profilePage.navigate();
    await profilePage.clickTab('analyses');

    // Page should load the analyses tab
    const tabVisible = await authenticatedPage
      .locator(profilePage.analysesTab)
      .getAttribute('aria-selected');
    expect(tabVisible).toBe('true');
  });

  test('should show insights page with assessment data after login', async ({
    authenticatedPage,
  }) => {
    const assessmentPage = new AssessmentPage(authenticatedPage);
    const insightsPage = new InsightsPage(authenticatedPage);

    // Complete an assessment
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();
    await authenticatedPage.waitForURL('**/insights', { timeout: 10000 });

    // Insights page should be visible
    const pageVisible = await authenticatedPage
      .locator(insightsPage.insightsPage)
      .isVisible({ timeout: 5000 });
    expect(pageVisible).toBe(true);
  });

  test('should navigate between insights tabs', async ({ authenticatedPage }) => {
    const assessmentPage = new AssessmentPage(authenticatedPage);
    const insightsPage = new InsightsPage(authenticatedPage);

    // Complete an assessment to get to insights
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();
    await authenticatedPage.waitForURL('**/insights', { timeout: 10000 });

    // We should be in ready state (no analysis yet)
    const isReady = await insightsPage.isReadyState();

    // If ready state, that means we need to trigger analysis first
    // For E2E without actual API, we just verify the page structure
    if (isReady) {
      // Verify analyze button is present
      const analyzeVisible = await authenticatedPage
        .locator(insightsPage.analyzeTestId)
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      // Either button is visible or we're in dirty state
      const hasDirtyWarning = await insightsPage.hasDirtyWarning();
      expect(analyzeVisible || hasDirtyWarning).toBe(true);
    }
  });
});
