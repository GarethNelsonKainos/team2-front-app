import type { Request, Response } from "express";
import { ApplicationService } from "../services/applicationService.js";
import { JobRoleService } from "../services/jobRoleService.js";

export class ApplicationController {
	private applicationService: ApplicationService;
	private jobRoleService: JobRoleService;
	constructor(
		applicationService: ApplicationService,
		jobRoleService: JobRoleService,
	) {
		this.applicationService = applicationService;
		this.jobRoleService = jobRoleService;
	}

	async getApplicationForm(req: Request, res: Response) {
		const { id } = req.params;
		const ID = String(id ?? "");
		if (!ID || ID.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}
		try {
			if (!res.locals.user) {
				return res
					.status(401)
					.send("Unauthorized: Missing authentication token.");
			}
			const role = await this.jobRoleService.getJobRoleById(
				ID,
				res.locals.token,
			);
			if (!role) {
				return res.status(404).send("Job role not found.");
			}
			res.render("application-form", {
				jobRoleId: ID,
				role,
			});
		} catch (error) {
			console.error(`Error fetching job role with id ${ID}:`, error);
			return res.status(500).render("job-role-no-data");
		}
	}
	// Handle application form submission with file upload
	async handleApplicationSubmit(req: Request, res: Response) {
		try {
			if (!res.locals.user) {
				return res
					.status(401)
					.send("Unauthorized: Missing authentication token.");
			}
			const { jobRoleId, userId } = req.body;
			const file = req.file;
			if (!file) {
				const role = await this.jobRoleService.getJobRoleById(
					jobRoleId,
					res.locals.token,
				);
				return res.status(400).render("application-form", {
					jobRoleId,
					error: "No file uploaded.",
					role,
				});
			}
			const result = await this.applicationService.processApplication({
				jobRoleId,
				userId,
				file,
			});
			// Fetch job role details again for the view
			const role = await this.jobRoleService.getJobRoleById(
				jobRoleId,
				res.locals.token,
			);
			return res.status(200).render("application-form", {
				jobRoleId,
				user: res.locals.user,
				success: "Application submitted successfully!",
				role,
			});
		} catch (error) {
			console.error("[handleApplicationSubmit] Error:", error);
			return res.status(500).render("application-form", {
				jobRoleId: req.body.jobRoleId,
				error: "Failed to submit application.",
			});
		}
	}
}
