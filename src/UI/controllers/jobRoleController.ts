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
			//get token
			const token = req.cookies.token;

			const roles = (await this.jobRoleService.getJobRoles(token)) as JobRole[];
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
			res.render("job-role-list", { roles: filteredRoles });
		} catch (_error) {
			res.render("job-role-no-data");
		}
	}

	async getOpenJobRoles(_req: Request, res: Response) {
		try {
			const token = _req.cookies.token;

			const roles = await this.jobRoleService.getJobRoles(token);
			res.render("job-role-list", { roles });
		} catch (_error) {
			res.render("job-role-no-data");
		}
	}

	async getJobRoleById(req: Request, res: Response) {
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
			res.render("job-role-information", { role, user });
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			return res.status(500).render("job-role-no-data");
		}
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
			res.render("application-form", { jobRoleId: id, user });
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			return res.status(500).render("job-role-no-data");
		}
	}
}
