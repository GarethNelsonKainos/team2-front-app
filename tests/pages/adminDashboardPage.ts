import { expect, type Locator, type Page } from "@playwright/test";

export class AdminDashboardPage {
	private readonly heading: Locator;
	private readonly adminDetails: Locator;
	private readonly viewAllRolesLink: Locator;
	private readonly createNewJobRoleLink: Locator;

	constructor(private readonly page: Page) {
		this.heading = this.page.getByRole("heading", { name: "Admin Dashboard" });
		this.adminDetails = this.page
			.locator("div")
			.filter({ hasText: "Admin: " })
			.nth(2);
		this.viewAllRolesLink = this.page
			.locator("div")
			.filter({ hasText: "View All Roles" })
			.nth(2);
		this.createNewJobRoleLink = this.page
			.locator("div")
			.filter({ hasText: "Create New Job Role" })
			.nth(2);
	}

	async expectHeadingVisible(): Promise<void> {
		await expect(this.heading).toBeVisible();
	}

	async expectAdminDetailsVisible(): Promise<void> {
		await expect(this.adminDetails).toBeVisible();
	}

	async expectActionsVisible(): Promise<void> {
		await expect(this.viewAllRolesLink).toBeVisible();
		await expect(this.createNewJobRoleLink).toBeVisible();
	}

	async clickViewAllRoles(): Promise<void> {
		await this.viewAllRolesLink.click();
	}

	async clickCreateNewJobRole(): Promise<void> {
		await this.createNewJobRoleLink.click();
	}
}
