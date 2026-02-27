import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import { AdminDashboardPage } from "./pages/adminDashboardPage";
import Dotenv from "dotenv";
import { JobRolePage } from "./pages/jobRolePage";
import { ProfilePage } from "./pages/profilePage";

Dotenv.config({ path: ".env" });
const env = process.env;

test.describe("Login and View All Roles", () => {
	const admin = env.PLAYWRIGHT_ADMIN_USERNAME || "";
	const adminPassword = env.PLAYWRIGHT_ADMIN_PASSWORD || "";
	const user = env.PLAYWRIGHT_USER_USERNAME || "";
	const userPassword = env.PLAYWRIGHT_USER_PASSWORD || "";
	const userFullName = env.PLAYWRIGHT_USER_FULLNAME || "";

	test("Admin can log in", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: admin,
			password: adminPassword,
		});
		await authPage.submitLogin();
		expect(await homePage.isAdminDashboardLinkVisible()).toBe(true);
	});

	test("Admin can view admin dashboard", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: admin,
			password: adminPassword,
		});
		await authPage.submitLogin();
		await homePage.gotoAdminDashboard();
		const adminDashboardPage = new AdminDashboardPage(page);
		await adminDashboardPage.expectHeadingVisible();
		await adminDashboardPage.expectAdminDetailsVisible();
		await adminDashboardPage.expectActionsVisible();
	});

	test("User can log in", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword,
		});
		await authPage.submitLogin();
		expect(await homePage.isWelcomeHeadingText(userFullName)).toBe(true);
	});

	test("User can view profile page", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword,
		});
		await authPage.submitLogin();
		await homePage.gotoUserProfile();
		const profilePage = new ProfilePage(page);
		expect(await profilePage.isProfileHeadingVisible()).toBe(true);
		expect(await profilePage.isFullNameVisible(userFullName)).toBe(true);
		expect(await profilePage.isEmailVisible(user)).toBe(true);
		expect(await profilePage.isEmailTextCorrect(user)).toBe(true);
		expect(await profilePage.isUserApplicationsVisible()).toBe(true);
		expect(await profilePage.isHomeLinkVisible()).toBe(true);
	});

	test("User can view all roles", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword,
		});
		await authPage.submitLogin();
		await homePage.goToAllJobRoles();
		const jobRolePage = new JobRolePage(page);
		await jobRolePage.checkJobRole("Test Role");
	});

	test("User can log out", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword,
		});
		await authPage.submitLogin();
		expect(await homePage.isLogoutLinkVisible()).toBe(true);
		await homePage.Logout();
		expect(await authPage.isLoginHeadingVisible()).toBe(true);
		expect(await authPage.isEmailInputVisible()).toBe(true);
		expect(await authPage.isPasswordInputVisible()).toBe(true);
		expect(await authPage.isSubmitButtonVisible()).toBe(true);
	});

	test("User can cancel login", async ({ page }) => {
		const authPage = new AuthPage(page);
		await authPage.gotoLogin();
		await authPage.cancelLogin();
		await expect(page).toHaveURL("/");
	});

	test("User cannot log in with invalid credentials", async ({ page }) => {
		const authPage = new AuthPage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: "invalid@example.com",
			password: "invalidpassword",
		});
		await authPage.submitLogin();
		expect(await authPage.isLoginErrorMessageVisible()).toBe(true);
	});

	test("User cannot log in with empty fields", async ({ page }) => {
		const authPage = new AuthPage(page);
		await authPage.gotoLogin();
		await authPage.submitLogin();
		await authPage.submitLogin();
		expect(await authPage.isEmailRequiredVisible()).toBe(true);
	});

	test("User cannot log in with empty email", async ({ page }) => {
		const authPage = new AuthPage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: "",
			password: userPassword,
		});
		await authPage.submitLogin();
		expect(await authPage.isEmailRequiredVisible()).toBe(true);
	});

	test("User cannot log in with empty password", async ({ page }) => {
		const authPage = new AuthPage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: "",
		});
		await authPage.submitLogin();
		expect(await authPage.isPasswordRequiredVisible()).toBe(true);
	});

	test("User cannot access admin dashboard", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword,
		});
		await authPage.submitLogin();
		expect(await homePage.isAdminDashboardLinkVisible()).toBe(false);
	});

	test("User can see recent applications on home page", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword,
		});
		await authPage.submitLogin();
		expect(await homePage.isUserApplicationsVisible()).toBe(true);
	});

	test("User can navigate to all applications from home page", async ({
		page,
	}) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		const profilePage = new ProfilePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword,
		});
		await authPage.submitLogin();
		await homePage.gotoUserApplications();
		await expect(page).toHaveURL("/profile");
		expect(await profilePage.isUserApplicationsVisible()).toBe(true);
		expect(await profilePage.isProfileHeadingVisible()).toBe(true);
		expect(await profilePage.isFullNameVisible(userFullName)).toBe(true);
	});
});
