import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/homePage";
import { JobRolePage } from "./pages/jobRolePage";

test.describe("Job Role Details Page", () => {
	const jobTitle = "Software Engineer";
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
		await jobRolePage.heading(jobTitle);
	});

	test("displays job description", async ({ page }) => {
		await jobRolePage.description(jobTitle);
		await jobRolePage.responsibilities();
	});

	test("displays job metadata", async ({ page }) => {
		await jobRolePage.closing();
		await jobRolePage.status();
	});

	test("displays job specifications", async ({ page }) => {
		await jobRolePage.positions();
		await jobRolePage.location();
		await jobRolePage.band();
		await jobRolePage.capability();
	});

	test("can navigate back to roles list", async ({ page }) => {
		await jobRolePage.goBack();
		await page.waitForURL(/\/job-roles/);
	});
});
