import { createBdd } from "playwright-bdd";
import { env } from "process";
import { AuthPage } from "../pages/authPage";
import { AdminDashboardPage } from "../pages/adminDashboardPage";
import { JobRolePage } from "../pages/jobRolePage";
import { expect } from "@playwright/test";
import dotenv from "dotenv";
import { HomePage } from "../pages/homePage";

dotenv.config({ path: ".env" });

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
    await adminDashboardPage.expectAdminDetailsVisible();
    await adminDashboardPage.expectHeadingVisible();
});

Then("I should see a link to view all roles", async ({ page }) => {
    const adminDashboardPage = new AdminDashboardPage(page);
    await adminDashboardPage.expectActionsVisible();
});

When("I click on the link to view all roles", async ({ page }) => {
    const adminDashboardPage = new AdminDashboardPage(page);
    await adminDashboardPage.clickViewAllRoles();
});

Then("I should redirect to the job roles page", async ({ page }) => {
    await expect(page).toHaveURL(/\/job-roles$/);
});