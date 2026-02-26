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
	});

	test("User will login and press view my applications then verify that the page exists", async ({
		page,
	}) => {
		const homePage = new HomePage(page);
		const applicationPage = new ApplicationPage(page);
		await homePage.gotoUserApplications();
		await applicationPage.checkMyRecentApplications();
	});

	test("User will login and create and application then view it", async ({
		page,
	}) => {
		const homePage = new HomePage(page);
		const applicationPage = new ApplicationPage(page);
		const jobRolePage = new JobRolePage(page);
		await homePage.goToAllJobRoles();
		await jobRolePage.openJobRole();
		await applicationPage.applyForRole();
		await applicationPage.populateApplicationForm();

		await expect
			.poll(() => applicationPage.checkApplicationSubmitted())
			.toBe(true);
	});

	test("User will login and view their applications and verify that the application they just submitted exists", async ({
		page,
	}) => {
		const homePage = new HomePage(page);
		const applicationPage = new ApplicationPage(page);
		await homePage.gotoUserApplications();
		await expect
			.poll(() => applicationPage.checkMyRecentApplicationExists())
			.toBe(true);
	});
});
