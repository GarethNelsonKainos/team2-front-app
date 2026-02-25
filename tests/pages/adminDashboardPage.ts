import type { Locator, Page } from "@playwright/test";

export class AdminDashboardPage {
	constructor(private readonly page: Page) {}

	heading(): Locator {
		return this.page.getByRole("heading", { name: "Admin Dashboard" });
	}

	adminDetails(): Locator {
		return this.page.locator("div").filter({ hasText: "Admin: " }).nth(2);
	}

	viewAllRolesLink(): Locator {
		return this.page
			.locator("div")
			.filter({ hasText: "View All Roles" })
			.nth(2);
	}

	createNewJobRoleLink(): Locator {
		return this.page
			.locator("div")
			.filter({ hasText: "Create New Job Role" })
			.nth(2);
	}
}
