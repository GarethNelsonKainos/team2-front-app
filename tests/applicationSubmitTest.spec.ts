import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/homePage";
import { JobRolePage } from "./pages/jobRolePage";
import { AuthPage } from "./pages/authPage";
import { ApplicationPage } from "./pages/applicationPage";

test.describe("Application Submission", () => {
	test.beforeEach(async ({ page }) => {
		const email = process.env.PLAYWRIGHT_USER_USERNAME || "";
		const password = process.env.PLAYWRIGHT_USER_PASSWORD || "";
		const authPage = new AuthPage(page);
		await authPage.gotoLogin();
		await authPage.fillLoginForm({
			email: email,
			password: password,
		});
		await authPage.submitLogin();
		await page.waitForLoadState("networkidle");
	});

	test("User can apply for a role and view their application", async ({
		page,
	}) => {
		await test.step("User navigates to job role and applies", async () => {
			const homePage = new HomePage(page);
			const applicationPage = new ApplicationPage(page);
			await page.goto("/home");
			await page.waitForLoadState("networkidle");
			await homePage.gotoUserApplications();
			await expect
				.poll(() => applicationPage.checkMyRecentApplications())
				.toBe(true);
		});

		await test.step("User will login and create an application then view it", async () => {
			const homePage = new HomePage(page);
			const applicationPage = new ApplicationPage(page);
			const jobRolePage = new JobRolePage(page);
			await page.goto("/home");
			await page.waitForLoadState("networkidle");
			await homePage.goToAllJobRoles();
			await jobRolePage.openJobRole();
			await applicationPage.applyForRole();
			await applicationPage.populateApplicationForm();

			await expect
				.poll(() => applicationPage.checkApplicationSubmitted())
				.toBe(true);
		});

		await test.step("User will login and view their applications and verify that the application they just submitted exists", async () => {
			const homePage = new HomePage(page);
			const applicationPage = new ApplicationPage(page);
			await page.goto("/home");
			await page.waitForLoadState("networkidle");
			await homePage.gotoUserApplications();
			await expect
				.poll(() => applicationPage.checkMyRecentApplicationExists())
				.toBe(true);
		});
	});
});
