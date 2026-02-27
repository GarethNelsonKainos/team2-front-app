import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import { AdminDashboardPage } from "./pages/adminDashboardPage";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

test.describe("Admin Dashboard Page", () => {
	test.beforeEach(async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);

		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: process.env.PLAYWRIGHT_ADMIN_USERNAME || "",
			password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || "",
		});
		await authPage.submitLogin();
		await homePage.gotoAdminDashboard();
	});

	test("displays admin dashboard", async ({ page }) => {
		const adminDashboardPage = new AdminDashboardPage(page);
		await expect
			.poll(() => adminDashboardPage.expectHeadingVisible())
			.toBe(true);
		await expect
			.poll(() => adminDashboardPage.expectAdminDetailsVisible())
			.toBe(true);
		await expect
			.poll(() => adminDashboardPage.expectActionsVisible())
			.toBe(true);
	});

	test("navigates to view all roles page on link click", async ({ page }) => {
		const adminDashboardPage = new AdminDashboardPage(page);
		await adminDashboardPage.clickViewAllRoles();
		await expect(page).toHaveURL(/\/job-roles$/);
	});

	test("navigates to create new job role page on link click", async ({
		page,
	}) => {
		const adminDashboardPage = new AdminDashboardPage(page);
		await adminDashboardPage.clickCreateNewJobRole();
		await expect(page).toHaveURL(/\/new-role/);
	});
});
