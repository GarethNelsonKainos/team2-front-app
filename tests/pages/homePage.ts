import { expect, type Locator, type Page } from "@playwright/test";

export class HomePage {
	expectAdminDashboardAccessDenied() {
		throw new Error("Method not implemented.");
	}

	private readonly welcomeHeading: Locator;
	private readonly logoutLink: Locator;
	private readonly adminDashboardLink: Locator;
	private readonly viewAllRolesLink: Locator;
	private readonly userProfileLink: Locator;
	private readonly userApplicationsTable: Locator;
	private readonly userApplicationsLink: Locator;

	constructor(private readonly page: Page) {
		this.welcomeHeading = this.page.getByRole("heading", {
			name: /Welcome, .+!/,
		});
		this.logoutLink = this.page.getByRole("link", { name: "Logout" });
		this.adminDashboardLink = this.page.getByRole("link", {
			name: "Admin Dashboard",
		});
		this.viewAllRolesLink = this.page.getByRole("link", {
			name: "View All Roles",
		});
		this.userProfileLink = this.page
			.getByRole("link")
			.filter({ hasText: /^$/ });
		this.userApplicationsTable = this.page.getByText(
			"My Recent Applications View",
		);
		this.userApplicationsLink = this.page.getByRole("link", {
			name: "View All Applications",
		});
	}

	async isWelcomeHeadingText(name: string): Promise<boolean> {
		const text = await this.welcomeHeading.textContent();
		return text === `Welcome, ${name}!`;
	}

	async isWelcomeHeadingVisible(): Promise<boolean> {
		return await this.welcomeHeading.isVisible();
	}

	async isLogoutLinkVisible(): Promise<boolean> {
		return await this.logoutLink.isVisible();
	}

	async isAdminDashboardLinkVisible(): Promise<boolean> {
		return await this.adminDashboardLink.isVisible();
	}

	async isAdminDashboardLinkNotVisible(): Promise<boolean> {
		return !(await this.adminDashboardLink.isVisible());
	}

	async isViewAllRolesLinkVisible(): Promise<boolean> {
		return await this.viewAllRolesLink.isVisible();
	}

	async isUserProfileLinkVisible(): Promise<boolean> {
		return await this.userProfileLink.isVisible();
	}

	async isUserApplicationsVisible(): Promise<boolean> {
		return await this.userApplicationsTable.isVisible();
	}

	async Logout(): Promise<void> {
		await this.logoutLink.click();
	}

	async gotoAdminDashboard(): Promise<void> {
		await this.adminDashboardLink.click();
	}

	async goToAllJobRoles(): Promise<void> {
		await this.viewAllRolesLink.click();
	}

	async gotoUserProfile(): Promise<void> {
		await this.userProfileLink.click();
	}

	async gotoUserApplications(): Promise<void> {
		await this.userApplicationsLink.click();
	}
}
