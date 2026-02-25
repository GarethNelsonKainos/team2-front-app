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
			email: process.env.PLAYWRIGHT_ADMIN_USERNAME || "admin@test.com",
			password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || "Password123!",
		});
		await authPage.submitLogin();
		await homePage.adminDashboardLink().click();
	});

	test("displays admin dashboard heading", async ({ page }) => {
		const adminDashboardPage = new AdminDashboardPage(page);

		await expect(adminDashboardPage.heading()).toBeVisible();
	});

	test("displays admin details", async ({ page }) => {
		const adminDashboardPage = new AdminDashboardPage(page);

		await expect(adminDashboardPage.adminDetails()).toBeVisible();
	});

	test("displays admin actions", async ({ page }) => {
		const adminDashboardPage = new AdminDashboardPage(page);

		await expect(adminDashboardPage.viewAllRolesLink()).toBeVisible();
		await expect(adminDashboardPage.createNewJobRoleLink()).toBeVisible();
	});
});
