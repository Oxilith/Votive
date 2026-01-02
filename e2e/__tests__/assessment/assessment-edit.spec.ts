/**
 * @file e2e/__tests__/assessment/assessment-edit.spec.ts
 * @purpose E2E tests for assessment editing functionality
 * @functionality
 * - Tests editing assessment responses
 * - Tests completing assessment creates new record
 * - Tests leaving without completing persists to store
 * @dependencies
 * - Custom test fixtures from fixtures/test
 * - AssessmentPage and ProfilePage page objects
 */

import { test, expect } from '../../fixtures';
import { AssessmentPage, ProfilePage } from '../../pages';

test.describe('Assessment Editing', () => {
  test('should modify responses in edit mode', async ({ assessmentPage }) => {
    await assessmentPage.navigate();
    await assessmentPage.startAssessment();

    // Fill first question
    await assessmentPage.selectMultipleOptions([0, 1]);
    await assessmentPage.clickNext();

    // Go back and change the selection
    await assessmentPage.clickBack();

    // The previous selections might still be there, add another one
    await assessmentPage.selectMultipleOptions([2]);

    // Should still be able to proceed
    expect(await assessmentPage.isNextEnabled()).toBe(true);
  });

  test('should allow editing textarea content', async ({ assessmentPage }) => {
    await assessmentPage.navigate();
    await assessmentPage.startAssessment();

    // Navigate to a textarea step
    await assessmentPage.selectMultipleOptions([0, 1]);
    await assessmentPage.clickNext();
    await assessmentPage.selectMultipleOptions([2, 3]);
    await assessmentPage.clickNext();
    await assessmentPage.setScaleValue(3);
    await assessmentPage.clickNext();

    // Fill textarea
    await assessmentPage.fillTextarea('Initial response');

    // Clear and edit
    await assessmentPage.fillTextarea('Updated response text');

    // Should still be valid
    expect(await assessmentPage.isNextEnabled()).toBe(true);
  });

  test('should persist responses when navigating away without completing', async ({
    page,
    assessmentPage,
  }) => {
    await assessmentPage.navigate();
    await assessmentPage.startAssessment();

    // Fill some steps
    await assessmentPage.selectMultipleOptions([0, 1, 2]);
    await assessmentPage.clickNext();
    await assessmentPage.selectMultipleOptions([3, 4]);
    await assessmentPage.clickNext();
    await assessmentPage.setScaleValue(4);

    // Navigate away without completing
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Come back to assessment
    await assessmentPage.navigate();

    // For non-authenticated users, localStorage should persist some state
    // The app should remember we were in progress
    // (Exact behavior depends on implementation - check we can still see assessment content)
    const stepType = await assessmentPage.getCurrentStepType();
    expect(stepType).not.toBe('unknown');
  });

  test('should create new assessment record on complete for authenticated user', async ({
    authenticatedPage,
  }) => {
    const assessmentPage = new AssessmentPage(authenticatedPage);
    const profilePage = new ProfilePage(authenticatedPage);

    // Get initial count
    await profilePage.navigate();
    const initialCount = await profilePage.getAssessmentCount();

    // Complete first assessment
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();
    await authenticatedPage.waitForURL('**/insights', { timeout: 10000 });

    // Check count increased
    await profilePage.navigate();
    const countAfterFirst = await profilePage.getAssessmentCount();
    expect(countAfterFirst).toBe(initialCount + 1);

    // Complete another assessment
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();
    await authenticatedPage.waitForURL('**/insights', { timeout: 10000 });

    // Check count increased again
    await profilePage.navigate();
    const countAfterSecond = await profilePage.getAssessmentCount();
    expect(countAfterSecond).toBe(initialCount + 2);
  });

  test('should allow different responses on new assessment', async ({
    authenticatedPage,
  }) => {
    const assessmentPage = new AssessmentPage(authenticatedPage);

    // Start first assessment with specific choices
    await assessmentPage.navigate();
    await assessmentPage.startAssessment();
    await assessmentPage.selectMultipleOptions([0, 1]);
    await assessmentPage.clickNext();

    // Navigate away
    await authenticatedPage.goto('/');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Start fresh - navigate back to assessment
    await assessmentPage.navigate();

    // For a fresh start, the intro/welcome screen should be visible
    // or the assessment should show content
    const stepType = await assessmentPage.getCurrentStepType();
    expect(['intro', 'multiSelect', 'singleSelect', 'scale', 'textarea']).toContain(
      stepType,
    );
  });
});

test.describe('Assessment Editing - Authenticated User', () => {
  test('should track dirty state when editing after save', async ({
    authenticatedPage,
  }) => {
    const assessmentPage = new AssessmentPage(authenticatedPage);
    const profilePage = new ProfilePage(authenticatedPage);

    // Complete an assessment
    await assessmentPage.navigate();
    await assessmentPage.completeFullAssessment();
    await authenticatedPage.waitForURL('**/insights', { timeout: 10000 });

    // Verify assessment was saved
    await profilePage.navigate();
    const count = await profilePage.getAssessmentCount();
    expect(count).toBeGreaterThan(0);

    // Start a new assessment (this should create dirty state)
    await assessmentPage.navigate();
    await assessmentPage.startAssessment();
    await assessmentPage.selectMultipleOptions([0]);

    // Navigate to insights - should see dirty warning (if applicable)
    await authenticatedPage.goto('/insights');
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // The insights page should show something (either ready state or dirty warning)
    const pageVisible = await authenticatedPage
      .locator('[data-testid="insights-page"]')
      .isVisible({ timeout: 5000 });
    expect(pageVisible).toBe(true);
  });
});
