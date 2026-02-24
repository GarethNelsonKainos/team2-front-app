import { test as base, expect } from '@playwright/test';

// Custom test with authentication setup
const test = base.extend<{ authenticatedPage: typeof base['page'] }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('http://localhost:3001/');
    await page.getByRole('link', { name: 'View All Roles' }).click();
    await page.getByRole('row', { name: 'Test Engineer Poland Testing' }).getByRole('link').click();
    await page.getByRole('link', { name: 'log in' }).click();
    await page.getByRole('textbox', { name: 'Email:' }).fill('david@test.com');
    await page.getByRole('textbox', { name: 'Password:' }).fill('Password123!');
    await page.getByRole('button', { name: 'Submit' }).click();
    // Now authenticated
    await use(page);
  },
});

test('test', async ({ authenticatedPage: page }) => {
  // Already authenticated
  await page.getByRole('link', { name: 'Back' }).click();
  await page.getByRole('link', { name: 'View Details' }).nth(5).click();
  await page.getByRole('link', { name: 'Back' }).click();
  await page.locator('tr:nth-child(7) > td:nth-child(6) > .d-flex > .btn').click();
  await page.getByRole('link', { name: 'Apply Now' }).click();
  await page.getByRole('button', { name: 'Choose file to upload' }).click();
  await page.getByRole('button', { name: 'Choose file to upload' }).setInputFiles('TEST_CV.pdf');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByText('Application submitted').click();
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'View All Applications' }).click();
  await page.getByRole('cell', { name: 'Trainer' }).click();
  await page.getByText('Submitted').click();
  await page.getByRole('link', { name: 'See Role Details' }).nth(3).click();
  await page.getByText('Your application for this').click();
});