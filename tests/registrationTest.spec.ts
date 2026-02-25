import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import { RegistrationPage } from "./pages/registrationPage";

const userPasswordForTesting = process.env.USER_PASSWORD_FOR_TESTING;
const incorrectUserPasswordForTesting = process.env.INCORRECT_USER_PASSWORD_FOR_TESTING;

if (!userPasswordForTesting) {
	throw new Error("USER_PASSWORD_FOR_TESTING is not set");
}

if (!incorrectUserPasswordForTesting) {
	throw new Error("INCORRECT_USER_PASSWORD_FOR_TESTING is not set");
}

test.describe("User Authentication", () => {
	test("registers a new user successfully", async ({ page }) => {
		const uniqueEmail = `jsimpson_${Date.now()}@gmail.com`;
		const registrationPage = new RegistrationPage(page);
		const homePage = new HomePage(page);

		await registrationPage.gotoRegisterTab();
		await registrationPage.fillRegistrationForm({
			firstName: "John",
			secondName: "Simpson",
			email: uniqueEmail,
			password: userPasswordForTesting,
			confirmedPassword: userPasswordForTesting,
		});
		await registrationPage.submitRegistration();

		await expect(page).toHaveURL(/\/home$/);
		await expect(homePage.welcomeHeading("John Simpson")).toBeVisible();
	});

	test("shows validation error for invalid email during registration", async ({
		page,
	}) => {
		const registrationPage = new RegistrationPage(page);

		await registrationPage.gotoRegisterTab();
		await registrationPage.fillRegistrationForm({
			firstName: "John",
			secondName: "Simpson",
			email: "not-an-email",
			password: userPasswordForTesting,
			confirmedPassword: userPasswordForTesting,
		});

		await registrationPage.submitRegistration();

		await expect(registrationPage.registerEmailError()).toBeVisible();
		await expect(registrationPage.registerEmailError()).toHaveText(
			"Must be a valid email address (max 254 characters)",
		);
		await expect(page).toHaveURL(/\/(login|register)$/);
	});

	test("shows validation error when passwords do not match", async ({
		page,
	}) => {
		const registrationPage = new RegistrationPage(page);

		await registrationPage.gotoRegisterTab();
		await registrationPage.fillRegistrationForm({
			firstName: "John",
			secondName: "Simpson",
			email: `mismatch_${Date.now()}@gmail.com`,
			password: userPasswordForTesting,
			confirmedPassword: incorrectUserPasswordForTesting,
		});

		await registrationPage.submitRegistration();

		await expect(registrationPage.registerConfirmPasswordError()).toBeVisible();
		await expect(registrationPage.registerConfirmPasswordError()).toHaveText(
			"Passwords do not match",
		);
		await expect(page).toHaveURL(/\/(login|register)$/);
	});

	test("shows required field validation on blur for empty inputs", async ({
		page,
	}) => {
		const registrationPage = new RegistrationPage(page);

		await registrationPage.gotoRegisterTab();
		await registrationPage.blurEmptyRegisterRequiredFields();

		await expect(registrationPage.registerFirstNameError()).toBeVisible();
		await expect(registrationPage.registerFirstNameError()).toHaveText(
			"First name is required",
		);
		await expect(registrationPage.registerEmailError()).toBeVisible();
		await expect(registrationPage.registerEmailError()).toHaveText(
			"Email is required",
		);
	});

	test("shows an error when trying to register an already registered user", async ({
		page,
	}) => {
		const registrationPage = new RegistrationPage(page);

		await registrationPage.gotoRegisterTab();
		await registrationPage.fillRegistrationForm({
			firstName: "David",
			secondName: "Test",
			email: "david@test.com",
			password: "Password123!",
			confirmedPassword: "Password123!",
		});

		await registrationPage.submitRegistration();

		await expect(registrationPage.alert()).toBeVisible();
		await expect(registrationPage.alert()).toContainText(
			/An error occurred during registration|Registration failed/i,
		);
		await expect(page).toHaveURL(/\/(login|register)$/);
	});

	test("shows an error for invalid login credentials", async ({ page }) => {
		const authPage = new AuthPage(page);

		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: "david@test.com",
			password: "WrongPassword123!",
		});

		await authPage.submitLogin();

		await expect(authPage.alert()).toBeVisible();
		await expect(authPage.alert()).toContainText(
			/Login failed|An error occurred during login/i,
		);
		await expect(page).toHaveURL(/\/login$/);
	});

	test("honours allowed redirect after login", async ({ page }) => {
		const authPage = new AuthPage(page);

		await authPage.gotoLogin("http://localhost:3001/profile");
		await authPage.fillLoginForm({
			email: "david@test.com",
			password: "Password123!",
		});

		await authPage.submitLogin();

		await expect(page).toHaveURL(/\/profile$/);
	});

	test("blocks external redirect after login and falls back to home", async ({
		page,
	}) => {
		const authPage = new AuthPage(page);

		await authPage.gotoLogin("http://malicious.example");
		await authPage.fillLoginForm({
			email: "david@test.com",
			password: "Password123!",
		});

		await authPage.submitLogin();

		await expect(page).toHaveURL(/\/home$/);
	});

	test("logs out authenticated user and returns to login page", async ({
		page,
	}) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);

		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: "david@test.com",
			password: "Password123!",
		});
		await authPage.submitLogin();
		await expect(page).toHaveURL(/\/home$/);

		await homePage.logoutLink().click();

		await expect(page).toHaveURL(/\/login$/);
		await expect(authPage.loginSubmitButton()).toBeVisible();
	});

	test("redirects unauthenticated users from profile to login", async ({
		page,
	}) => {
		const authPage = new AuthPage(page);

		await page.goto("http://localhost:3001/profile");

		await expect(page).toHaveURL(/\/login$/);
		await expect(authPage.loginSubmitButton()).toBeVisible();
	});
});
