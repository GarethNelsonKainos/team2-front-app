import { expect, type Locator, type Page } from "@playwright/test";

export class AdminDashboardPage {
	constructor(private readonly page: Page) {}

	async expectHeadingVisible(): Promise<void> {
		await expect(this.heading()).toBeVisible();
	}

	async expectAdminDetailsVisible(): Promise<void> {
		await expect(this.adminDetails()).toBeVisible();
	}

	async expectActionsVisible(): Promise<void> {
		await expect(this.viewAllRolesLink()).toBeVisible();
		await expect(this.createNewJobRoleLink()).toBeVisible();
	}

	async clickViewAllRoles(): Promise<void> {
		await this.viewAllRolesLink().click();
	}

	async clickCreateNewJobRole(): Promise<void> {
		await this.createNewJobRoleLink().click();
	}

	private heading(): Locator {
		return this.page.getByRole("heading", { name: "Admin Dashboard" });
	}

	private adminDetails(): Locator {
		return this.page.locator("div").filter({ hasText: "Admin: " }).nth(2);
	}

	private viewAllRolesLink(): Locator {
		return this.page
			.locator("div")
			.filter({ hasText: "View All Roles" })
			.nth(2);
	}

	private createNewJobRoleLink(): Locator {
		return this.page
			.locator("div")
			.filter({ hasText: "Create New Job Role" })
			.nth(2);
	}
}
