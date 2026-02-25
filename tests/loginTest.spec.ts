import { test, expect } from "@playwright/test"; 
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import { AdminDashboardPage } from "./pages/adminDashboardPage";
import Dotenv from "dotenv";
import { JobRolePage } from "./pages/jobRolePage";

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
			password: adminPassword
		});
		await authPage.submitLogin();
		await expect(homePage.adminDashboardLink()).toBeVisible();
	});

	test("User can log in", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword
		});
		await authPage.submitLogin();
		await expect(homePage.welcomeHeading(userFullName)).toBeVisible();
	});

	test("User can view all roles", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: user,
			password: userPassword
		});
		await authPage.submitLogin();
		await homePage.gotoAllJobroles();
		const jobRolePage = new JobRolePage(page);
		await jobRolePage.checkJobRole("Test Role");
	});
});
