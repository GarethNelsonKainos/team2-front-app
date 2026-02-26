import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";
import { RegistrationPage } from "../pages/registrationPage";

const { Given, When, Then } = createBdd();

const registrationPassword =
	process.env.PLAYWRIGHT_USER_PASSWORD || "Password123!";

let expectedFullName = "";

Given("I am on the registration page", async ({ page }) => {
	await new RegistrationPage(page).gotoRegisterTab();
});

When("I submit valid registration details", async ({ page }) => {
	const registrationPage = new RegistrationPage(page);
	const firstName = "John";
	const secondName = "Simpson";
	const uniqueEmail = `cucumber_${Date.now()}@gmail.com`;

	expectedFullName = `${firstName} ${secondName}`;

	await registrationPage.fillRegistrationForm({
		firstName,
		secondName,
		email: uniqueEmail,
		password: registrationPassword,
		confirmedPassword: registrationPassword,
	});
	await registrationPage.submitRegistration();
});

Then("I should see successful registration", async ({ page }) => {
	const homePage = new HomePage(page);
	await expect.poll(() => homePage.isWelcomeHeadingVisible()).toBe(true);
	await expect
		.poll(() => homePage.isWelcomeHeadingText(expectedFullName))
		.toBe(true);
});

Then("I should be redirected to the home page", async ({ page }) => {
	await expect(page).toHaveURL(/\/home$/);
});

Then("I should be logged in", async ({ page }) => {
	const homePage = new HomePage(page);
	await expect.poll(() => homePage.isLogoutLinkVisible()).toBe(true);
});
