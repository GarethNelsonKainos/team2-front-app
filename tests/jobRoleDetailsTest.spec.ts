import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/homePage";
import { JobRolePage } from "./pages/jobRolePage";

test.describe("Job Role Details Page", () => {
	const jobTitle = "Software Engineer";

	test("displays complete job role details and can navigate back", async ({
		page,
	}) => {
		const homePage = new HomePage(page);
		const jobRolePage = new JobRolePage(page);

		// Navigate to job role
		await page.goto("http://localhost:3001/");
		await homePage.gotoAllJobroles();
		await jobRolePage.openJobRole(jobTitle);

		// Verify all details in one flow
		await jobRolePage.heading(jobTitle);
		await jobRolePage.description(jobTitle);
		await jobRolePage.responsibilities();
		await jobRolePage.closing();
		await jobRolePage.status();
		await jobRolePage.positions();
		await jobRolePage.location();
		await jobRolePage.band();
		await jobRolePage.capability();

		// Navigate back
		await jobRolePage.goBack();
		await page.waitForURL(/\/job-roles/);
	});
});
