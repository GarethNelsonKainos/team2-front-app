import type { Locator, Page } from "@playwright/test";

export class JobRolePage {
	constructor(private readonly page: Page) {}

	openJobRole(jobTitle: string): Promise<void> {
		return this.page
			.getByRole("row", { name: `${jobTitle}` })
			.getByRole("link")
			.click();
	}

	checkJobRole(jobTitle: string,): Locator {
		return this.page
		.getByRole("row", { name: `${jobTitle}` })
		.getByRole("link")
	}

	heading(jobTitle: string): Locator {
		return this.page.getByRole("heading", { name: jobTitle, exact: true });
	}

	description(jobTitle: string): Locator {
		return this.page
			.getByRole("paragraph")
			.getByText(new RegExp(`${jobTitle}`));
	}

	responsibilities(): Locator {
		return this.page.getByText("Design, develop, and maintain");
	}

	closing(): Locator {
		return this.page.getByText(/Closing/);
	}

	status(): Locator {
		return this.page.getByText(/Status/);
	}

	positions(): Locator {
		return this.page.getByText(/Positions/);
	}

	location(): Locator {
		return this.page.getByText(/Location/);
	}

	band(): Locator {
		return this.page.getByText(/Band/);
	}

	capability(): Locator {
		return this.page.getByText(/Capability/);
	}

	goBack(): Promise<void> {
		return this.page.getByRole("link", { name: "Back" }).click();
	}
}
