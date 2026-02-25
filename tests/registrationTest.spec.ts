import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import { RegistrationPage } from "./pages/registrationPage";

const userFullName = process.env.PLAYWRIGHT_USER_FULLNAME || "";
const userPasswordForTesting = process.env.PLAYWRIGHT_USER_PASSWORD || "";
const userEmailForTesting = process.env.PLAYWRIGHT_USER_USERNAME || "";
const incorrectUserPasswordForTesting =
	process.env.PLAYWRIGHT_USER_INCORRECT_PASSWORD || "";
const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";


test.describe("User Authentication", () => {
	test("user authentication end-to-end journey", async ({ page }) => {

		const uniqueEmail = `jsimpson_${Date.now()}@gmail.com`;
		const registrationPage = new RegistrationPage(page);
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);

		await test.step("registers a new user successfully", async () => {
			await registrationPage.gotoRegisterTab();
			await registrationPage.fillRegistrationForm({
				firstName: "John",
				secondName: "Simpson",
				email: uniqueEmail,
				password: userPasswordForTesting,
				confirmedPassword: userPasswordForTesting,
			});
			await registrationPage.submitRegistration();

			await expect.poll(() => registrationPage.isOnHomePage()).toBe(true);
			await homePage.isWelcomeHeadingText(`John Simpson`);
		});

		await test.step("logs out newly registered user", async () => {
			await homePage.Logout();
			await expect(page).toHaveURL(/\/login$/);
			await authPage.isLoginHeadingVisible();
		});

		await test.step("shows validation error for invalid email during registration", async () => {
			await registrationPage.gotoRegisterTab();
			await registrationPage.fillRegistrationForm({
				firstName: "John",
				secondName: "Simpson",
				email: "not-an-email",
				password: userPasswordForTesting,
				confirmedPassword: userPasswordForTesting,
			});

			await registrationPage.submitRegistration();

			await expect
				.poll(() =>
					registrationPage.hasEmailError(
						"Must be a valid email address (max 254 characters)",
					),
				)
				.toBe(true);
			await expect
				.poll(() => registrationPage.isOnLoginOrRegister())
				.toBe(true);
		});

		await test.step("shows validation error when passwords do not match", async () => {
			await registrationPage.gotoRegisterTab();
			await registrationPage.fillRegistrationForm({
				firstName: "John",
				secondName: "Simpson",
				email: `mismatch_${Date.now()}@gmail.com`,
				password: userPasswordForTesting,
				confirmedPassword: incorrectUserPasswordForTesting,
			});

			await registrationPage.submitRegistration();

			await expect
				.poll(() =>
					registrationPage.hasConfirmPasswordError("Passwords do not match"),
				)
				.toBe(true);
			await expect
				.poll(() => registrationPage.isOnLoginOrRegister())
				.toBe(true);
		});

		await test.step("shows required field validation on blur for empty inputs", async () => {
			await registrationPage.gotoRegisterTab();
			await registrationPage.blurEmptyRegisterRequiredFields();

			await expect
				.poll(() =>
					registrationPage.hasFirstNameError("First name is required"),
				)
				.toBe(true);
			await expect
				.poll(() => registrationPage.hasEmailError("Email is required"))
				.toBe(true);
		});

		await test.step("shows an error when trying to register an already registered user", async () => {
			await registrationPage.gotoRegisterTab();
			await registrationPage.fillRegistrationForm({
				firstName: "David",
				secondName: "Test",
				email: userEmailForTesting,
				password: userPasswordForTesting,
				confirmedPassword: userPasswordForTesting,
			});

			await registrationPage.submitRegistration();

			await expect
				.poll(() =>
					registrationPage.hasRegistrationAlertContaining(
						/An error occurred during registration|Registration failed/i,
					),
				)
				.toBe(true);
			await expect
				.poll(() => registrationPage.isOnLoginOrRegister())
				.toBe(true);
		});

		await test.step("shows an error for invalid login credentials", async () => {
			await authPage.gotoLogin();
			await authPage.fillLoginForm({
				email: userEmailForTesting,
				password: incorrectUserPasswordForTesting,
			});
			await authPage.submitLogin();

			await authPage.isLoginErrorMessageVisible();
			await expect(page).toHaveURL(/\/login$/);
		});

		await test.step("honours allowed redirect after login", async () => {
			await authPage.gotoLogin();
			await authPage.fillLoginForm({
				email: userEmailForTesting,
				password: userPasswordForTesting,
			});
			await authPage.submitLogin();
			expect(await homePage.isWelcomeHeadingText(userFullName)).toBe(true);
		});

		await test.step("logs out authenticated user and returns to login page", async () => {
			await page.goto(`${baseUrl}/home`);
			await homePage.Logout();
			await authPage.isLoginHeadingVisible();
		});

		await test.step("redirects unauthenticated users from profile to login", async () => {
			await authPage.gotoLogin();
			await authPage.isLoginHeadingVisible();
			await page.goto(`${baseUrl}/profile`);
			await authPage.isLoginHeadingVisible();
		});
	});
});
