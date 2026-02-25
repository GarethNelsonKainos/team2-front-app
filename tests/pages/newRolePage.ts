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

	async expectFormEmpty(): Promise<boolean> {
		const roleNameEmpty = (await this.roleNameInput.inputValue()) === "";
		const descriptionEmpty = (await this.descriptionInput.inputValue()) === "";
		const responsibilitiesEmpty =
			(await this.responsibilitiesInput.inputValue()) === "";
		const sharePointLinkEmpty =
			(await this.sharePointLinkInput.inputValue()) === "";
		const closingDateEmpty = (await this.closingDateInput.inputValue()) === "";
		const numberOfOpenPositionsEmpty =
			(await this.numberOfOpenPositionsInput.inputValue()) === "";
		const locationEmpty = (await this.locationInput.inputValue()) === "";
		const bandEmpty = (await this.bandSelect.inputValue()) === "";
		const capabilityEmpty = (await this.capabilitySelect.inputValue()) === "";

		return (
			roleNameEmpty &&
			descriptionEmpty &&
			responsibilitiesEmpty &&
			sharePointLinkEmpty &&
			closingDateEmpty &&
			numberOfOpenPositionsEmpty &&
			locationEmpty &&
			bandEmpty &&
			capabilityEmpty
		);
	}

	async expectLastRowToHaveRole(name: string): Promise<boolean> {
		const roleCellVisible = await this.lastRowRoleCell(name).isVisible();
		const locationCellVisible =
			await this.lastRowLocationCell("Belfast").isVisible();
		const architectureCellVisible =
			await this.lastRowLocationCell("Architecture").isVisible();
		const apprenticeCellVisible =
			await this.lastRowLocationCell("Apprentice").isVisible();
		const closingDateCellVisible =
			await this.lastRowRoleCell("12/03/4567").isVisible();
		const deleteButtonVisible =
			await this.lastRowDeleteButton(name).isVisible();
		const editButtonVisible = await this.lastRowEditButton().isVisible();

		return (
			roleCellVisible &&
			locationCellVisible &&
			architectureCellVisible &&
			apprenticeCellVisible &&
			closingDateCellVisible &&
			deleteButtonVisible &&
			editButtonVisible
		);
	}

	async expectErrorsOnEmptySubmit(): Promise<boolean> {
		await this.confirmButton.click();
		const roleNameErrorVisible = await this.roleNameRequiredError.isVisible();
		const jobSpecSummaryErrorVisible =
			await this.jobSpecSummaryRequiredError.isVisible();
		const sharepointLinkErrorVisible =
			await this.sharepointLinkRequiredError.isVisible();
		const closingDateErrorVisible =
			await this.closingDateRequiredError.isVisible();
		const numberOfOpenPositionsErrorVisible =
			await this.numberOfOpenPositionsRequiredError.isVisible();
		const locationErrorVisible = await this.locationRequiredError.isVisible();
		const bandErrorVisible = await this.bandRequiredError.isVisible();
		const capabilityErrorVisible =
			await this.capabilityRequiredError.isVisible();

		return (
			roleNameErrorVisible &&
			jobSpecSummaryErrorVisible &&
			sharepointLinkErrorVisible &&
			closingDateErrorVisible &&
			numberOfOpenPositionsErrorVisible &&
			locationErrorVisible &&
			bandErrorVisible &&
			capabilityErrorVisible
		);
	}

	async expectHeadingVisible(): Promise<boolean> {
		return this.page.getByRole("heading", { name: "Add New Role" }).isVisible();
	}

	async expectFormFieldsVisible(): Promise<boolean> {
		const roleNameVisible = await this.roleNameInput.isVisible();
		const descriptionVisible = await this.descriptionInput.isVisible();
		const responsibilitiesVisible =
			await this.responsibilitiesInput.isVisible();
		const sharePointLinkVisible = await this.sharePointLinkInput.isVisible();
		const closingDateVisible = await this.closingDateInput.isVisible();
		const numberOfOpenPositionsVisible =
			await this.numberOfOpenPositionsInput.isVisible();
		const locationVisible = await this.locationInput.isVisible();
		const bandSelectVisible = await this.bandSelect.isVisible();
		const capabilitySelectVisible = await this.capabilitySelect.isVisible();

		return (
			roleNameVisible &&
			descriptionVisible &&
			responsibilitiesVisible &&
			sharePointLinkVisible &&
			closingDateVisible &&
			numberOfOpenPositionsVisible &&
			locationVisible &&
			bandSelectVisible &&
			capabilitySelectVisible
		);
	}

	async expectConfirmButtonVisible(): Promise<boolean> {
		return this.confirmButton.isVisible();
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
