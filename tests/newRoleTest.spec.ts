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

	test("displays the add job role form", async ({ page }) => {
		const newRolePage = new NewRolePage(page);

		await expect.poll(() => newRolePage.expectHeadingVisible()).toBe(true);
		await expect.poll(() => newRolePage.expectFormFieldsVisible()).toBe(true);
		await expect
			.poll(() => newRolePage.expectConfirmButtonVisible())
			.toBe(true);
	});

	test("contains blank form fields", async ({ page }) => {
		const newRolePage = new NewRolePage(page);

		await expect.poll(() => newRolePage.expectFormEmpty()).toBe(true);
	});

	test("adds new role and navigates to /job-roles on valid data submit", async ({
		page,
	}) => {
		const newRolePage = new NewRolePage(page);

		await page.goto("/job-roles");
		const beforeCount = await newRolePage.getRowsCount();

		await page.goto("/new-role");
		await newRolePage.fillForm({
			roleName: "Test Role",
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
		const afterCount = await newRolePage.getRowsCount();
		await expect(afterCount).toBe(beforeCount + 1);

		await expect
			.poll(() => newRolePage.expectLastRowToHaveRole("Test Role"))
			.toBe(true);
	});

	test("shows validation error when required fields are missing", async ({
		page,
	}) => {
		const newRolePage = new NewRolePage(page);

		await newRolePage.submitForm();
		await expect.poll(() => newRolePage.expectErrorsOnEmptySubmit()).toBe(true);
	});
});
