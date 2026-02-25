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
	private readonly createNewJobRoleLink: Locator;
	private readonly roleNameInput: Locator;
	private readonly descriptionInput: Locator;
	private readonly responsibilitiesInput: Locator;
	private readonly sharePointLinkInput: Locator;
	private readonly closingDateInput: Locator;
	private readonly numberOfOpenPositionsInput: Locator;
	private readonly locationInput: Locator;
	private readonly bandSelect: Locator;
	private readonly capabilitySelect: Locator;
	private readonly confirmButton: Locator;
	private readonly jobRoleRows: Locator;
	private readonly roleNameRequiredError: Locator;
	private readonly jobSpecSummaryRequiredError: Locator;
	private readonly sharepointLinkRequiredError: Locator;
	private readonly closingDateRequiredError: Locator;
	private readonly numberOfOpenPositionsRequiredError: Locator;
	private readonly locationRequiredError: Locator;
	private readonly bandRequiredError: Locator;
	private readonly capabilityRequiredError: Locator;
	private readonly lastRowRoleCell: (name: string) => Locator;
	private readonly lastRowLocationCell: (name: string) => Locator;
	private readonly lastRowDeleteButton: (name: string) => Locator;
	private readonly lastRowEditButton: () => Locator;

	constructor(private readonly page: Page) {
		this.createNewJobRoleLink = this.page.getByRole("link", {
			name: "Create New Job Role",
		});
		this.roleNameInput = this.page.getByRole("textbox", {
			name: "Job role name",
		});
		this.descriptionInput = this.page.locator("#description");
		this.responsibilitiesInput = this.page.locator("#responsibilities");
		this.sharePointLinkInput = this.page.getByRole("textbox", {
			name: "SharePoint link",
		});
		this.closingDateInput = this.page.locator("#closingDate");
		this.numberOfOpenPositionsInput = this.page.locator(
			"#numberOfOpenPositions",
		);
		this.locationInput = this.page.locator("#location");
		this.bandSelect = this.page.locator("#bandId");
		this.capabilitySelect = this.page.locator("#capabilityId");
		this.confirmButton = this.page.getByRole("button", { name: "Confirm" });
		this.jobRoleRows = this.page.locator("table tbody tr");
		this.roleNameRequiredError = this.page.getByText("Role name is required");
		this.jobSpecSummaryRequiredError = this.page.getByText(
			"Job spec summary is required",
		);
		this.sharepointLinkRequiredError = this.page.getByText(
			"SharePoint link is required",
		);
		this.closingDateRequiredError = this.page.getByText(
			"Closing date is required",
		);
		this.numberOfOpenPositionsRequiredError = this.page.getByText(
			"Number of open positions is required",
		);
		this.locationRequiredError = this.page.getByText("Location is required");
		this.bandRequiredError = this.page.getByText("Band is required");
		this.capabilityRequiredError = this.page.getByText(
			"Capability is required",
		);
		this.lastRowRoleCell = (name: string) =>
			this.jobRoleRows.last().getByRole("cell", { name, exact: true });
		this.lastRowLocationCell = (name: string) =>
			this.jobRoleRows.last().getByRole("cell", { name });
		this.lastRowDeleteButton = (name: string) =>
			this.jobRoleRows.last().getByRole("button", { name: `Delete ${name}` });
		this.lastRowEditButton = () =>
			this.jobRoleRows.last().locator(".d-flex > .btn.kainos-blue");
	}

	async fillForm(data: NewRoleFormData) {
		await this.roleNameInput.fill(data.roleName);
		await this.descriptionInput.fill(data.description);
		await this.responsibilitiesInput.fill(data.responsibilities);
		await this.sharePointLinkInput.fill(data.sharePointLink);
		await this.closingDateInput.fill(data.closingDate);
		await this.numberOfOpenPositionsInput.fill(data.numberOfOpenPositions);
		await this.locationInput.fill(data.location);
		await this.bandSelect.selectOption(data.bandId);
		await this.capabilitySelect.selectOption(data.capabilityId);
	}

	async expectFormEmpty() {
		await expect(this.roleNameInput).toHaveValue("");
		await expect(this.descriptionInput).toHaveValue("");
		await expect(this.responsibilitiesInput).toHaveValue("");
		await expect(this.sharePointLinkInput).toHaveValue("");
		await expect(this.closingDateInput).toHaveValue("");
		await expect(this.numberOfOpenPositionsInput).toHaveValue("");
		await expect(this.locationInput).toHaveValue("");
		await expect(this.bandSelect).toHaveValue("");
		await expect(this.capabilitySelect).toHaveValue("");
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
		await this.confirmButton.click();
		await expect(this.roleNameRequiredError).toBeVisible();
		await expect(this.jobSpecSummaryRequiredError).toBeVisible();
		await expect(this.sharepointLinkRequiredError).toBeVisible();
		await expect(this.closingDateRequiredError).toBeVisible();
		await expect(this.numberOfOpenPositionsRequiredError).toBeVisible();
		await expect(this.locationRequiredError).toBeVisible();
		await expect(this.bandRequiredError).toBeVisible();
		await expect(this.capabilityRequiredError).toBeVisible();
	}

	async expectHeadingVisible() {
		await expect(
			this.page.getByRole("heading", { name: "Add New Role" }),
		).toBeVisible();
	}

	async expectFormFieldsVisible() {
		await expect(this.roleNameInput).toBeVisible();
		await expect(this.descriptionInput).toBeVisible();
		await expect(this.responsibilitiesInput).toBeVisible();
		await expect(this.sharePointLinkInput).toBeVisible();
		await expect(this.closingDateInput).toBeVisible();
		await expect(this.numberOfOpenPositionsInput).toBeVisible();
		await expect(this.locationInput).toBeVisible();
		await expect(this.bandSelect).toBeVisible();
		await expect(this.capabilitySelect).toBeVisible();
	}

	async expectConfirmButtonVisible() {
		await expect(this.confirmButton).toBeVisible();
	}

	async getRowsCount() {
		return this.jobRoleRows.count();
	}

	async submitForm() {
		await this.confirmButton.click();
	}

	async navigateToCreateNewRole() {
		await this.createNewJobRoleLink.click();
	}
}
