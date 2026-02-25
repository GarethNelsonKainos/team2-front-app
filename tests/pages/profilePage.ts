import type { Locator, Page } from "@playwright/test";

export class ProfilePage {
	private readonly profileHeading: Locator;
	private readonly userApplications: Locator;
	private readonly homeLink: Locator;

	constructor(private readonly page: Page) {
		this.profileHeading = this.page.getByRole("heading", {
			name: "My Profile",
		});
		this.userApplications = this.page.getByText("My Recent Applications");
		this.homeLink = this.page.getByRole("link", { name: "Home" });
	}

	async isProfileHeadingVisible(): Promise<boolean> {
		return await this.profileHeading.isVisible();
	}

	async isFullNameVisible(fullName: string): Promise<boolean> {
		const fullNameLocator = this.page.getByText(`User: ${fullName}`);
		return await fullNameLocator.isVisible();
	}

	async isEmailVisible(email: string): Promise<boolean> {
		const emailLocator = this.page.getByText(`Email: ${email}`);
		return await emailLocator.isVisible();
	}

	async isEmailTextCorrect(email: string): Promise<boolean> {
		const emailLocator = this.page.getByText(`Email: ${email}`);
		const text = await emailLocator.textContent();
		return text === `Email: ${email}`;
	}

	async isUserApplicationsVisible(): Promise<boolean> {
		return await this.userApplications.isVisible();
	}

	async isHomeLinkVisible(): Promise<boolean> {
		return await this.homeLink.isVisible();
	}
}
