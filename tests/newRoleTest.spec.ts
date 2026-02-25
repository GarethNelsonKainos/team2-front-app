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
			email: process.env.PLAYWRIGHT_ADMIN_USERNAME || "admin@test.com",
			password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || "Password123!",
		});
		await authPage.submitLogin();
		await homePage.adminDashboardLink().click();
		await newRolePage.createNewJobRoleLink().click();
		await page.waitForLoadState("networkidle");
	});

	test("displays the add job role form", async ({ page }) => {
		const newRolePage = new NewRolePage(page);

		await expect(newRolePage.roleNameInput()).toBeVisible();
		await expect(newRolePage.descriptionInput()).toBeVisible();
		await expect(newRolePage.responsibilitiesInput()).toBeVisible();
		await expect(newRolePage.sharePointLinkInput()).toBeVisible();
		await expect(newRolePage.closingDateInput()).toBeVisible();
		await expect(newRolePage.numberOfOpenPositionsInput()).toBeVisible();
		await expect(newRolePage.locationInput()).toBeVisible();
		await expect(newRolePage.bandSelect()).toBeVisible();
		await expect(newRolePage.capabilitySelect()).toBeVisible();
	});

	test("contains blank form fields", async ({ page }) => {
		const newRolePage = new NewRolePage(page);

		await expect(newRolePage.roleNameInput()).toHaveValue("");
		await expect(newRolePage.descriptionInput()).toHaveValue("");
		await expect(newRolePage.responsibilitiesInput()).toHaveValue("");
		await expect(newRolePage.sharePointLinkInput()).toHaveValue("");
		await expect(newRolePage.closingDateInput()).toHaveValue("");
		await expect(newRolePage.numberOfOpenPositionsInput()).toHaveValue("");
		await expect(newRolePage.locationInput()).toHaveValue("");
		await expect(newRolePage.bandSelect()).toHaveValue("");
		await expect(newRolePage.capabilitySelect()).toHaveValue("");
	});

	test("adds new role and navigates to /job-roles on valid data submit", async ({
		page,
	}) => {
		const newRolePage = new NewRolePage(page);

		await page.goto("/job-roles");
		const rows = newRolePage.jobRoleRows();
		const beforeCount = await rows.count();

		await page.goto("/new-role");
		await newRolePage.fillForm({
			roleName: "Test Role",
			description: "Test Description",
			responsibilities: "Test Responsibilities",
			sharePointLink: "https://example.sharepoint.com",
			closingDate: "4567-03-12",
			numberOfOpenPositions: "5",
			location: "Belfast",
			bandId: "4a535fab-694b-42a4-ac71-c70f1b927785",
			capabilityId: "aa47edf4-af6f-4287-84d3-118d011b8324",
		});
		await newRolePage.confirmButton().click();

		await page.waitForLoadState("networkidle");
		await expect(rows).toHaveCount(beforeCount + 1);

		await expect(newRolePage.lastRowRoleCell("Test Role")).toBeVisible();
		await expect(newRolePage.lastRowLocationCell("Belfast")).toBeVisible();
		await expect(newRolePage.lastRowLocationCell("Architecture")).toBeVisible();
		await expect(newRolePage.lastRowLocationCell("Apprentice")).toBeVisible();
		await expect(newRolePage.lastRowRoleCell("12/03/4567")).toBeVisible();
		await expect(newRolePage.lastRowDeleteButton("Test Role")).toBeVisible();
		await expect(newRolePage.lastRowEditButton()).toBeVisible();
	});

	test("shows validation error when required fields are missing", async ({
		page,
	}) => {
		const newRolePage = new NewRolePage(page);

		await newRolePage.confirmButton().click();

		await expect(newRolePage.roleNameRequiredError()).toBeVisible();
		await expect(newRolePage.jobSpecSummaryRequiredError()).toBeVisible();
	});
});
