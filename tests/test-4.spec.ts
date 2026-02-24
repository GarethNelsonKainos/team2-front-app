import { test, expect, type Page } from '@playwright/test';

test.describe('Registration', () => {
    const registerPageUrl = 'http://localhost:3001/login';
    
    const goToRegisterTab = async (page: Page) => {
    await page.goto(registerPageUrl);
    await page.getByRole('tab', { name: 'Register' }).click();
    };
    
    const fillRegistrationForm = async (
    page: Page,
    data: {
        firstName: string;
        secondName: string;
        email: string;
        password: string;
        confirmedPassword: string;
    },
    ) => {
    await page.getByRole('textbox', { name: 'First Name:' }).fill(data.firstName);
    await page.getByRole('textbox', { name: 'Surname:' }).fill(data.secondName);
    await page.getByRole('textbox', { name: 'Email:' }).fill(data.email);
    await page.getByRole('textbox', { name: 'Password:', exact: true }).fill(data.password);
    await page.getByRole('textbox', { name: 'Confirm Password:' }).fill(data.confirmedPassword);
    };
    
    const fillLoginForm = async (
    page: Page,
    data: {
        email: string;
        password: string;
    },
    ) => {
    await page.getByRole('textbox', { name: 'Email:' }).fill(data.email);
    await page.getByRole('textbox', { name: 'Password:' }).fill(data.password);
    };
    
    test('registers a new user successfully', async ({ page }) => {
    const uniqueEmail = `jsimpson_${Date.now()}@gmail.com`;
    
    await goToRegisterTab(page);
    await fillRegistrationForm(page, {
        firstName: 'John',
        secondName: 'Simpson',
        email: uniqueEmail,
        password: 'Password123!',
        confirmedPassword: 'Password123!',
    });
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('heading', { name: 'Welcome, John Simpson!' })).toBeVisible();
    });
    
    test('shows validation error for invalid email during registration', async ({ page }) => {
    await goToRegisterTab(page);
    await fillRegistrationForm(page, {
        firstName: 'John',
        secondName: 'Simpson',
        email: 'not-an-email',
        password: 'Password123!',
        confirmedPassword: 'Password123!',
    });
    
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page.locator('#registerEmailError')).toBeVisible();
    await expect(page.locator('#registerEmailError')).toHaveText('Must be a valid email address (max 254 characters)');
    await expect(page).toHaveURL(/\/(login|register)$/);
    });
    
    test('shows validation error when passwords do not match', async ({ page }) => {
    await goToRegisterTab(page);
    await fillRegistrationForm(page, {
        firstName: 'John',
        secondName: 'Simpson',
        email: `mismatch_${Date.now()}@gmail.com`,
        password: 'Password123!',
        confirmedPassword: 'Different123!',
    });
    
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page.locator('#registerConfirmPasswordError')).toBeVisible();
    await expect(page.locator('#registerConfirmPasswordError')).toHaveText('Passwords do not match');
    await expect(page).toHaveURL(/\/(login|register)$/);
    });
    
    test('shows required field validation on blur for empty inputs', async ({ page }) => {
    await goToRegisterTab(page);
    await page.getByRole('textbox', { name: 'First Name:' }).click();
    await page.getByRole('textbox', { name: 'First Name:' }).press('Tab');
    
    await page.getByRole('textbox', { name: 'Email:' }).click();
    await page.getByRole('textbox', { name: 'Email:' }).press('Tab');
    
    await expect(page.locator('#registerFirstNameError')).toBeVisible();
    await expect(page.locator('#registerFirstNameError')).toHaveText('First name is required');
    await expect(page.locator('#registerEmailError')).toBeVisible();
    await expect(page.locator('#registerEmailError')).toHaveText('Email is required');
    });
    
    test('shows an error when trying to register an already registered user', async ({ page }) => {
    await goToRegisterTab(page);
    await fillRegistrationForm(page, {
        firstName: 'David',
        secondName: 'Test',
        email: 'david@test.com',
        password: 'Password123!',
        confirmedPassword: 'Password123!',
    });
    
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/An error occurred during registration|Registration failed/i);
    await expect(page).toHaveURL(/\/(login|register)$/);
    });
    
    test('shows an error for invalid login credentials', async ({ page }) => {
    await page.goto(registerPageUrl);
    await fillLoginForm(page, {
        email: 'david@test.com',
        password: 'WrongPassword123!',
    });
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(/Login failed|An error occurred during login/i);
    await expect(page).toHaveURL(/\/login$/);
    });
    
    test('honours allowed redirect after login', async ({ page }) => {
    await page.goto('http://localhost:3001/login?redirect=http://localhost:3001/profile');
    await fillLoginForm(page, {
        email: 'david@test.com',
        password: 'Password123!',
    });
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    await expect(page).toHaveURL(/\/profile$/);
    });
    
    test('blocks external redirect after login and falls back to home', async ({ page }) => {
    await page.goto('http://localhost:3001/login?redirect=http://malicious.example');
    await fillLoginForm(page, {
        email: 'david@test.com',
        password: 'Password123!',
    });
    
    await page.getByRole('button', { name: 'Submit' }).click();
    
    await expect(page).toHaveURL(/\/home$/);
    });
    
    test('logs out authenticated user and returns to login page', async ({ page }) => {
    await page.goto(registerPageUrl);
    await fillLoginForm(page, {
        email: 'david@test.com',
        password: 'Password123!',
    });
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page).toHaveURL(/\/home$/);
    
    await page.getByRole('link', { name: 'Logout' }).click();
    
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    });
    
    test('redirects unauthenticated users from profile to login', async ({ page }) => {
    await page.goto('http://localhost:3001/profile');
    
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    });
});