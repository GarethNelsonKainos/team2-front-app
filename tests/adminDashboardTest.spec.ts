import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
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
		await expect(
			page.getByRole("heading", { name: "Admin Dashboard" }),
		).toBeVisible();
	});

	test("displays admin details", async ({ page }) => {
		await expect(
			page.locator("div").filter({ hasText: "Admin: " }).nth(2),
		).toBeVisible();
	});

	test("displays admin actions", async ({ page }) => {
		await expect(
			page.locator("div").filter({ hasText: "View All Roles" }).nth(2),
		).toBeVisible();
		await expect(
			page.locator("div").filter({ hasText: "Create New Job Role" }).nth(2),
		).toBeVisible();
	});
});
