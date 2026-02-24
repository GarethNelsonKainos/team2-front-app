import { describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../../src/controllers/jobRoleController";
import { JobRoleStatus } from "../../../src/types/JobRole";
import { JobRoleApiError } from "../../../src/services/jobRoleService";
import type { JobRoleService } from "../../../src/services/jobRoleService";
import {
	createMockRequest,
	createMockResponse,
} from "../../helpers/expressMocks";

describe("JobRoleController", () => {
	it("filters job roles by status query value case-insensitively", async () => {
		const jobRoleService = {
			getJobRoles: vi.fn().mockResolvedValue([
				{ roleName: "Engineer", status: "Open" },
				{ roleName: "Designer", status: "Closed" },
			]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ query: { status_name: "open" } });
		const res = createMockResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-list", {
			roles: [{ roleName: "Engineer", status: "Open" }],
			deleteError: null,
		});
	});

	it("renders all roles when status filter is blank and includes delete error message", async () => {
		const roles = [
			{ roleName: "Engineer", status: "Open" },
			{ roleName: "Designer", status: "Closed" },
		];
		const jobRoleService = {
			getJobRoles: vi.fn().mockResolvedValue(roles),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			query: { status_name: "   ", deleteError: "true" },
		});
		const res = createMockResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-list", {
			roles,
			deleteError: "Failed to delete job role. Please check your connection.",
		});
	});

	it("renders no-data page when role list fetch fails", async () => {
		const jobRoleService = {
			getJobRoles: vi.fn().mockRejectedValue(new Error("backend down")),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ query: { deleteError: "true" } });
		const res = createMockResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-no-data", {
			deleteError: "Failed to delete job role. Please check your connection.",
		});
	});

	it("renders no-data page with null deleteError when fetch fails without delete flag", async () => {
		const jobRoleService = {
			getJobRoles: vi.fn().mockRejectedValue(new Error("backend down")),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ query: { deleteError: "false" } });
		const res = createMockResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-no-data", {
			deleteError: null,
		});
	});

	it("renders login prompt application state when user is not authenticated", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue({
				jobRoleId: "role-1",
				status: { statusName: JobRoleStatus.OPEN },
				numberOfOpenPositions: 3,
			}),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = null;

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining('Please <a href="/login"'),
			}),
		);
	});

	it("renders apply action when role is open and positions are available for authenticated user", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue({
				jobRoleId: "role-1",
				status: { statusName: JobRoleStatus.OPEN },
				numberOfOpenPositions: 2,
			}),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining("Apply Now"),
			}),
		);
	});

	it("renders no positions message when role is open but no positions remain", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue({
				jobRoleId: "role-1",
				status: { statusName: JobRoleStatus.OPEN },
				numberOfOpenPositions: 0,
			}),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining("No positions available"),
			}),
		);
	});

	it("renders already-applied message when role is in progress", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue({
				jobRoleId: "role-1",
				status: { statusName: JobRoleStatus.IN_PROGRESS },
				numberOfOpenPositions: 1,
			}),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining("already applied"),
			}),
		);
	});

	it("falls back to request id and zero positions when role fields are missing", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue({
				status: { statusName: JobRoleStatus.OPEN },
			}),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "fallback-id" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining("No positions available"),
			}),
		);
	});

	it("returns 400 when job role id is missing", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn(),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "" } });
		const res = createMockResponse();

		await controller.getJobRoleById(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith("Invalid or missing job role ID.");
	});

	it("returns 500 no-data page when fetching a specific role fails", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn().mockRejectedValue(new Error("backend down")),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.getJobRoleById(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("job-role-no-data");
	});

	it("renders closed state message for authenticated user when role is not open", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue({
				jobRoleId: "role-1",
				status: { statusName: JobRoleStatus.CLOSED },
				numberOfOpenPositions: 1,
			}),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining("not currently open"),
			}),
		);
	});

	it("renders success message when applicationSuccess query flag is true", async () => {
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue({
				jobRoleId: "role-1",
				status: { statusName: JobRoleStatus.OPEN },
				numberOfOpenPositions: 2,
			}),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			params: { id: "role-1" },
			query: { applicationSuccess: "true" },
		});
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				success: "Application submitted successfully!",
			}),
		);
	});

	it("redirects to roles list after successful creation", async () => {
		const jobRoleService = {
			createJobRole: vi.fn().mockResolvedValue({ jobRoleId: "role-1" }),
			getCapabilities: vi.fn().mockResolvedValue([]),
			getBands: vi.fn().mockResolvedValue([]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			body: {
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do stuff",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			},
		});
		const res = createMockResponse();

		await controller.createJobRole(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("redirects to /job-roles when deletion is successful", async () => {
		const jobRoleService = {
			deleteJobRole: vi.fn().mockResolvedValue(undefined),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.deleteJobRole(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("maps API validation errors back to form fields", async () => {
		const jobRoleService = {
			createJobRole: vi
				.fn()
				.mockRejectedValue(
					new JobRoleApiError(400, [
						"Role name is required",
						"Capability is required",
					]),
				),
			getCapabilities: vi
				.fn()
				.mockResolvedValue([
					{ capabilityId: "cap-1", capabilityName: "Engineering" },
				]),
			getBands: vi
				.fn()
				.mockResolvedValue([{ bandId: "band-1", bandName: "B2" }]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			body: {
				roleName: "",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do stuff",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "",
				bandId: "band-1",
			},
		});
		const res = createMockResponse();

		await controller.createJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith(
			"new-role",
			expect.objectContaining({
				fieldErrors: expect.objectContaining({
					roleName: "Role name is required",
					capabilityId: "Capability is required",
				}),
			}),
		);
	});

	it("keeps apiError empty for mapped client validation errors", async () => {
		const jobRoleService = {
			createJobRole: vi
				.fn()
				.mockRejectedValue(new JobRoleApiError(400, ["Role name is required"])),
			getCapabilities: vi.fn().mockResolvedValue([]),
			getBands: vi.fn().mockResolvedValue([]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			body: {
				roleName: "",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do stuff",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			},
		});
		const res = createMockResponse();

		await controller.createJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith(
			"new-role",
			expect.objectContaining({
				fieldErrors: expect.objectContaining({
					roleName: "Role name is required",
				}),
				apiError: "",
			}),
		);
	});

	it("uses connection apiError for mapped validation errors when status is server error", async () => {
		const jobRoleService = {
			createJobRole: vi
				.fn()
				.mockRejectedValue(new JobRoleApiError(503, ["Role name is required"])),
			getCapabilities: vi.fn().mockResolvedValue([]),
			getBands: vi.fn().mockResolvedValue([]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			body: {
				roleName: "",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do stuff",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			},
		});
		const res = createMockResponse();

		await controller.createJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(503);
		expect(res.render).toHaveBeenCalledWith(
			"new-role",
			expect.objectContaining({
				fieldErrors: expect.objectContaining({
					roleName: "Role name is required",
				}),
				apiError: "Cannot connect to server. Please check your connection.",
			}),
		);
	});

	it("shows general API error message when backend error is not field-mapped", async () => {
		const jobRoleService = {
			createJobRole: vi
				.fn()
				.mockRejectedValue(new JobRoleApiError(400, ["Role already exists"])),
			getCapabilities: vi.fn().mockResolvedValue([]),
			getBands: vi.fn().mockResolvedValue([]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			body: {
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do stuff",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			},
		});
		const res = createMockResponse();

		await controller.createJobRole(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"new-role",
			expect.objectContaining({
				apiError: "Role already exists",
				fieldErrors: {},
			}),
		);
	});

	it("shows connection message for non-JobRoleApiError failures during creation", async () => {
		const jobRoleService = {
			createJobRole: vi.fn().mockRejectedValue(new Error("socket hang up")),
			getCapabilities: vi.fn().mockResolvedValue([]),
			getBands: vi.fn().mockResolvedValue([]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			body: {
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do stuff",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			},
		});
		const res = createMockResponse();

		await controller.createJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith(
			"new-role",
			expect.objectContaining({
				apiError: "Cannot connect to server. Please check your connection.",
			}),
		);
	});

	it("renders create-role page with empty capabilities/bands when lookup fails", async () => {
		const jobRoleService = {
			getCapabilities: vi.fn().mockRejectedValue(new Error("down")),
			getBands: vi.fn().mockResolvedValue([]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest();
		const res = createMockResponse();

		await controller.getCreateJobRolePage(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith(
			"new-role",
			expect.objectContaining({
				capabilities: [],
				bands: [],
				apiError: "Cannot connect to server. Please check your connection.",
			}),
		);
	});

	it("renders open roles list on getOpenJobRoles success and fallback page on failure", async () => {
		const jobRoleService = {
			getJobRoles: vi
				.fn()
				.mockResolvedValueOnce([{ roleName: "Engineer" }])
				.mockRejectedValueOnce(new Error("down")),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest();
		const successRes = createMockResponse();
		const failureRes = createMockResponse();

		await controller.getOpenJobRoles(req, successRes);
		await controller.getOpenJobRoles(req, failureRes);

		expect(successRes.render).toHaveBeenCalledWith("job-role-list", {
			roles: [{ roleName: "Engineer" }],
		});
		expect(failureRes.render).toHaveBeenCalledWith("job-role-no-data");
	});

	it("returns 400 when deleting without an id", async () => {
		const jobRoleService = {
			deleteJobRole: vi.fn(),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "" } });
		const res = createMockResponse();

		await controller.deleteJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith("Invalid or missing job role ID.");
	});

	it("redirects with delete error flag when deletion fails", async () => {
		const jobRoleService = {
			deleteJobRole: vi.fn().mockRejectedValue(new Error("delete failed")),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.deleteJobRole(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles?deleteError=true");
	});

	it("trims and sanitizes input during createJobRole", async () => {
		const jobRoleService = {
			createJobRole: vi.fn().mockResolvedValue({ jobRoleId: "role-1" }),
			getCapabilities: vi.fn().mockResolvedValue([]),
			getBands: vi.fn().mockResolvedValue([]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			body: {
				roleName: "  Engineer  ",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do stuff",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			},
		});
		const res = createMockResponse();

		await controller.createJobRole(req, res);

		expect(jobRoleService.createJobRole).toHaveBeenCalledWith(
			expect.objectContaining({
				roleName: "Engineer",
			}),
		);
	});

	it("returns empty strings for non-string fields during createJobRole", async () => {
		const jobRoleService = {
			createJobRole: vi.fn().mockResolvedValue({ jobRoleId: "role-1" }),
			getCapabilities: vi.fn().mockResolvedValue([]),
			getBands: vi.fn().mockResolvedValue([]),
		} as unknown as JobRoleService;

		const controller = new JobRoleController(jobRoleService);
		const req = createMockRequest({
			body: {
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "do stuff",
				numberOfOpenPositions: "2",
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: 123,
				bandId: null,
			},
		});
		const res = createMockResponse();

		await controller.createJobRole(req, res);

		expect(jobRoleService.createJobRole).toHaveBeenCalledWith(
			expect.objectContaining({
				capabilityId: "",
				bandId: "",
			}),
		);
	});
});
