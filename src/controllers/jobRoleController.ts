import type { Request, Response } from "express";
import type { JobRoleService } from "../services/jobRoleService.js";
import { type JobRole, JobRoleStatus } from "../types/JobRole.js";

export class JobRoleController {
	private jobRoleService: JobRoleService;
	constructor(jobRoleService: JobRoleService) {
		this.jobRoleService = jobRoleService;
	}

	async getJobRolesPage(req: Request, res: Response) {
		try {
			const roles = (await this.jobRoleService.getJobRoles(
				res.locals.token,
			)) as JobRole[];

			const { status_name } = req.query;
			let filteredRoles = roles;

			if (status_name !== undefined && status_name !== null) {
				const statusName = String(status_name).trim();
				if (statusName !== "") {
					filteredRoles = roles.filter((role) => {
						// Case-insensitive match for status
						return (
							role.status &&
							role.status.toLowerCase() === statusName.toLowerCase()
						);
					});
				}
			}
			res.render("job-role-list", { roles: filteredRoles });
		} catch (_error) {
			console.error("Error in getJobRolesPage:", _error);
			res.render("job-role-no-data");
		}
	}

	async getOpenJobRoles(req: Request, res: Response) {
		try {
			const roles = await this.jobRoleService.getJobRoles(res.locals.token);
			res.render("job-role-list", { roles });
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
			const role = await this.jobRoleService.getJobRoleById(
				id,
				res.locals.token,
			);
			const success =
				req.query.applicationSuccess === "true"
					? "Application submitted successfully!"
					: null;

			// Determine application state
			let applicationState: string | null = null;

			if (!res.locals.user) {
				applicationState = `<span class="text-muted">Please <a href="/login" class="kainos-blue-text">log in</a> to apply for this role</span>`;
			} else if (
				role.status.statusName === JobRoleStatus.OPEN &&
				role.numberOfOpenPositions > 0
			) {
				applicationState = `<a href="/job-roles/${role.jobRoleId}/apply" class="btn kainos-green btn-lg" rel="noopener">Apply Now</a>`;
			} else if (
				role.status.statusName === JobRoleStatus.OPEN &&
				role.numberOfOpenPositions === 0
			) {
				applicationState = `<span class="text-muted">No positions available for this role</span>`;
			} else if (role.status.statusName === JobRoleStatus.IN_PROGRESS) {
				applicationState =
					'<span class="text-muted">You have already applied for this role</span>';
			} else {
				applicationState = `<span class="text-muted">This role is not currently open for applications</span>`;
			}

			res.render("job-role-information", { role, success, applicationState });
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			return res.status(500).render("job-role-no-data");
		}
	}
}
