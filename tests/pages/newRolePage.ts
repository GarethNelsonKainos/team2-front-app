import { expect, type Locator, type Page } from "@playwright/test";

export type NewRoleFormData = {
	roleName: string;
	description: string;
	responsibilities: string;
	sharePointLink: string;
	closingDate: string;
	numberOfOpenPositions: string;
	location: string;
	bandId: string;
	capabilityId: string;
};

export class NewRolePage {
	constructor(private readonly page: Page) {}

	private createNewJobRoleLink(): Locator {
		return this.page.getByRole("link", { name: "Create New Job Role" });
	}

	private roleNameInput(): Locator {
		return this.page.getByRole("textbox", { name: "Job role name" });
	}

	private descriptionInput(): Locator {
		return this.page.locator("#description");
	}

	private responsibilitiesInput(): Locator {
		return this.page.locator("#responsibilities");
	}

	private sharePointLinkInput(): Locator {
		return this.page.getByRole("textbox", { name: "SharePoint link" });
	}

	private closingDateInput(): Locator {
		return this.page.locator("#closingDate");
	}

	private numberOfOpenPositionsInput(): Locator {
		return this.page.locator("#numberOfOpenPositions");
	}

	private locationInput(): Locator {
		return this.page.locator("#location");
	}

	private bandSelect(): Locator {
		return this.page.locator("#bandId");
	}

	private capabilitySelect(): Locator {
		return this.page.locator("#capabilityId");
	}

	private confirmButton(): Locator {
		return this.page.getByRole("button", { name: "Confirm" });
	}

	private jobRoleRows(): Locator {
		return this.page.locator("table tbody tr");
	}

	private lastRowRoleCell(name: string): Locator {
		return this.jobRoleRows().last().getByRole("cell", { name, exact: true });
	}

	private lastRowLocationCell(name: string): Locator {
		return this.jobRoleRows().last().getByRole("cell", { name });
	}

	private lastRowDeleteButton(name: string): Locator {
		return this.jobRoleRows()
			.last()
			.getByRole("button", { name: `Delete ${name}` });
	}

	private lastRowEditButton(): Locator {
		return this.jobRoleRows().last().locator(".d-flex > .btn.kainos-blue");
	}

	private roleNameRequiredError(): Locator {
		return this.page.getByText("Role name is required");
	}

	private jobSpecSummaryRequiredError(): Locator {
		return this.page.getByText("Job spec summary is required");
	}

	private sharepointLinkRequiredError(): Locator {
		return this.page.getByText("SharePoint link is required");
	}

	private closingDateRequiredError(): Locator {
		return this.page.getByText("Closing date is required");
	}

	private numberOfOpenPositionsRequiredError(): Locator {
		return this.page.getByText("Number of open positions is required");
	}

	private locationRequiredError(): Locator {
		return this.page.getByText("Location is required");
	}

	private bandRequiredError(): Locator {
		return this.page.getByText("Band is required");
	}

	private capabilityRequiredError(): Locator {
		return this.page.getByText("Capability is required");
	}

	async fillForm(data: NewRoleFormData) {
		await this.roleNameInput().fill(data.roleName);
		await this.descriptionInput().fill(data.description);
		await this.responsibilitiesInput().fill(data.responsibilities);
		await this.sharePointLinkInput().fill(data.sharePointLink);
		await this.closingDateInput().fill(data.closingDate);
		await this.numberOfOpenPositionsInput().fill(data.numberOfOpenPositions);
		await this.locationInput().fill(data.location);
		await this.bandSelect().selectOption(data.bandId);
		await this.capabilitySelect().selectOption(data.capabilityId);
	}

	async expectFormEmpty() {
		await expect(this.roleNameInput()).toHaveValue("");
		await expect(this.descriptionInput()).toHaveValue("");
		await expect(this.responsibilitiesInput()).toHaveValue("");
		await expect(this.sharePointLinkInput()).toHaveValue("");
		await expect(this.closingDateInput()).toHaveValue("");
		await expect(this.numberOfOpenPositionsInput()).toHaveValue("");
		await expect(this.locationInput()).toHaveValue("");
		await expect(this.bandSelect()).toHaveValue("");
		await expect(this.capabilitySelect()).toHaveValue("");
	}

	async expectLastRowToHaveRole(name: string) {
		await expect(this.lastRowRoleCell(name)).toBeVisible();
		await expect(this.lastRowLocationCell("Belfast")).toBeVisible();
		await expect(this.lastRowLocationCell("Architecture")).toBeVisible();
		await expect(this.lastRowLocationCell("Apprentice")).toBeVisible();
		await expect(this.lastRowRoleCell("12/03/4567")).toBeVisible();
		await expect(this.lastRowDeleteButton(name)).toBeVisible();
		await expect(this.lastRowEditButton()).toBeVisible();
	}

	async expectErrorsOnEmptySubmit() {
		await this.confirmButton().click();
		await expect(this.roleNameRequiredError()).toBeVisible();
		await expect(this.jobSpecSummaryRequiredError()).toBeVisible();
		await expect(this.sharepointLinkRequiredError()).toBeVisible();
		await expect(this.closingDateRequiredError()).toBeVisible();
		await expect(this.numberOfOpenPositionsRequiredError()).toBeVisible();
		await expect(this.locationRequiredError()).toBeVisible();
		await expect(this.bandRequiredError()).toBeVisible();
		await expect(this.capabilityRequiredError()).toBeVisible();
	}

	async expectHeadingVisible() {
		await expect(
			this.page.getByRole("heading", { name: "Add New Role" }),
		).toBeVisible();
	}

	async expectFormFieldsVisible() {
		await expect(this.roleNameInput()).toBeVisible();
		await expect(this.descriptionInput()).toBeVisible();
		await expect(this.responsibilitiesInput()).toBeVisible();
		await expect(this.sharePointLinkInput()).toBeVisible();
		await expect(this.closingDateInput()).toBeVisible();
		await expect(this.numberOfOpenPositionsInput()).toBeVisible();
		await expect(this.locationInput()).toBeVisible();
		await expect(this.bandSelect()).toBeVisible();
		await expect(this.capabilitySelect()).toBeVisible();
	}

	async expectConfirmButtonVisible() {
		await expect(this.confirmButton()).toBeVisible();
	}

	async getRowsCount() {
		return this.jobRoleRows().count();
	}

	async submitForm() {
		await this.confirmButton().click();
	}

	async navigateToCreateNewRole() {
		await this.createNewJobRoleLink().click();
	}
}
