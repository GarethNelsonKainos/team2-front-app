import { describe, expect, it } from "vitest";
import { JobRoleApiError } from "../../../src/services/jobRoleService";
import {
	buildErrorState,
	filterRolesByStatus,
	getFormDataFromRequest,
	mapJobRoleToFormData,
} from "../../../src/controllers/jobRoleControllerHelpers";

describe("jobRoleControllerHelpers", () => {
	describe("filterRolesByStatus", () => {
		const roles = [
			{ roleName: "Engineer", status: "Open" },
			{ roleName: "Designer", status: { statusName: "Closed" } },
			{ roleName: "Analyst" },
		];

		it("returns all roles when status query is undefined", () => {
			expect(filterRolesByStatus(roles, undefined)).toEqual(roles);
		});

		it("returns all roles when status query is blank", () => {
			expect(filterRolesByStatus(roles, "   ")).toEqual(roles);
		});

		it("filters roles case-insensitively for string status values", () => {
			expect(filterRolesByStatus(roles, "open")).toEqual([
				{ roleName: "Engineer", status: "Open" },
			]);
		});

		it("filters roles using statusName when status is an object", () => {
			expect(filterRolesByStatus(roles, "closed")).toEqual([
				{ roleName: "Designer", status: { statusName: "Closed" } },
			]);
		});
	});

	describe("buildErrorState", () => {
		it("returns connection error for non-JobRoleApiError", () => {
			expect(buildErrorState(new Error("down"))).toEqual({
				fieldErrors: {},
				apiError: "Cannot connect to server. Please check your connection.",
			});
		});

		it("maps known API errors to field errors", () => {
			const error = new JobRoleApiError(400, [
				"Role name is required",
				"Capability is required",
			]);

			expect(buildErrorState(error)).toEqual({
				fieldErrors: {
					roleName: "Role name is required",
					capabilityId: "Capability is required",
				},
				apiError: "",
			});
		});

		it("uses first non-mapped error as apiError", () => {
			const error = new JobRoleApiError(400, ["Role already exists"]);

			expect(buildErrorState(error)).toEqual({
				fieldErrors: {},
				apiError: "Role already exists",
			});
		});

		it("uses connection apiError for server errors when all messages are mapped", () => {
			const error = new JobRoleApiError(503, ["Role name is required"]);

			expect(buildErrorState(error)).toEqual({
				fieldErrors: {
					roleName: "Role name is required",
				},
				apiError: "Cannot connect to server. Please check your connection.",
			});
		});
	});

	describe("getFormDataFromRequest", () => {
		it("trims values and converts non-string values to empty strings", () => {
			const req = {
				body: {
					roleName: "  Engineer  ",
					description: " desc ",
					sharepointUrl: " https://example.com ",
					responsibilities: "  build ",
					numberOfOpenPositions: " 2 ",
					location: " Belfast ",
					closingDate: " 2026-12-31 ",
					capabilityId: 123,
					bandId: null,
				},
			} as never;

			expect(getFormDataFromRequest(req)).toEqual({
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "build",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "",
				bandId: "",
			});
		});
	});

	describe("mapJobRoleToFormData", () => {
		it("maps role data to form fields including nested fallback ids", () => {
			const role = {
				roleName: "  Engineer  ",
				description: " desc ",
				sharePointUrl: " https://example.com ",
				responsibilities: " do work ",
				numberOfOpenPositions: 3,
				location: " Belfast ",
				closingDate: "2026-12-31T00:00:00.000Z",
				capability: { capabilityId: "cap-1" },
				band: { bandId: "band-1" },
			};

			expect(mapJobRoleToFormData(role)).toEqual({
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do work",
				numberOfOpenPositions: "3",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			});
		});

		it("keeps invalid date text as-is and prefers explicit capability/band ids", () => {
			const role = {
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do work",
				numberOfOpenPositions: "7",
				location: "Belfast",
				closingDate: "not-a-date",
				capabilityId: "cap-explicit",
				bandId: "band-explicit",
				capability: { capabilityId: "cap-nested" },
				band: { bandId: "band-nested" },
			};

			expect(mapJobRoleToFormData(role)).toEqual({
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do work",
				numberOfOpenPositions: "7",
				location: "Belfast",
				closingDate: "not-a-date",
				capabilityId: "cap-explicit",
				bandId: "band-explicit",
			});
		});
	});
});
