import type { Locator, Page } from "@playwright/test";

export class HomePage {
	constructor(private readonly page: Page) {}

	welcomeHeading(name: string): Locator {
		return this.page.getByRole("heading", { name: `Welcome, ${name}!` });
	}

	logoutLink(): Locator {
		return this.page.getByRole("link", { name: "Logout" });
	}

	adminDashboardLink(): Locator {
		return this.page.getByRole("link", { name: "Admin Dashboard" });
	}
}
