import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authMiddleware.js";
import { JobRoleService } from "../services/jobRoleService.js";

type JobRoleStatus = {
	statusName?: string;
};

type JobRole = {
	status?: JobRoleStatus;
};

export class JobRoleController {
	private jobRoleService: JobRoleService;
	constructor() {
		this.jobRoleService = new JobRoleService();
	}

	async getJobRolesPage(req: AuthenticatedRequest, res: Response) {
		try {
			const roles = (await this.jobRoleService.getJobRoles()) as JobRole[];
			const { statusName } = req.query;
			let filteredRoles = roles;
			if (statusName && typeof statusName === "string") {
				filteredRoles = roles.filter((role) => {
					// Case-insensitive match for status
					return (
						role.status?.statusName &&
						role.status.statusName.toLowerCase() === statusName.toLowerCase()
					);
				});
			}
			res.render("job-role-list", {
				roles: filteredRoles,
				isAdmin: req.user?.role === "admin",
				user: req.user || null,
			});
		} catch (_error) {
			res.render("job-role-no-data", { user: req.user || null });
		}
	}

	async getOpenJobRoles(req: AuthenticatedRequest, res: Response) {
		try {
			const roles = await this.jobRoleService.getJobRoles();
			res.render("job-role-list", { roles, user: req.user || null });
		} catch (_error) {
			res.render("job-role-no-data", { user: req.user || null });
		}
	}

	async getJobRoleById(req: AuthenticatedRequest, res: Response) {
		const { id } = req.params;
		if (!id || typeof id !== "string" || id.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}
		try {
			const role = await this.jobRoleService.getJobRoleById(id);
			if (!role) {
				return res.status(404).send("Job role not found.");
			}
			res.render("job-role-information", { role, user: req.user || null });
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			res.status(500).send("Failed to load job role.");
		}
	}

	async getNewRolePage(req: AuthenticatedRequest, res: Response) {
		try {
			const bands = await this.jobRoleService.getBands();
			const capabilities = await this.jobRoleService.getCapabilities();
			res.render("new-role", {
				user: req.user,
				bands,
				capabilities,
			});
		} catch (error) {
			console.error("Error loading bands and capabilities:", error);
			res.render("new-role", {
				user: req.user,
				bands: [],
				capabilities: [],
				error: "Failed to load dropdown options",
			});
		}
	}

	async createJobRole(req: AuthenticatedRequest, res: Response) {
		if (!req.user || req.user.role !== "admin") {
			return res.status(401).json({ message: "Unauthorised" });
		}

		try {
			const token = req.cookies?.authToken;
			const createdRole = await this.jobRoleService.createJobRole(
				req.body,
				token,
			);
			return res.status(201).json(createdRole);
		} catch (error) {
			interface ErrorWithErrors {
				errors: unknown;
			}
			if (
				error &&
				typeof error === "object" &&
				"errors" in error &&
				Array.isArray((error as ErrorWithErrors).errors)
			) {
				return res
					.status(400)
					.json({ errors: (error as ErrorWithErrors).errors });
			}
			console.error("Error creating job role:", error);
			return res.status(500).json({ message: "Failed to create job role" });
		}
	}
}
