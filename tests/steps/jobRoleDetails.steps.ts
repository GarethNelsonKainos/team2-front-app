import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";
import { JobRolePage } from "../pages/jobRolePage";

const { Given, When, Then } = createBdd();

Given("I am on the home page", async ({ page }) => {
	await page.goto("http://localhost:3001/");
});

When("I open all job roles", async ({ page }) => {
	await new HomePage(page).goToAllJobRoles();
});

When("I open a job role", async ({ page }) => {
	await new JobRolePage(page).openJobRole();
});

Then("I should see complete job role details", async ({ page }) => {
	const role = new JobRolePage(page);
	expect(await role.heading()).toBe(true);
	expect(await role.description()).toBe(true);
	expect(await role.responsibilities()).toBe(true);
	expect(await role.closing()).toBe(true);
	expect(await role.status()).toBe(true);
	expect(await role.positions()).toBe(true);
	expect(await role.location()).toBe(true);
	expect(await role.band()).toBe(true);
	expect(await role.capability()).toBe(true);
});

When("I go back to the job roles list", async ({ page }) => {
	await new JobRolePage(page).goBack();
});

Then("I should be on the job roles page", async ({ page }) => {
	await page.waitForURL(/\/job-roles/);
});
