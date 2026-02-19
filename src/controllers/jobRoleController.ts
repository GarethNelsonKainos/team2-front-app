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

			const isAdmin = await this.authController.checkUserRole(req, res);

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
			res.render("job-role-list", { roles: filteredRoles, deleteError, user: res.locals.user, isAdmin });
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

			// Determine application state
			let applicationState: string | null = null;
			let appliedForRole = false;
			if (res.locals.user) {
				appliedForRole = await this.jobRoleService.checkIfUserAppliedForRole(
					res.locals.token,
					roleId,
				);
			}
			if (appliedForRole || success) {
				applicationState = null;
			}
			if (!res.locals.user) {
				applicationState = `<span class="text-muted">Please <a href="/login" class="kainos-blue-text">log in</a> to apply for this role</span>`;
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
				appliedForRole,
			});
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			return res.status(500).render("job-role-no-data");
		}
	}

	async getCreateJobRolePage(_req: Request, res: Response) {
		await this.renderCreateJobRolePage(res, {
			formData: { ...EMPTY_FORM_DATA },
			fieldErrors: {},
			apiError: "",
		});
	}

	async createJobRole(req: Request, res: Response) {
		const formData = this.getFormDataFromRequest(req);
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

		const fieldErrors: CreateJobRoleFieldErrors = {};
		const generalErrors: string[] = [];
		const errorMapping: Record<string, keyof CreateJobRoleFormData> = {
			"Role name is required": "roleName",
			"Job spec summary is required": "description",
			"SharePoint link is required": "sharepointUrl",
			"Invalid SharePoint URL format": "sharepointUrl",
			"Responsibilities is required": "responsibilities",
			"Number of open positions is required": "numberOfOpenPositions",
			"Number of open positions must be at least 1": "numberOfOpenPositions",
			"Location is required": "location",
			"Closing date is required": "closingDate",
			"Closing date must be in the future": "closingDate",
			"Invalid closing date format": "closingDate",
			"Capability is required": "capabilityId",
			"Band is required": "bandId",
		};

		for (const errorMessage of error.errors) {
			const mappedField = errorMapping[errorMessage];
			if (mappedField) {
				fieldErrors[mappedField] = errorMessage;
				continue;
			}

			generalErrors.push(errorMessage);
		}

		const apiError =
			generalErrors[0] ||
			(statusIsServerError(error.status)
				? "Cannot connect to server. Please check your connection."
				: "");

		return { fieldErrors, apiError };
	}

	private getFormDataFromRequest(req: Request): CreateJobRoleFormData {
		return {
			roleName: this.getTrimmedString(req.body.roleName),
			description: this.getTrimmedString(req.body.description),
			sharepointUrl: this.getTrimmedString(req.body.sharepointUrl),
			responsibilities: this.getTrimmedString(req.body.responsibilities),
			numberOfOpenPositions: this.getTrimmedString(
				req.body.numberOfOpenPositions,
			),
			location: this.getTrimmedString(req.body.location),
			closingDate: this.getTrimmedString(req.body.closingDate),
			capabilityId: this.getTrimmedString(req.body.capabilityId),
			bandId: this.getTrimmedString(req.body.bandId),
		};
	}

	private getTrimmedString(value: unknown): string {
		return typeof value === "string" ? value.trim() : "";
	}

	private async renderCreateJobRolePage(
		res: Response,
		{
			formData,
			fieldErrors,
			apiError,
		}: {
			formData: CreateJobRoleFormData;
			fieldErrors: CreateJobRoleFieldErrors;
			apiError: string;
		},
		status: number = 200,
	) {
		try {
			const [capabilities, bands] = await Promise.all([
				this.jobRoleService.getCapabilities(),
				this.jobRoleService.getBands(),
			]);

			res.status(status).render("new-role", {
				formData,
				fieldErrors,
				apiError,
				capabilities,
				bands,
			});
		} catch (_error) {
			res.status(500).render("new-role", {
				formData,
				fieldErrors,
				apiError: "Cannot connect to server. Please check your connection.",
				capabilities: [],
				bands: [],
			});
		}
	}
}

function statusIsServerError(status: number): boolean {
	return status >= 500;
}
