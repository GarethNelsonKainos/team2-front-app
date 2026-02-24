import { test, expect} from '@playwright/test';


test.describe('Job Role Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await page.getByRole('link', { name: 'View All Roles' }).click();
    await page.getByRole('cell', { name: 'Software Engineer' }).click();
    await page.getByRole('row', { name: 'Software Engineer Belfast' }).getByRole('link').click();
  });
 
  test('displays job title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Software Engineer' })).toBeVisible();
  });
 
  test('displays job description', async ({ page }) => {
    await expect(page.getByText(/As a Software Engineer at/)).toBeVisible();
    await expect(page.getByText(/Design, develop, and maintain/)).toBeVisible();
  });
 
  test('displays job metadata', async ({ page }) => {
    await expect(page.getByText("01/03/2026")).toHaveText('01/03/2026');
    await expect(page.getByText('Status Open')).toBeVisible();
  });
 
  test('displays job specifications', async ({ page }) => {
    await expect(page.getByText('Positions 1')).toBeVisible();
    await expect(page.getByText('Location Belfast')).toBeVisible();
    await expect(page.getByText('Band Apprentice')).toBeVisible();
  });
 
  test('can navigate back to roles list', async ({ page }) => {
    await page.getByRole('link', { name: 'Back' }).click();
    await page.waitForURL(/\/job-roles/);
  });
});