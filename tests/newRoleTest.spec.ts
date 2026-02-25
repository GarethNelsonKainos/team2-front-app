import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import { NewRolePage } from "./pages/newRolePage";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

test.describe("Add a new job role", () => {
	test.beforeEach(async ({ page }) => {
		const authPage = new AuthPage(page);
		const homePage = new HomePage(page);
		const newRolePage = new NewRolePage(page);

		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: process.env.PLAYWRIGHT_ADMIN_USERNAME || "",
			password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || "",
		});
		await authPage.submitLogin();
		await homePage.adminDashboardLink().click();
		await newRolePage.navigateToCreateNewRole();
		await page.waitForLoadState("networkidle");
	});

	test("admin can add a new job role", async ({ page }) => {
		const newRolePage = new NewRolePage(page);
		const uniqueRole = `Test Role ${Date.now()}`;

		await test.step("form is visible and empty", async () => {
			expect.soft(await newRolePage.expectHeadingVisible()).toBe(true);
			expect.soft(await newRolePage.expectFormFieldsVisible()).toBe(true);
			expect.soft(await newRolePage.expectConfirmButtonVisible()).toBe(true);
			expect.soft(await newRolePage.expectFormEmpty()).toBe(true);
		});

		await test.step("submit with invalid data shows validation errors", async () => {
			expect(await newRolePage.expectErrorsOnEmptySubmit()).toBe(true);
		});

		await test.step("submit with valid data adds new role and navigates to /job-roles", async () => {
			await newRolePage.fillForm({
				roleName: uniqueRole,
				description: "Test Description",
				responsibilities: "Test Responsibilities",
				sharePointLink: "https://example.sharepoint.com",
				closingDate: "4567-03-12",
				numberOfOpenPositions: "5",
				location: "Belfast",
				bandId: process.env.PLAYWRIGHT_BAND_ID || "",
				capabilityId: process.env.PLAYWRIGHT_CAPABILITY_ID || "",
			});
			await newRolePage.submitForm();

			await page.waitForLoadState("networkidle");
			expect(page.url()).toMatch(/\/job-roles$/);
			expect(await newRolePage.expectLastRowToHaveRole(uniqueRole)).toBe(true);
		});
	});
});
