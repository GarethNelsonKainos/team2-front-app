import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import { RegistrationPage } from "./pages/registrationPage";

const userPasswordForTesting = process.env.PLAYWRIGHT_USER_PASSWORD;
const incorrectUserPasswordForTesting =
	process.env.PLAYWRIGHT_USER_INCORRECT_PASSWORD;
const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";

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

		await registrationPage.expectToBeOnHomePage();
		await homePage.expectWelcomeHeadingVisible("John Simpson");
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

		await registrationPage.expectEmailError(
			"Must be a valid email address (max 254 characters)",
		);
		await registrationPage.expectToStayOnLoginOrRegister();
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

		await registrationPage.expectConfirmPasswordError("Passwords do not match");
		await registrationPage.expectToStayOnLoginOrRegister();
	});

	test("shows required field validation on blur for empty inputs", async ({
		page,
	}) => {
		const registrationPage = new RegistrationPage(page);

		await registrationPage.gotoRegisterTab();
		await registrationPage.blurEmptyRegisterRequiredFields();

		await registrationPage.expectFirstNameError("First name is required");
		await registrationPage.expectEmailError("Email is required");
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
			password: userPasswordForTesting,
			confirmedPassword: userPasswordForTesting,
		});

		await registrationPage.submitRegistration();

		await registrationPage.expectRegistrationAlertContains(
			/An error occurred during registration|Registration failed/i,
		);
		await registrationPage.expectToStayOnLoginOrRegister();
	});

	test("shows an error for invalid login credentials", async ({ page }) => {
		const authPage = new AuthPage(page);

		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: "david@test.com",
			password: incorrectUserPasswordForTesting,
		});
		await authPage.submitLogin();

		await authPage.expectAlertContains(
			/Login failed|An error occurred during login/i,
		);
		await expect(page).toHaveURL(/\/login$/);
	});

	test("honours allowed redirect after login", async ({ page }) => {
		const authPage = new AuthPage(page);

		await authPage.gotoLogin(`${baseUrl}/profile`);
		await authPage.fillLoginForm({
			email: "david@test.com",
			password: userPasswordForTesting,
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
			password: userPasswordForTesting,
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
			password: userPasswordForTesting,
		});
		await authPage.submitLogin();
		await expect(page).toHaveURL(/\/home$/);

		await homePage.logoutLink().click();

		await expect(page).toHaveURL(/\/login$/);
		await authPage.expectLoginSubmitVisible();
	});

	test("redirects unauthenticated users from profile to login", async ({
		page,
	}) => {
		const authPage = new AuthPage(page);

		await page.goto(`${baseUrl}/profile`);

		await expect(page).toHaveURL(/\/login$/);
		await authPage.expectLoginSubmitVisible();
	});
});
