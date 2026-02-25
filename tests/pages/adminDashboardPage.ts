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

	async expectHeadingVisible(): Promise<boolean> {
		return this.heading.isVisible();
	}

	async expectAdminDetailsVisible(): Promise<boolean> {
		return this.adminDetails.isVisible();
	}

	async expectActionsVisible(): Promise<boolean> {
		const viewAllRolesVisible = await this.viewAllRolesLink.isVisible();
		const createNewJobRoleVisible = await this.createNewJobRoleLink.isVisible();
		return viewAllRolesVisible && createNewJobRoleVisible;
	}

	async clickViewAllRoles(): Promise<void> {
		await this.viewAllRolesLink.click();
	}

	async clickCreateNewJobRole(): Promise<void> {
		await this.createNewJobRoleLink.click();
	}
}
