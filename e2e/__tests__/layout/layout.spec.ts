/**
 * @file e2e/__tests__/layout/layout.spec.ts
 * @purpose E2E tests for page layout structure across different pages
 * @functionality
 * - Tests header visibility on all pages
 * - Tests footer visibility on applicable pages
 * - Tests navigation links visibility
 * - Tests auth pages have no footer
 * - Tests page-specific containers exist
 * @dependencies
 * - Custom test fixtures from fixtures/test
 * - LayoutPage page object
 */

import { test, expect } from '../../fixtures';

test.describe('Layout Structure', () => {
  test.describe('Landing Page Layout', () => {
    test('should display header with navigation', async ({ layoutPage }) => {
      await layoutPage.navigateToLanding();

      // Header should be visible
      expect(await layoutPage.isHeaderVisible()).toBe(true);

      // Navigation links should be visible on desktop
      await layoutPage.setViewport('desktop');
      expect(await layoutPage.areNavLinksVisible()).toBe(true);
    });

    test('should display footer on landing page', async ({ layoutPage }) => {
      await layoutPage.navigateToLanding();
      await layoutPage.scrollToBottom();

      expect(await layoutPage.isFooterVisible()).toBe(true);
    });

    test('should display theme toggle', async ({ layoutPage }) => {
      await layoutPage.navigateToLanding();

      expect(await layoutPage.isThemeToggleVisible()).toBe(true);
    });

    test('should display language toggle', async ({ layoutPage }) => {
      await layoutPage.navigateToLanding();

      expect(await layoutPage.isLanguageToggleVisible()).toBe(true);
    });
  });

  test.describe('Assessment Page Layout', () => {
    test('should display header on assessment page', async ({ layoutPage }) => {
      await layoutPage.navigateToAssessment();

      expect(await layoutPage.isHeaderVisible()).toBe(true);
    });

    test('should display footer on assessment page', async ({ layoutPage }) => {
      await layoutPage.navigateToAssessment();
      await layoutPage.scrollToBottom();

      expect(await layoutPage.isFooterVisible()).toBe(true);
    });

    test('should have sticky header on scroll', async ({ layoutPage }) => {
      await layoutPage.navigateToAssessment();

      // Verify header stays visible after scrolling
      expect(await layoutPage.isHeaderSticky()).toBe(true);
    });
  });

  test.describe('Insights Page Layout', () => {
    test('should display header on insights page', async ({ layoutPage }) => {
      await layoutPage.navigateToInsights();

      expect(await layoutPage.isHeaderVisible()).toBe(true);
    });

    test('should display footer on insights page', async ({ layoutPage }) => {
      await layoutPage.navigateToInsights();
      await layoutPage.scrollToBottom();

      expect(await layoutPage.isFooterVisible()).toBe(true);
    });

    test('should display insights page container', async ({ layoutPage }) => {
      await layoutPage.navigateToInsights();

      const insightsPage = layoutPage.page.locator(layoutPage.insightsPage);
      expect(await insightsPage.isVisible()).toBe(true);
    });
  });

  test.describe('Profile Page Layout', () => {
    test.beforeEach(async ({ registerPage, testUser }) => {
      // Need to be authenticated to access profile
      await registerPage.navigate();
      await registerPage.register({
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.password,
        birthYear: testUser.birthYear,
        gender: testUser.gender,
      });
    });

    test('should display header on profile page', async ({ layoutPage }) => {
      await layoutPage.navigateToProfile();

      expect(await layoutPage.isHeaderVisible()).toBe(true);
    });

    test('should display footer on profile page', async ({ layoutPage }) => {
      await layoutPage.navigateToProfile();
      await layoutPage.scrollToBottom();

      expect(await layoutPage.isFooterVisible()).toBe(true);
    });

    test('should display profile page container', async ({ layoutPage }) => {
      await layoutPage.navigateToProfile();

      const profilePage = layoutPage.page.locator(layoutPage.profilePage);
      expect(await profilePage.isVisible()).toBe(true);
    });
  });

  test.describe('Auth Pages Layout', () => {
    test('should display header on sign-in page', async ({ layoutPage }) => {
      await layoutPage.navigateToSignIn();

      expect(await layoutPage.isHeaderVisible()).toBe(true);
    });

    test('should NOT display footer on sign-in page', async ({ layoutPage }) => {
      await layoutPage.navigateToSignIn();

      // Auth pages typically don't have footer
      // This test documents expected behavior - adjust if design differs
      const hasFooter = await layoutPage.isFooterVisible();
      // If footer IS visible on auth pages, this test will fail and should be updated
      expect(hasFooter).toBe(false);
    });

    test('should display header on sign-up page', async ({ layoutPage }) => {
      await layoutPage.navigateToSignUp();

      expect(await layoutPage.isHeaderVisible()).toBe(true);
    });

    test('should display header on forgot-password page', async ({ layoutPage }) => {
      await layoutPage.navigateToForgotPassword();

      expect(await layoutPage.isHeaderVisible()).toBe(true);
    });

    test('should display auth page container', async ({ layoutPage }) => {
      await layoutPage.navigateToSignIn();

      const authPage = layoutPage.page.locator(layoutPage.authPage);
      expect(await authPage.isVisible()).toBe(true);
    });
  });
});
