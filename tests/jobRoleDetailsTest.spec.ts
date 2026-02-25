import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/homePage";
import { JobRolePage } from "./pages/jobRolePage";

test.describe("Job Role Details Page", () => {
	test("displays complete job role details and can navigate back", async ({
		page,
	}) => {
		const homePage = new HomePage(page);
		const jobRolePage = new JobRolePage(page);

		// Navigate to job role
		await page.goto("http://localhost:3001/");
		await homePage.goToAllJobRoles();
		await jobRolePage.openJobRole();

		// Verify all details in one flow
		expect(await jobRolePage.heading()).toBe(true);
		expect(await jobRolePage.description()).toBe(true);
		expect(await jobRolePage.responsibilities()).toBe(true);
		expect(await jobRolePage.closing()).toBe(true);
		expect(await jobRolePage.status()).toBe(true);
		expect(await jobRolePage.positions()).toBe(true);
		expect(await jobRolePage.location()).toBe(true);
		expect(await jobRolePage.band()).toBe(true);
		expect(await jobRolePage.capability()).toBe(true);

		// Navigate back
		await jobRolePage.goBack();
		await page.waitForURL(/\/job-roles/);
	});
});
