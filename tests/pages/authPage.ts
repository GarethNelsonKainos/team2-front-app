import { expect, type Locator, type Page } from "@playwright/test";

export type RegistrationData = {
	firstName: string;
	secondName: string;
	email: string;
	password: string;
	confirmedPassword: string;
};

export type LoginData = {
	email: string;
	password: string;
};

export class AuthPage {
	private readonly registerTab: Locator;
	private readonly firstNameInput: Locator;
	private readonly surnameInput: Locator;
	private readonly emailInput: Locator;
	private readonly passwordInput: Locator;
	private readonly confirmPasswordInput: Locator;
	private readonly registerButton: Locator;
	private readonly loginButton: Locator;
	private readonly alertMessage: Locator;

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
		this.loginButton = this.page.getByRole("button", { name: "Submit" });
		this.alertMessage = this.page.getByRole("alert");
	}

	async gotoLogin(redirect?: string) {
		const url = redirect
			? `http://localhost:3001/login?redirect=${encodeURIComponent(redirect)}`
			: "http://localhost:3001/login";

		await this.page.goto(url);
	}

	async gotoRegisterTab() {
		await this.gotoLogin();
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

	async fillLoginForm(data: LoginData) {
		await this.emailInput.fill(data.email);
		await this.passwordInput.fill(data.password);
	}

	async submitLogin() {
		await this.loginButton.click();
	}

	alert(): Locator {
		return this.alertMessage;
	}

	registerEmailError(): Locator {
		return this.page.locator("#registerEmailError");
	}

	registerConfirmPasswordError(): Locator {
		return this.page.locator("#registerConfirmPasswordError");
	}

	registerFirstNameError(): Locator {
		return this.page.locator("#registerFirstNameError");
	}

	loginSubmitButton(): Locator {
		return this.loginButton;
	}

	async expectAlertContains(message: RegExp) {
		await expect(this.alertMessage).toBeVisible();
		await expect(this.alertMessage).toContainText(message);
	}

	async expectLoginSubmitVisible() {
		await expect(this.loginButton).toBeVisible();
	}
}
