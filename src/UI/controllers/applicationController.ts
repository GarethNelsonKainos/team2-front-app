import type { Request, Response } from "express";
import { ApplicationService } from "../services/applicationService.js";
import { JobRoleService } from "../services/jobRoleService.js";
import jwt from "jsonwebtoken";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

export class ApplicationController {
	private applicationService: ApplicationService;
	private jobRoleService: JobRoleService;
	constructor() {
		this.applicationService = new ApplicationService();
		this.jobRoleService = new JobRoleService();
	}

	async getApplicationForm(req: Request, res: Response) {
		const { id } = req.params;
		if (!id || typeof id !== "string" || id.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}
		try {
			const token = req.cookies.token;
			const role = await this.jobRoleService.getJobRoleById(id, token);
			if (!role) {
				return res.status(404).send("Job role not found.");
			}
			const user = token ? jwt.decode(token) : null;
			res.render("application-form", {
				jobRoleId: id,
				user,
				API_BASE_URL,
				role,
			});
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			return res.status(500).render("job-role-no-data");
		}
	}
	// Handle application form submission with file upload
	async handleApplicationSubmit(req: Request, res: Response) {
		const token = req.cookies.token;
		const user = token ? jwt.decode(token) : null;
		console.log("[handleApplicationSubmit] Start");
		try {
			console.log("[handleApplicationSubmit] req.body:", req.body);
			const { jobRoleId, userId } = req.body;
			const file = req.file;
			console.log("[handleApplicationSubmit] file:", file);
			if (!file) {
				console.log("[handleApplicationSubmit] No file uploaded");
				// Fetch job role details again for the view
				const role = await this.jobRoleService.getJobRoleById(jobRoleId, token);
				return res.status(400).render("application-form", {
					jobRoleId,
					user: user,
					error: "No file uploaded.",
					role,
				});
			}
			const result = await this.applicationService.processApplication({ jobRoleId, userId, file });
			console.log("[handleApplicationSubmit] processApplication result:", result);
			// Fetch job role details again for the view
			const role = await this.jobRoleService.getJobRoleById(jobRoleId, token);
			return res.status(200).render("application-form", {
				jobRoleId,
				user: user,
				error: null,
				success: "Application submitted successfully!",
				API_BASE_URL: API_BASE_URL,
				role,
			});
		} catch (error) {
			console.error("[handleApplicationSubmit] Error:", error);
			return res.status(500).render("application-form", {
				jobRoleId: req.body.jobRoleId,
				user: user,
				error: "Failed to submit application."
			});
		}
	}
}
