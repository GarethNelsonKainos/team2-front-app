import type { Request, Response } from "express";
import { JobRoleService } from "../services/jobRoleService.js";
import jwt from "jsonwebtoken";

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

	async getJobRolesPage(req: Request, res: Response) {
		try {
			const roles = (await this.jobRoleService.getJobRoles(
				req.token,
			)) as JobRole[];

			const { status_name } = req.query;
			let filteredRoles = roles;

			if (status_name !== undefined && status_name !== null) {
				const statusName = String(status_name).trim();
				if (statusName !== "") {
					filteredRoles = roles.filter((role) => {
						// Case-insensitive match for status
						return (
							role.status?.statusName &&
							role.status.statusName.toLowerCase() === statusName.toLowerCase()
						);
					});
				}
			}
			res.render("job-role-list", { roles: filteredRoles, user: req.user });
		} catch (_error) {
			console.error("Error in getJobRolesPage:", _error);
			res.render("job-role-no-data");
		}
	}

	async getOpenJobRoles(req: Request, res: Response) {
		try {
			const roles = await this.jobRoleService.getJobRoles(req.token);
			res.render("job-role-list", { roles, user: req.user });
		} catch (_error) {
			res.render("job-role-no-data");
		}
	}

	async getJobRoleById(req: Request, res: Response) {
		const id = String(req.params.id);
		if (!id || id.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}
		try {
			const role = await this.jobRoleService.getJobRoleById(id, req.token);
			if (!role) {
				return res.status(404).send("Job role not found.");
			}
			res.render("job-role-information", { role, user: req.user });
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			return res.status(500).render("job-role-no-data");
		}
	}
}
