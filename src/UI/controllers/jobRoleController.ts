import type { Request, Response } from "express";
import { JobRoleService } from "../services/jobRoleService.js";

type JobRoleStatus = {
	statusName?: string;
};

type JobRole = {
	status?: JobRoleStatus;
	numberOfOpenPositions?: number;
};

type ApplicationState = "can_apply" | "closed" | "not_logged_in";

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
							role.status?.statusName &&
							role.status.statusName.toLowerCase() === statusName.toLowerCase()
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
			let applicationState: ApplicationState;
			if (!res.locals.user) {
				applicationState = "not_logged_in";
			} else if (
				role.numberOfOpenPositions > 0 &&
				role.status?.statusName === "Open"
			) {
				applicationState = "can_apply";
			} else {
				applicationState = "closed";
			}

			res.render("job-role-information", { role, success, applicationState });
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			return res.status(500).render("job-role-no-data");
		}
	}
}
