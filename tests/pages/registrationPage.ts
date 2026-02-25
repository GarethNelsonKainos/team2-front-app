import { expect, type Locator, type Page } from "@playwright/test";

export type RegistrationData = {
	firstName: string;
	secondName: string;
	email: string;
	password: string;
	confirmedPassword: string;
};

export class RegistrationPage {
	private readonly registerTab: Locator;
	private readonly firstNameInput: Locator;
	private readonly surnameInput: Locator;
	private readonly emailInput: Locator;
	private readonly passwordInput: Locator;
	private readonly confirmPasswordInput: Locator;
	private readonly registerButton: Locator;
	private readonly registerEmailError: Locator;
	private readonly registerConfirmPasswordError: Locator;
	private readonly registerFirstNameError: Locator;
	private readonly registrationAlert: Locator;

	constructor(private readonly page: Page) {
		this.registerTab = this.page.getByRole("tab", { name: "Register" });
		this.firstNameInput = this.page.getByRole("textbox", {
			name: "First Name:",
		});
		this.surnameInput = this.page.getByRole("textbox", { name: "Surname:" });
		this.emailInput = this.page.getByRole("textbox", { name: "Email:" });
		this.passwordInput = this.page.getByRole("textbox", {
			name: "Password:",
			exact: true,
		});
		this.confirmPasswordInput = this.page.getByRole("textbox", {
			name: "Confirm Password:",
		});
		this.registerButton = this.page.getByRole("button", { name: "Register" });
		this.registerEmailError = this.page.locator("#registerEmailError");
		this.registerConfirmPasswordError = this.page.locator(
			"#registerConfirmPasswordError",
		);
		this.registerFirstNameError = this.page.locator("#registerFirstNameError");
		this.registrationAlert = this.page.getByRole("alert");
	}

	async gotoRegisterTab() {
		await this.page.goto("/login");
		await this.registerTab.click();
	}

	async fillRegistrationForm(data: RegistrationData) {
		await this.firstNameInput.fill(data.firstName);
		await this.surnameInput.fill(data.secondName);
		await this.emailInput.fill(data.email);
		await this.passwordInput.fill(data.password);
		await this.confirmPasswordInput.fill(data.confirmedPassword);
	}

	async submitRegistration() {
		await this.registerButton.click();
	}

	async blurEmptyRegisterRequiredFields() {
		await this.firstNameInput.click();
		await this.firstNameInput.press("Tab");

		await this.emailInput.click();
		await this.emailInput.press("Tab");
	}

	async expectEmailError(message: string) {
		await expect(this.registerEmailError).toBeVisible();
		await expect(this.registerEmailError).toHaveText(message);
	}

	async expectConfirmPasswordError(message: string) {
		await expect(this.registerConfirmPasswordError).toBeVisible();
		await expect(this.registerConfirmPasswordError).toHaveText(message);
	}

	async expectFirstNameError(message: string) {
		await expect(this.registerFirstNameError).toBeVisible();
		await expect(this.registerFirstNameError).toHaveText(message);
	}

	async expectRegistrationAlertContains(message: RegExp) {
		await expect(this.registrationAlert).toBeVisible();
		await expect(this.registrationAlert).toContainText(message);
	}

	async expectToBeOnHomePage() {
		await expect(this.page).toHaveURL(/\/home$/);
	}

	async expectToStayOnLoginOrRegister() {
		await expect(this.page).toHaveURL(/\/(login|register)$/);
	}
}
