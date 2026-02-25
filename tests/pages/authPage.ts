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
	private readonly loginTab: Locator;
	private readonly homeLink: Locator;
	private readonly LoginHeading: Locator;
	private readonly emailInput: Locator;
	private readonly passwordInput: Locator;
	private readonly submitButton: Locator;
	private readonly cancelLink: Locator;
	private readonly emailRequired: Locator;
	private readonly passwordRequired: Locator;
	private readonly loginErrorMessage: Locator;

	constructor(private readonly page: Page) {
		this.homeLink = this.page.getByRole("link", { name: "Home" });
		this.registerTab = this.page.getByRole("tab", { name: "Register" });
		this.loginTab = this.page.getByRole("tab", { name: "Log In" });
		this.LoginHeading = this.page.getByText("Log in to an existing account");
		this.emailInput = this.page.getByRole("textbox", { name: "Email:" });
		this.passwordInput = this.page.getByRole("textbox", { name: "Password:" });
		this.submitButton = this.page.getByRole("button", { name: "Submit" });
		this.cancelLink = this.page.getByRole("link", { name: "Cancel" });
		this.emailRequired = this.page.getByText("Email is required");
		this.passwordRequired = this.page.getByText("Password is required");
		this.loginErrorMessage = this.page.getByText("Login failed. Please try");
	}

	async gotoLogin() {
		await this.page.goto("/login");
	}

	async gotoHome() {
		await this.homeLink.click();
	}

	async gotoRegister() {
		await this.registerTab.click();
	}

	async gotoLoginTab() {
		await this.loginTab.click();
	}

	async isLoginHeadingVisible(): Promise<boolean> {
		return await this.LoginHeading.isVisible();
	}

	async isLoginTabVisible(): Promise<boolean> {
		return await this.loginTab.isVisible();
	}

	async isEmailInputVisible(): Promise<boolean> {
		return await this.emailInput.isVisible();
	}

	async isPasswordInputVisible(): Promise<boolean> {
		return await this.passwordInput.isVisible();
	}

	async isSubmitButtonVisible(): Promise<boolean> {
		return await this.submitButton.isVisible();
	}

	async isEmailRequiredVisible(): Promise<boolean> {
		return await this.emailRequired.isVisible();
	}

	async isPasswordRequiredVisible(): Promise<boolean> {
		return await this.passwordRequired.isVisible();
	}

	async isLoginErrorMessageVisible(): Promise<boolean> {
		return await this.loginErrorMessage.isVisible();
	}

	async fillLoginForm(data: LoginData) {
		await this.emailInput.fill(data.email);
		await this.passwordInput.fill(data.password);
	}

	async submitLogin() {
		await this.submitButton.click();
	}

	async cancelLogin(): Promise<void> {
		await this.cancelLink.click();
	}
}
