import type { Request, Response } from "express";
import {
	buildCreateJobRolePayload,
	type CreateJobRoleFieldErrors,
	type CreateJobRoleFormData,
	EMPTY_FORM_DATA,
} from "../../models/jobRoleModel.js";
import { JobRoleApiError, JobRoleService } from "../services/jobRoleService.js";

export class JobRoleController {
	private jobRoleService: JobRoleService;

	constructor() {
		this.jobRoleService = new JobRoleService();
	}

	async getJobRolesPage(req: Request, res: Response) {
		try {
			const roles = await this.jobRoleService.getJobRoles();
			const { statusName } = req.query;
			let filteredRoles = roles;
			if (statusName && typeof statusName === "string") {
				filteredRoles = roles.filter((role) => {
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

	async getJobRoleById(req: Request, res: Response) {
		const { id } = req.params;
		if (!id || typeof id !== "string" || id.trim() === "") {
			return res.status(400).send("Invalid or missing job role ID.");
		}
		try {
			const role = await this.jobRoleService.getJobRoleById(id);
			if (!role) {
				return res.status(404).send("Job role not found.");
			}
			res.render("job-role-information", { role });
		} catch (error) {
			console.error(`Error fetching job role with id ${id}:`, error);
			res.status(500).send("Failed to load job role.");
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
			"Responsibilities are required": "responsibilities",
			"Positions must be at least 1": "numberOfOpenPositions",
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
