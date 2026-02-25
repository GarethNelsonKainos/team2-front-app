import type { Locator, Page } from "@playwright/test";

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

	private static normalizeText(text: string | null): string {
		return (text ?? "").trim();
	}

	private async isVisibleWithExactText(
		locator: Locator,
		message: string,
	): Promise<boolean> {
		if (!(await locator.isVisible())) {
			return false;
		}

		const text = await locator.textContent();
		return RegistrationPage.normalizeText(text) === message;
	}

	async hasEmailError(message: string): Promise<boolean> {
		return this.isVisibleWithExactText(this.registerEmailError, message);
	}

	async hasConfirmPasswordError(message: string): Promise<boolean> {
		return this.isVisibleWithExactText(
			this.registerConfirmPasswordError,
			message,
		);
	}

	async hasFirstNameError(message: string): Promise<boolean> {
		return this.isVisibleWithExactText(this.registerFirstNameError, message);
	}

	async hasRegistrationAlertContaining(message: RegExp): Promise<boolean> {
		if (!(await this.registrationAlert.isVisible())) {
			return false;
		}

		const alertText = await this.registrationAlert.textContent();
		return message.test(RegistrationPage.normalizeText(alertText));
	}

	async isOnHomePage(): Promise<boolean> {
		return /\/home$/.test(this.page.url());
	}

	async isOnLoginOrRegister(): Promise<boolean> {
		return /\/(login|register)$/.test(this.page.url());
	}
}
