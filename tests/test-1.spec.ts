
import { test, expect } from '@playwright/test';

import { AuthPage } from './pages/authPage';
import { HomePage } from './pages/homePage';

test('Admin can log in', async ({ page }) => {
  const authPage = new AuthPage(page);
  const homePage = new HomePage(page);
  await authPage.gotoLogin();
  await authPage.fillLoginForm({ email: 'lauren@test.com', password: 'Password123!' });
  await authPage.submitLogin();
  await expect(homePage.adminDashboardLink()).toBeVisible();
});

test('Admin can create a new job role', async ({ page }) => {
  const authPage = new AuthPage(page);
  const homePage = new HomePage(page);
  await authPage.gotoLogin();
  await authPage.fillLoginForm({ email: 'lauren@test.com', password: 'Password123!' });
  await authPage.submitLogin();
  await homePage.adminDashboardLink().click();
  await page.getByRole('link', { name: ' Create New Job Role' }).click();
  await page.getByRole('textbox', { name: 'Job role name' }).fill('Test Add Role');
  await page.locator('#description').fill('This is adding a new role');
  await page.locator('#responsibilities').fill('Will be used in playwright tests');
  await page.getByRole('textbox', { name: 'SharePoint link' }).fill('https://kainossoftwareltd.sharepoint.com/sites/Brand/Shared%20Documents/Forms/AllItems.aspx?viewid=e22cf078%2D4213%2D495a%2D81b7%2D611f2067a254&id=%2Fsites%2FBrand%2FShared%20Documents%2FTemplates%2C%20logos%20and%20icons%2FLogos%2FKainos%20logo%2FKainos%2Dalt%2Dtransparent%2Epng&parent=%2Fsites%2FBrand%2FShared%20Documents%2FTemplates%2C%20logos%20and%20icons%2FLogos%2FKainos%20logo');
  await page.locator('#closingDate').fill('2030-12-24');
  await page.locator('#numberOfOpenPositions').fill('1');
  await page.locator('#location').fill('Belfast');
  await page.locator('#bandId').selectOption('80acf76f-8a6d-41e1-b71e-0b72777af9c8');
  await page.locator('#capabilityId').selectOption('3c5f94ca-8df3-4727-9dfa-cc2fcf97f383');
  await page.getByRole('button', { name: 'Confirm' }).click();
  // Optionally, check for a success message or redirect
});

test('User can log in', async ({ page }) => {
  const authPage = new AuthPage(page);
  const homePage = new HomePage(page);
  await authPage.gotoLogin();
  await authPage.fillLoginForm({ email: 'sam@test.com', password: 'Password123!' });
  await authPage.submitLogin();
  await expect(homePage.welcomeHeading('Sam Tougher')).toBeVisible();
});

test('User can view all roles', async ({ page }) => {
  const authPage = new AuthPage(page);
  const homePage = new HomePage(page);
  await authPage.gotoLogin();
  await authPage.fillLoginForm({ email: 'sam@test.com', password: 'Password123!' });
  await authPage.submitLogin();
  await page.getByRole('link', { name: 'View All Roles' }).click();
  // Check that the last row in the table contains the expected job role name
  const rows = await page.locator('table tbody tr');
  const rowCount = await rows.count();
  const lastRow = rows.nth(rowCount - 1);
  await expect(lastRow.getByRole('cell', { name: 'Test Add Role' })).toBeVisible();
});



