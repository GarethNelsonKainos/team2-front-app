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
    async getJobRolesPage(req: Request, res: Response) {
        try {
            const roles = await this.jobRoleService.getJobRoles();
            const { statusName } = req.query;
            let filteredRoles = roles;
            if (statusName && typeof statusName === 'string') {
                filteredRoles = roles.filter((role: any) => {
                    // Case-insensitive match for status
                    return role.status.statusName && role.status.statusName.toLowerCase() === statusName.toLowerCase();
                });
            }
            res.render('job-role-list', { roles: filteredRoles });
        } catch (error) {
            res.render('job-role-no-data');
        }
    }

    async getOpenJobRoles(req: Request, res: Response) {
        try {
            const roles = await this.jobRoleService.getJobRoles();
            res.render('job-role-list', { roles });
        } catch (error) {
            res.render('job-role-no-data');
        }
    }

    async getJobRoleById(req: Request, res: Response) {
        const { id } = req.params;
        if (!id || typeof id !== 'string' || id.trim() === '') {
            return res.status(400).send('Invalid or missing job role ID.');
        }
        try {
            const role = await this.jobRoleService.getJobRoleById(id);
            if (!role) {
                return res.status(404).send('Job role not found.');
            }
            res.render('job-role-information', { role });

        } catch (error) {
            console.error(`Error fetching job role with id ${id}:`, error);
            res.status(500).send('Failed to load job role.');
            res.render('job-role-no-data');
        }
    }
}
