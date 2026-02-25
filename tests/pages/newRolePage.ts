import type { Locator, Page } from "@playwright/test";

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

	createNewJobRoleLink(): Locator {
		return this.page.getByRole("link", { name: "Create New Job Role" });
	}

	roleNameInput(): Locator {
		return this.page.getByRole("textbox", { name: "Job role name" });
	}

	descriptionInput(): Locator {
		return this.page.locator("#description");
	}

	responsibilitiesInput(): Locator {
		return this.page.locator("#responsibilities");
	}

	sharePointLinkInput(): Locator {
		return this.page.getByRole("textbox", { name: "SharePoint link" });
	}

	closingDateInput(): Locator {
		return this.page.locator("#closingDate");
	}

	numberOfOpenPositionsInput(): Locator {
		return this.page.locator("#numberOfOpenPositions");
	}

	locationInput(): Locator {
		return this.page.locator("#location");
	}

	bandSelect(): Locator {
		return this.page.locator("#bandId");
	}

	capabilitySelect(): Locator {
		return this.page.locator("#capabilityId");
	}

	confirmButton(): Locator {
		return this.page.getByRole("button", { name: "Confirm" });
	}

	jobRoleRows(): Locator {
		return this.page.locator("table tbody tr");
	}

	lastRowRoleCell(name: string): Locator {
		return this.jobRoleRows().last().getByRole("cell", { name, exact: true });
	}

	lastRowLocationCell(name: string): Locator {
		return this.jobRoleRows().last().getByRole("cell", { name });
	}

	lastRowDeleteButton(name: string): Locator {
		return this.jobRoleRows()
			.last()
			.getByRole("button", { name: `Delete ${name}` });
	}

	lastRowEditButton(): Locator {
		return this.jobRoleRows().last().locator(".d-flex > .btn.kainos-blue");
	}

	roleNameRequiredError(): Locator {
		return this.page.getByText("Role name is required");
	}

	jobSpecSummaryRequiredError(): Locator {
		return this.page.getByText("Job spec summary is required");
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
}
