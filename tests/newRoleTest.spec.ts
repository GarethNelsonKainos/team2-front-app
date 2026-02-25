import { test, expect } from "@playwright/test";
import { AuthPage } from "./pages/authPage";
import { HomePage } from "./pages/homePage";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

test.describe("Add a new job role", () => {
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
		await page.getByRole("link", { name: "Create New Job Role" }).click();
		await page.waitForLoadState("networkidle");
	});

	test("displays the add job role form", async ({ page }) => {
		await expect(
			page.getByRole("textbox", { name: "Job role name" }),
		).toBeVisible();
		await expect(page.locator("#description")).toBeVisible();
		await expect(page.locator("#responsibilities")).toBeVisible();
		await expect(
			page.getByRole("textbox", { name: "SharePoint link" }),
		).toBeVisible();
		await expect(page.locator("#closingDate")).toBeVisible();
		await expect(page.locator("#numberOfOpenPositions")).toBeVisible();
		await expect(page.locator("#location")).toBeVisible();
		await expect(page.locator("#bandId")).toBeVisible();
		await expect(page.locator("#capabilityId")).toBeVisible();
	});

	test("contains blank form fields", async ({ page }) => {
		await expect(
			page.getByRole("textbox", { name: "Job role name" }),
		).toHaveValue("");
		await expect(page.locator("#description")).toHaveValue("");
		await expect(page.locator("#responsibilities")).toHaveValue("");
		await expect(
			page.getByRole("textbox", { name: "SharePoint link" }),
		).toHaveValue("");
		await expect(page.locator("#closingDate")).toHaveValue("");
		await expect(page.locator("#numberOfOpenPositions")).toHaveValue("");
		await expect(page.locator("#location")).toHaveValue("");
		await expect(page.locator("#bandId")).toHaveValue("");
		await expect(page.locator("#capabilityId")).toHaveValue("");
	});

	test("adds new role and navigates to /job-roles on valid data submit", async ({
		page,
	}) => {
		await page.goto("/job-roles");
		const rows = page.locator("table tbody tr");
		const beforeCount = await rows.count();

		await page.goto("/new-role");
		await page
			.getByRole("textbox", { name: "Job role name" })
			.fill("Test Role");
		await page.locator("#description").fill("Test Description");
		await page.locator("#responsibilities").fill("Test Responsibilities");
		await page
			.getByRole("textbox", { name: "SharePoint link" })
			.fill("https://example.sharepoint.com");
		await page.locator("#closingDate").fill("4567-03-12");
		await page.locator("#numberOfOpenPositions").fill("5");
		await page.locator("#location").fill("Belfast");
		await page
			.locator("#bandId")
			.selectOption("4a535fab-694b-42a4-ac71-c70f1b927785");
		await page
			.locator("#capabilityId")
			.selectOption("aa47edf4-af6f-4287-84d3-118d011b8324");
		await page.getByRole("button", { name: "Confirm" }).click();

		await page.waitForLoadState("networkidle");
		await expect(rows).toHaveCount(beforeCount + 1);
		const lastRow = rows.last();

		await expect(
			lastRow.getByRole("cell", { name: "Test Role", exact: true }),
		).toBeVisible();
		await expect(lastRow.getByRole("cell", { name: "Belfast" })).toBeVisible();
		await expect(
			lastRow.getByRole("cell", { name: "Architecture" }),
		).toBeVisible();
		await expect(
			lastRow.getByRole("cell", { name: "Apprentice" }),
		).toBeVisible();
		await expect(
			lastRow.getByRole("cell", { name: "12/03/4567", exact: true }),
		).toBeVisible();
		await expect(
			lastRow.getByRole("button", { name: "Delete Test Role" }),
		).toBeVisible();
		await expect(lastRow.locator(".d-flex > .btn.kainos-blue")).toBeVisible();
	});

	test("shows validation error when required fields are missing", async ({
		page,
	}) => {
		await page.getByRole("button", { name: "Confirm" }).click();

		await expect(page.getByText("Role name is required")).toBeVisible();
		await expect(page.getByText("Job spec summary is required")).toBeVisible();
	});
});
