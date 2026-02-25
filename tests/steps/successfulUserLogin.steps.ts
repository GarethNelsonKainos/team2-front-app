import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";
import { AuthPage } from "../pages/authPage";

const { Given, When, Then } = createBdd();

const userPasswordForTesting =
    process.env.PLAYWRIGHT_USER_PASSWORD || "Password123!";
const userEmailForTesting =
    process.env.PLAYWRIGHT_USER_USERNAME || "";
const userFullName =
    process.env.PLAYWRIGHT_USER_FULLNAME || "Test User";



Given("that i am on the home page", async ({ page }) => {
    const homePage = new HomePage(page);
    await page.goto("/");
});

When("i click the login button", async ({ page }) => {
    const authPage = new AuthPage(page);
    await authPage.gotoLogin();
});

Then("I should be redirected to login page", async ({ page }) => {
    const authPage = new AuthPage(page);
    await expect(page).toHaveURL(/\/login$/);
    await authPage.isLoginHeadingVisible();
});

When("i submit valid login credentials", async ({ page }) => {
    const authPage = new AuthPage(page);
        await authPage.fillLoginForm({
            email: userEmailForTesting,
            password: userPasswordForTesting,
        });
        await authPage.submitLogin();
});

Then("I should be redirected to home page", async ({ page }) => {
    const homePage = new HomePage(page);
    await expect(page).toHaveURL(/\/home$/);
    await homePage.isWelcomeHeadingText(userFullName);
});

Then("I should be logged in and see my name on the homepage", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.isWelcomeHeadingText(userFullName);
});

Then("I can see the profile link", async ({ page }) => {
    const homePage = new HomePage(page);
    await expect.poll(() => homePage.isUserProfileLinkVisible()).toBe(true);
});

Then("I can see my recent applications", async ({ page }) => {
    const homePage = new HomePage(page);
    await expect.poll(() => homePage.isUserApplicationsVisible()).toBe(true);
});

Then("I should see the logout link", async ({ page }) => {
    const homePage = new HomePage(page);
    await expect.poll(() => homePage.isLogoutLinkVisible()).toBe(true);
});

Then("I should be able to log out", async ({ page }) => {
    const homePage = new HomePage(page);
    const authPage = new AuthPage(page);
    await homePage.Logout();
    await authPage.isLoginHeadingVisible();
});



    