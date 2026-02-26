import { createBdd } from "playwright-bdd";
import { env } from "process";
import { AuthPage } from "../pages/authPage";
import { AdminDashboardPage } from "../pages/adminDashboardPage";
import { expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";

const { Given, When, Then } = createBdd();

const adminUsername = env.PLAYWRIGHT_ADMIN_USERNAME || "";
const adminPassword = env.PLAYWRIGHT_ADMIN_PASSWORD || "";

Given("I am logged in as an admin", async ({ page }) => {
	const authPage = new AuthPage(page);
	await authPage.gotoLogin();
	await authPage.fillLoginForm({
		email: adminUsername,
		password: adminPassword,
	});
	await authPage.submitLogin();
});

When("I navigate to the admin dashboard", async ({ page }) => {
	const homePage = new HomePage(page);
	await homePage.gotoAdminDashboard();
	const adminDashboardPage = new AdminDashboardPage(page);
	await expect.poll(() => adminDashboardPage.expectAdminDetailsVisible()).toBe(true);
	await expect.poll(() => adminDashboardPage.expectHeadingVisible()).toBe(true);
});

Then("I should see links to view all roles and create a new role", async ({ page }) => {
	const adminDashboardPage = new AdminDashboardPage(page);
	await expect.poll(() => adminDashboardPage.expectActionsVisible()).toBe(true);
});

When("I click on the link to view all roles", async ({ page }) => {
	const adminDashboardPage = new AdminDashboardPage(page);
	await adminDashboardPage.clickViewAllRoles();
});

Then("I should redirect to the job roles page", async ({ page }) => {
	await expect(page).toHaveURL(/\/job-roles$/);
});
