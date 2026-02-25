import type { Locator, Page } from "@playwright/test";

export class JobRolePage {
    readonly jobRoleName: string;

    readonly jobroleLink: Locator;
    readonly jobroleHeading: Locator;
    readonly jobroleDescription: Locator;
    readonly jobroleResponsibilities: Locator
    readonly jobroleClosing: Locator;
    readonly jobroleStatus: Locator;
    readonly jobrolePositions: Locator;
    readonly jobroleLocation: Locator;
    readonly jobroleBand: Locator;
    readonly jobroleCapability: Locator;
    readonly backLink: Locator;

	constructor(private readonly page: Page) {
        this.jobRoleName = "Software Engineer";

        this.jobroleLink = this.page.getByRole("row", { name: `${this.jobRoleName}` }).getByRole("link");
        this.jobroleHeading = this.page.getByRole("heading", { name: this.jobRoleName, exact: true });
        this.jobroleDescription = this.page.getByRole("paragraph").getByText(new RegExp(`${this.jobRoleName}`));
        this.jobroleResponsibilities = this.page.getByText("Design, develop, and maintain");
        this.jobroleClosing = this.page.getByText(/Closing/);
        this.jobroleStatus = this.page.getByText(/Status/);
        this.jobrolePositions = this.page.getByText(/Positions/);
        this.jobroleLocation = this.page.getByText(/Location/);
        this.jobroleBand = this.page.getByText(/Band/);
        this.jobroleCapability = this.page.getByText(/Capability/);
        this.backLink = this.page.getByRole("link", { name: "Back" });
    }

	openJobRole(jobTitle: string): Promise<void> {
		return this.jobroleLink.click();
	}

	checkJobRole(jobTitle: string,): Promise<boolean> {
		return this.jobroleLink.isVisible();
	}

	heading(jobTitle: string): Promise<boolean> {
		return this.jobroleHeading.isVisible();
	}

	description(jobTitle: string): Promise<boolean> {
		return this.jobroleDescription.isVisible();
	}

	responsibilities(): Promise<boolean> {
		return this.jobroleResponsibilities.isVisible();
	}

	closing(): Promise<boolean> {
		return this.jobroleClosing.isVisible();
	}

	status(): Promise<boolean> {
		return this.jobroleStatus.isVisible();
	}

	positions(): Promise<boolean> {
		return this.jobrolePositions.isVisible();
	}

	location(): Promise<boolean> {
		return this.jobroleLocation.isVisible();
	}

	band(): Promise<boolean> {
		return this.jobroleBand.isVisible();
	}

	capability(): Promise<boolean> {
		return this.jobroleCapability.isVisible();
	}

	goBack(): Promise<void> {
		return this.backLink.click();
	}
}
