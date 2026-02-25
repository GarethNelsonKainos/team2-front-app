import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/homePage";
import { JobRolePage } from "./pages/jobRolePage";

test.describe("Job Role Details Page", () => {
	const jobTitle = 'Software Engineer';	
	let homePage: HomePage;
	let jobRolePage: JobRolePage;
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:3001/");
		//locator
		homePage = new HomePage(page);
		jobRolePage = new JobRolePage(page);
		await homePage.gotoAllJobroles();
		await jobRolePage.openJobRole(jobTitle);
	});

	test("displays job title", async ({ page }) => {
		await expect(
			jobRolePage.heading(jobTitle),
		).toBeVisible();
	});

	test("displays job description", async ({ page }) => {
		await expect(jobRolePage.description(jobTitle)).toBeVisible();
		await expect(jobRolePage.responsibilities()).toBeVisible();
	});

	test("displays job metadata", async ({ page }) => {
		await expect(jobRolePage.closing()).toBeVisible();
		await expect(jobRolePage.status()).toBeVisible();
	});

	test("displays job specifications", async ({ page }) => {
		await expect(jobRolePage.positions()).toBeVisible();
		await expect(jobRolePage.location()).toBeVisible();
		await expect(jobRolePage.band()).toBeVisible();
		await expect(jobRolePage.capability()).toBeVisible();
	});

	test("can navigate back to roles list", async ({ page }) => {
		await jobRolePage.goBack();
		await page.waitForURL(/\/job-roles/);
	});
});
