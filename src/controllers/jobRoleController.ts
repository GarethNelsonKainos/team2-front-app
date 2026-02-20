import type { Request, Response } from "express";
import {
	buildCreateJobRolePayload,
	type CreateJobRoleFieldErrors,
	type CreateJobRoleFormData,
	EMPTY_FORM_DATA,
} from "../models/jobRoleModel.js";
import { JobRoleApiError } from "../services/jobRoleService.js";
import type { JobRoleService } from "../services/jobRoleService.js";
import { type JobRole, JobRoleStatus } from "../types/JobRole.js";
import type { ApplicationService } from "../services/applicationService.js";
import { AuthController } from "./authController.js";
import {
	buildApplicationState,
	buildErrorState,
	filterRolesByStatus,
	getFormDataFromRequest,
	mapJobRoleToFormData,
} from "./jobRoleControllerHelpers.js";

const DELETE_JOB_ROLE_ERROR_MESSAGE =
	"Failed to delete job role. Please check your connection.";

export class JobRoleController {
	private jobRoleService: JobRoleService;
	private applicationService: ApplicationService;
	private authController: AuthController;
	constructor(
		jobRoleService: JobRoleService,
		applicationService: ApplicationService,
		authController: AuthController,
	) {
		this.jobRoleService = jobRoleService;
		this.applicationService = applicationService;
		this.authController = authController;
	}

	async getJobRolesPage(req: Request, res: Response) {
		try {
			const roles = (await this.jobRoleService.getJobRoles()) as JobRole[];
			const deleteError =
				req.query.deleteError === "true" ? DELETE_JOB_ROLE_ERROR_MESSAGE : null;

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
			res.render("job-role-list", {
				roles: filteredRoles,
				deleteError,
				user: res.locals.user,
				isAdmin: res.locals.isAdmin,
			});
		} catch (_error) {
			console.error("Error in getJobRolesPage:", _error);
			const deleteError =
				req.query.deleteError === "true" ? DELETE_JOB_ROLE_ERROR_MESSAGE : null;
			res.render("job-role-no-data", { deleteError });
		}
	}

	async getOpenJobRoles(_req: Request, res: Response) {
		try {
			const roles = await this.jobRoleService.getJobRoles();
			res.render("job-role-list", {
				roles,
				user: res.locals.user,
				isAdmin: res.locals.isAdmin,
			});
		} catch (_error) {
			res.render("job-role-no-data", { deleteError: null });
		}
	}

	async getJobRoleById(req: Request, res: Response) {
		const id = String(req.params.id);
		if (!id || id.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}
		try {
			const role = await this.jobRoleService.getJobRoleById(id);
			const roleStatusName = (role as { status?: { statusName?: string } })
				.status?.statusName;
			const openPositions =
				(role as { numberOfOpenPositions?: number }).numberOfOpenPositions ?? 0;
			const roleId = (role as { jobRoleId?: string }).jobRoleId ?? id;
			const success =
				req.query.applicationSuccess === "true"
					? "Application submitted successfully!"
					: null;

			const isAdmin = res.locals.isAdmin;

			// Determine application state
			let applicationState: string | null = null;
			let appliedForRole = false;
			if (res.locals.user) {
				appliedForRole = await this.jobRoleService.checkIfUserAppliedForRole(
					res.locals.token,
					roleId,
				);
			}

			let applications = null;
			let userApp = null;
			if (isAdmin) {
				applications = await this.applicationService.getApplicationByJobRoleId(
					roleId,
					res.locals.token,
				);
				if (applications && Array.isArray(applications) && res.locals.user) {
					userApp = applications.find(
						(app) => app.userId === res.locals.user.userId,
					);
				}
			} else if (res.locals.user) {
				// For non-admin, get all applications for the user, then filter for this jobRoleId
				const userApplications =
					await this.applicationService.getUserApplications(res.locals.token);
				if (userApplications && Array.isArray(userApplications)) {
					userApp = userApplications.find((app) => app.jobRoleId === roleId);
				}
			}
			
			if (success || res.locals.isAdmin) {
				applicationState = null;
			} else if (appliedForRole && userApp) {
				switch (userApp.status) {
					case "HIRED":
						applicationState = `<div class="alert alert-success" role="alert"> <i class="bi bi-check-circle"></i> Congratulations! You have been hired for this role.</div>`;
						break;
					case "REJECTED":
						applicationState = `<div class="alert alert-danger" role="alert"> <i class="bi bi-x-circle"></i> Your application for this role was not successful.</div>`;
						break;
					case "IN_PROGRESS":
						applicationState = `<div class="alert alert-warning" role="alert"> <i class="bi bi-hourglass-split"></i> Your application for this role has been submitted.</div>`;
						break;
					default:
						applicationState = null;
				}
			} else if (!res.locals.user) {
				const redirectUrl = `/login?redirect=/job-roles/${roleId}`;
				applicationState = `<div class="alert kainos-blue" role="alert"> <i class="bi bi-info-circle"></i> Please <a href="${redirectUrl}" class="text-white">log in</a> to apply for this role</div>`;
			} else if (roleStatusName === JobRoleStatus.OPEN && openPositions > 0) {
				applicationState = `<a href="/job-roles/${roleId}/apply" class="btn kainos-green btn-lg" rel="noopener">Apply Now</a>`;
			} else if (roleStatusName === JobRoleStatus.OPEN && openPositions === 0) {
				applicationState = `<span class="text-muted">No positions available for this role</span>`;
			} else {
				applicationState = `<span class="text-muted">This role is not currently open for applications</span>`;
			}

			res.render("job-role-information", {
				role,
				success,
				applicationState,
				isAdmin,
				applications,
				appliedForRole,
			});
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			return res.status(500).render("job-role-no-data", { deleteError: null });
		}
	}

