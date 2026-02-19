import type { Request, Response } from "express";
import {
	buildCreateJobRolePayload,
	type CreateJobRoleFieldErrors,
	type CreateJobRoleFormData,
	EMPTY_FORM_DATA,
} from "../models/jobRoleModel.js";
import { JobRoleApiError } from "../services/jobRoleService.js";
import type { JobRoleService } from "../services/jobRoleService.js";
import type { JobRole } from "../types/JobRole.js";
import {
	buildApplicationState,
	buildErrorState,
	filterRolesByStatus,
	getFormDataFromRequest,
	mapJobRoleToFormData,
} from "./jobRoleControllerHelpers.js";

export class JobRoleController {
	private jobRoleService: JobRoleService;
	constructor(jobRoleService: JobRoleService) {
		this.jobRoleService = jobRoleService;
	}

	async getJobRolesPage(req: Request, res: Response) {
		try {
			const roles = (await this.jobRoleService.getJobRoles()) as JobRole[];
			const filteredRoles = filterRolesByStatus(roles, req.query.status_name);
			res.render("job-role-list", { roles: filteredRoles });
		} catch (_error) {
			console.error("Error in getJobRolesPage:", _error);
			res.render("job-role-no-data");
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
			const applicationState = buildApplicationState({
				hasUser: Boolean(res.locals.user),
				roleStatusName,
				openPositions,
				roleId,
			});

			res.render("job-role-information", { role, success, applicationState });
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
			const { fieldErrors, apiError } = buildErrorState(error);

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
			const { fieldErrors, apiError } = buildErrorState(error);

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
