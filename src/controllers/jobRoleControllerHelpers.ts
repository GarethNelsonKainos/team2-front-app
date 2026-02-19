import type { Request } from "express";
import type {
	CreateJobRoleFieldErrors,
	CreateJobRoleFormData,
} from "../models/jobRoleModel.js";
import { JobRoleApiError } from "../services/jobRoleService.js";
import { JobRoleStatus } from "../types/JobRole.js";

function getTrimmedString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function formatDateForInput(value: unknown): string {
	const rawValue = getTrimmedString(value);
	if (!rawValue) {
		return "";
	}

	const parsedDate = new Date(rawValue);
	if (Number.isNaN(parsedDate.getTime())) {
		return rawValue;
	}

	const year = parsedDate.getFullYear();
	const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
	const day = String(parsedDate.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function statusIsServerError(status: number): boolean {
	return status >= 500;
}

export function filterRolesByStatus<T extends { status?: string }>(
	roles: T[],
	statusNameQuery: unknown,
): T[] {
	if (statusNameQuery === undefined || statusNameQuery === null) {
		return roles;
	}

	const statusName = String(statusNameQuery).trim();
	if (statusName === "") {
		return roles;
	}

	return roles.filter((role) => {
		return (
			role.status && role.status.toLowerCase() === statusName.toLowerCase()
		);
	});
}

export function buildApplicationState({
	hasUser,
	roleStatusName,
	openPositions,
	roleId,
}: {
	hasUser: boolean;
	roleStatusName?: string;
	openPositions: number;
	roleId: string;
}): string {
	const encodedRoleId = encodeURIComponent(roleId);
	if (!hasUser) {
		return '<span class="text-muted">Please <a href="/login" class="kainos-blue-text">log in</a> to apply for this role</span>';
	}

	if (roleStatusName === JobRoleStatus.OPEN && openPositions > 0) {
		return `<a href="/job-roles/${encodedRoleId}/apply" class="btn kainos-green btn-lg" rel="noopener">Apply Now</a>`;
	}

	if (roleStatusName === JobRoleStatus.OPEN && openPositions === 0) {
		return '<span class="text-muted">No positions available for this role</span>';
	}

	if (roleStatusName === JobRoleStatus.IN_PROGRESS) {
		return '<span class="text-muted">You have already applied for this role</span>';
	}

	return '<span class="text-muted">This role is not currently open for applications</span>';
}

export function buildErrorState(error: unknown): {
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

export function getFormDataFromRequest(req: Request): CreateJobRoleFormData {
	return {
		roleName: getTrimmedString(req.body.roleName),
		description: getTrimmedString(req.body.description),
		sharepointUrl: getTrimmedString(req.body.sharepointUrl),
		responsibilities: getTrimmedString(req.body.responsibilities),
		numberOfOpenPositions: getTrimmedString(req.body.numberOfOpenPositions),
		location: getTrimmedString(req.body.location),
		closingDate: getTrimmedString(req.body.closingDate),
		capabilityId: getTrimmedString(req.body.capabilityId),
		bandId: getTrimmedString(req.body.bandId),
	};
}

export function mapJobRoleToFormData(role: unknown): CreateJobRoleFormData {
	const jobRole = role as Record<string, unknown>;
	const capability =
		(jobRole.capability as Record<string, unknown> | undefined) || {};
	const band = (jobRole.band as Record<string, unknown> | undefined) || {};

	return {
		roleName: getTrimmedString(jobRole.roleName),
		description: getTrimmedString(jobRole.description),
		sharepointUrl: getTrimmedString(
			jobRole.sharepointUrl ?? jobRole.sharePointUrl,
		),
		responsibilities: getTrimmedString(jobRole.responsibilities),
		numberOfOpenPositions:
			typeof jobRole.numberOfOpenPositions === "number"
				? String(jobRole.numberOfOpenPositions)
				: getTrimmedString(jobRole.numberOfOpenPositions),
		location: getTrimmedString(jobRole.location),
		closingDate: formatDateForInput(jobRole.closingDate),
		capabilityId: getTrimmedString(
			jobRole.capabilityId ?? capability.capabilityId,
		),
		bandId: getTrimmedString(jobRole.bandId ?? band.bandId),
	};
}
