import { expect, type Locator, type Page } from "@playwright/test";
import { promises } from "node:dns";

export class ApplicationPage {
	readonly myRecentApplications: Locator;
	readonly applyNowLink: Locator;
	readonly chooseFileButton: Locator;
	readonly submitButton: Locator;
	readonly applicationSubmittedText: Locator;

	constructor(private readonly page: Page) {
		this.myRecentApplications = this.page.getByText("My Recent Applications");
		this.applyNowLink = this.page.getByRole("link", { name: "Apply Now" });
		this.chooseFileButton = this.page.getByRole("button", {
			name: "Choose file to upload",
		});
		this.submitButton = this.page.getByRole("button", { name: "Submit" });
		this.applicationSubmittedText = this.page.getByText(
			"Application submitted",
		);
	}

	async checkMyRecentApplications(): Promise<Boolean> {
		return await this.myRecentApplications.isVisible();
	}

	checkMyRecentApplicationExists(applicationName: string): Locator {
		return this.page.getByRole("row", { name: applicationName });
	}

	async applyForRole(): Promise<void> {
		await this.applyNowLink.click();
	}

	async populateApplicationForm(): Promise<void> {
		await this.chooseFileButton.click();
		await this.chooseFileButton.setInputFiles(
			"/Users/sam/Downloads/Bee-Movie-2007.pdf",
		);
		await this.submitButton.click();
		await this.applicationSubmittedText.isVisible();
	}
}
