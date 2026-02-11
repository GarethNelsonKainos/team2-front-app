import { Request, Response } from "express";
import { JobRoleService } from "../services/jobRoleService.js";

export class JobRoleController {
	private jobRoleService: JobRoleService;
	constructor() {
		this.jobRoleService = new JobRoleService();
	}

	async getJobRolesPage(req: Request, res: Response) {
		try {
			const roles = await this.jobRoleService.getJobRoles();
			res.render("job-role-list", { roles });
		} catch (error) {
			console.error("Error fetching job roles:", error);
			res.render("job-role-no-data");
		}
	}
}
