import { test, expect } from "@playwright/test";

import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
test.describe("Login and View All Roles", () => {
	test("Admin can log in", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: "lauren@test.com",
			password: "Password123!",
		});
		await authPage.submitLogin();
		await expect(homePage.adminDashboardLink()).toBeVisible();
	});

	test("User can log in", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: "sam@test.com",
			password: "Password123!",
		});
		await authPage.submitLogin();
		await expect(homePage.welcomeHeading("Sam Tougher")).toBeVisible();
	});

	test("User can view all roles", async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: "sam@test.com",
			password: "Password123!",
		});
		await authPage.submitLogin();
		await page.getByRole("link", { name: "View All Roles" }).click();
		// Check that the last row in the table contains the expected job role name
		const rows = await page.locator("table tbody tr");
		const rowCount = await rows.count();
		const lastRow = rows.nth(rowCount - 1);
		await expect(
			lastRow.getByRole("cell", { name: "Test Role" }),
		).toBeVisible();
	});
});