	async getCreateJobRolePage(_req: Request, res: Response) {
		await this.renderCreateJobRolePage(res, {
			formData: { ...EMPTY_FORM_DATA },
			fieldErrors: {},
			apiError: "",
			pageTitle: "Add New Role",
			formAction: "/job-roles",
		});
	}

	async getEditJobRolePage(req: Request, res: Response) {
		const id = String(req.params.id);
		if (!id || id.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}

		try {
			const role = await this.jobRoleService.getJobRoleById(id);
			await this.renderCreateJobRolePage(res, {
				formData: mapJobRoleToFormData(role),
				fieldErrors: {},
				apiError: "",
				pageTitle: "Edit Role",
				formAction: `/job-roles/${id}/edit`,
			});
		} catch (error) {
			console.error(
				`Error fetching job role with id ${id} for edit page:`,
				error,
			);
			return res.status(500).render("job-role-no-data");
		}
	}

	async createJobRole(req: Request, res: Response) {
		const formData = getFormDataFromRequest(req);
		const payload = buildCreateJobRolePayload(formData);

		try {
			await this.jobRoleService.createJobRole(payload);
			res.redirect("/job-roles");
		} catch (error) {
			const status = error instanceof JobRoleApiError ? error.status : 500;
			const { fieldErrors, apiError } = this.buildErrorState(error);

			await this.renderCreateJobRolePage(
				res,
				{
					formData,
					fieldErrors,
					apiError,
					pageTitle: "Add New Role",
					formAction: "/job-roles",
				},
				status,
			);
		}
	}

	async deleteJobRole(req: Request, res: Response) {
		const id = String(req.params.id);
		if (!id || id.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}

		try {
			await this.jobRoleService.deleteJobRole(id);
			return res.redirect("/job-roles");
		} catch (error) {
			console.error(`Error deleting job role with id ${id}:`, error);
			return res.redirect("/job-roles?deleteError=true");
		}
	}

	private buildErrorState(error: unknown): {
		fieldErrors: CreateJobRoleFieldErrors;
		apiError: string;
	} {
		if (!(error instanceof JobRoleApiError)) {
			return {
				fieldErrors: {},
				apiError: "Cannot connect to server. Please check your connection.",
			};
		}

		return {
			fieldErrors: {},
			apiError: error.message || "An error occurred. Please try again.",
		};
	}

	async updateJobRole(req: Request, res: Response) {
		const id = String(req.params.id);
		if (!id || id.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}

		const formData = getFormDataFromRequest(req);
		const payload = buildCreateJobRolePayload(formData);

		try {
			await this.jobRoleService.updateJobRole(id, payload);
			res.redirect(`/job-roles/${id}`);
		} catch (error) {
			const status = error instanceof JobRoleApiError ? error.status : 500;
			const { fieldErrors, apiError } = this.buildErrorState(error);

			await this.renderCreateJobRolePage(
				res,
				{
					formData,
					fieldErrors,
					apiError,
					pageTitle: "Edit Role",
					formAction: `/job-roles/${id}/edit`,
				},
				status,
			);
		}
	}

	private async renderCreateJobRolePage(
		res: Response,
		{
			formData,
			fieldErrors,
			apiError,
			pageTitle,
			formAction,
		}: {
			formData: CreateJobRoleFormData;
			fieldErrors: CreateJobRoleFieldErrors;
			apiError: string;
			pageTitle: string;
			formAction: string;
		},
		status: number = 200,
	) {
		try {
			const [capabilities, bands] = await Promise.all([
				this.jobRoleService.getCapabilities(),
				this.jobRoleService.getBands(),
			]);

			res.status(status).render("create-edit-role", {
				formData,
				fieldErrors,
				apiError,
				pageTitle,
				formAction,
				capabilities,
				bands,
			});
		} catch (_error) {
			res.status(500).render("create-edit-role", {
				formData,
				fieldErrors,
				apiError: "Cannot connect to server. Please check your connection.",
				pageTitle,
				formAction,
				capabilities: [],
				bands: [],
			});
		}
	}
}
