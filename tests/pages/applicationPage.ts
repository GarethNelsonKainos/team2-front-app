import { expect, type Locator, type Page } from "@playwright/test";
import { promises } from "node:dns";

export class ApplicationPage {
	readonly myRecentApplications: Locator;
	readonly applyNowLink: Locator;
	readonly chooseFileButton: Locator;
	readonly submitButton: Locator;
	readonly applicationSubmittedText: Locator;
	readonly applicationStatus: Locator;

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
		this.applicationStatus = this.page.getByRole("row").getByText("Submitted");
	}

	async checkMyRecentApplications(): Promise<boolean> {
		return await this.myRecentApplications.isVisible();
	}

	async applyForRole(): Promise<void> {
		await this.applyNowLink.click();
	}

	async populateApplicationForm(): Promise<void> {
		await this.chooseFileButton.click();
		await this.chooseFileButton.setInputFiles("TEST_CV.pdf");
		await this.submitButton.click();
	}
	async checkApplicationSubmitted(): Promise<boolean> {
		return await this.applicationSubmittedText.isVisible();
	}

	async checkMyRecentApplicationExists(): Promise<boolean> {
		return await this.applicationStatus.isVisible();
	}
}
