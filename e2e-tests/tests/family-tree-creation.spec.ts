import { test, expect } from '@playwright/test';
import { HomePage, FamilyTreePage } from '../helpers/page-objects';
import { createTestFamily } from '../helpers/test-data';

test.describe('Family Tree Creation Flow', () => {
  let homePage: HomePage;
  let familyTreePage: FamilyTreePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    familyTreePage = new FamilyTreePage(page);
    await homePage.goto();
  });

  test('should create new family tree - happy path', async ({ page }) => {
    // Test data
    const testFamily = createTestFamily({
      name: 'Test E2E Family',
      description: 'Created by Playwright E2E test'
    });

    // Create new family tree
    await homePage.createNewFamily();

    // Fill form
    await page.getByLabel('Family Name').fill(testFamily.name);
    await page.getByLabel('Description').fill(testFamily.description || '');
    
    // Submit form
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify redirect to family tree page
    await expect(page).toHaveURL(/\/family\/.+/);
    
    // Verify family name is displayed
    await expect(page.getByRole('heading', { name: testFamily.name })).toBeVisible();
    
    // Verify empty state message
    await expect(page.getByText(/Start by adding your first family member/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await homePage.createNewFamily();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify error message
    await expect(page.getByText('Family name is required')).toBeVisible();
  });

  test('should validate family name length', async ({ page }) => {
    await homePage.createNewFamily();

    // Fill with name that's too long (256+ characters)
    const longName = 'a'.repeat(256);
    await page.getByLabel('Family Name').fill(longName);
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify error message
    await expect(page.getByText(/must be less than 255 characters/i)).toBeVisible();
  });

  test('should cancel family tree creation', async ({ page }) => {
    await homePage.createNewFamily();

    // Fill some data
    await page.getByLabel('Family Name').fill('Cancelled Family');
    
    // Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify return to home page
    await expect(page).toHaveURL('/');
    
    // Verify family was not created
    await expect(page.getByText('Cancelled Family')).not.toBeVisible();
  });

  test('should create multiple family trees', async ({ page }) => {
    // Create first family
    const family1 = createTestFamily({ name: 'E2E Test Family 1' });
    await homePage.createNewFamily();
    await page.getByLabel('Family Name').fill(family1.name);
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForURL(/\/family\/.+/);

    // Return to home
    await page.getByRole('link', { name: 'Home' }).click();

    // Create second family
    const family2 = createTestFamily({ name: 'E2E Test Family 2' });
    await homePage.createNewFamily();
    await page.getByLabel('Family Name').fill(family2.name);
    await page.getByRole('button', { name: 'Create' }).click();
    await page.waitForURL(/\/family\/.+/);

    // Return to home
    await page.getByRole('link', { name: 'Home' }).click();

    // Verify both families are listed
    await expect(page.getByText(family1.name)).toBeVisible();
    await expect(page.getByText(family2.name)).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    await homePage.createNewFamily();
    
    // Fill form
    await page.getByLabel('Family Name').fill('Network Error Test Family');

    // Simulate offline mode before submitting
    await context.setOffline(true);
    
    // Try to create
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify error message
    await expect(page.getByText(/network error|offline|connection/i)).toBeVisible();

    // Restore connection
    await context.setOffline(false);

    // Verify form data is preserved
    await expect(page.getByLabel('Family Name')).toHaveValue('Network Error Test Family');
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Mock API to return 500 error
    await page.route('**/api/families', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await homePage.createNewFamily();
    await page.getByLabel('Family Name').fill('Server Error Test Family');
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify error message
    await expect(page.getByText(/error occurred|try again/i)).toBeVisible();
    
    // Verify form data is preserved
    await expect(page.getByLabel('Family Name')).toHaveValue('Server Error Test Family');
  });
});