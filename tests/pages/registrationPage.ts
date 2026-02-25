import type { Locator, Page } from "@playwright/test";

export type RegistrationData = {
	firstName: string;
	secondName: string;
	email: string;
	password: string;
	confirmedPassword: string;
};

export class RegistrationPage {
	readonly registerTab: Locator;

	constructor(private readonly page: Page) {
		this.registerTab = this.page.getByRole("tab", { name: "Register" });
	}

	async gotoRegisterTab() {
		await this.page.goto("/login");
		await this.registerTab.click();
	}

	async fillRegistrationForm(data: RegistrationData) {
		await this.page
			.getByRole("textbox", { name: "First Name:" })
			.fill(data.firstName);
		await this.page
			.getByRole("textbox", { name: "Surname:" })
			.fill(data.secondName);
		await this.page.getByRole("textbox", { name: "Email:" }).fill(data.email);
		await this.page
			.getByRole("textbox", { name: "Password:", exact: true })
			.fill(data.password);
		await this.page
			.getByRole("textbox", { name: "Confirm Password:" })
			.fill(data.confirmedPassword);
	}

	async submitRegistration() {
		await this.page.getByRole("button", { name: "Register" }).click();
	}

	async blurEmptyRegisterRequiredFields() {
		await this.page.getByRole("textbox", { name: "First Name:" }).click();
		await this.page.getByRole("textbox", { name: "First Name:" }).press("Tab");

		await this.page.getByRole("textbox", { name: "Email:" }).click();
		await this.page.getByRole("textbox", { name: "Email:" }).press("Tab");
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

	alert(): Locator {
		return this.page.getByRole("alert");
	}
}
