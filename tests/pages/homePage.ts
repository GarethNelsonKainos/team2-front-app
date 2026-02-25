import { expect, type Locator, type Page } from "@playwright/test";

export class HomePage {
	constructor(private readonly page: Page) {}

	welcomeHeading(name: string): Locator {
		return this.page.getByRole("heading", { name: `Welcome, ${name}!` });
	}

	async expectWelcomeHeadingVisible(name: string) {
		await expect(this.welcomeHeading(name)).toBeVisible();
	}

	logoutLink(): Locator {
		return this.page.getByRole("link", { name: "Logout" });
	}

	adminDashboardLink(): Locator {
		return this.page.getByRole("link", { name: "Admin Dashboard" });
	}

	gotoAllJobroles(): Promise<void> {
		return this.page.getByRole("link", { name: "View All Roles" }).click();
	}
}
