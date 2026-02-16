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
			res.render("job-role-no-data", { user: req.user || null });
		}
	}

	getNewRolePage(req: AuthenticatedRequest, res: Response) {
		if (!req.user || req.user.role !== "admin") {
			return res.status(401).render("new-role", { isUnauthorized: true });
		}

		res.render("new-role", { isUnauthorized: false, user: req.user });
	}
}
