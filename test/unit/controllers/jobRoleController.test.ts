import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../../src/controllers/jobRoleController";
import { JobRoleStatus } from "../../../src/types/JobRole";
import { JobRoleApiError } from "../../../src/services/jobRoleService";
import type { JobRoleService } from "../../../src/services/jobRoleService";
import {
	createMockRequest,
	createMockResponse,
} from "../../helpers/expressMocks";
import type { ApplicationService } from "../../../src/services/applicationService";
import type { AuthController } from "../../../src/controllers/authController";

describe("JobRoleController", () => {
	let jobRoleService: {
		getJobRoles: ReturnType<typeof vi.fn>;
		getJobRoleById: ReturnType<typeof vi.fn>;
		createJobRole: ReturnType<typeof vi.fn>;
		getCapabilities: ReturnType<typeof vi.fn>;
		getBands: ReturnType<typeof vi.fn>;
		deleteJobRole: ReturnType<typeof vi.fn>;
		checkIfUserAppliedForRole: ReturnType<typeof vi.fn>;
		updateJobRole: ReturnType<typeof vi.fn>;
	};
	let applicationServiceMock: {
		getUserApplications: ReturnType<typeof vi.fn>;
		getApplicationByJobRoleId: ReturnType<typeof vi.fn>;
	};
	let controller: JobRoleController;

	beforeEach(() => {
		jobRoleService = {
			getJobRoles: vi.fn(),
			getJobRoleById: vi.fn(),
			createJobRole: vi.fn(),
			getCapabilities: vi.fn().mockResolvedValue([]),
			getBands: vi.fn().mockResolvedValue([]),
			deleteJobRole: vi.fn(),
			checkIfUserAppliedForRole: vi.fn().mockResolvedValue(false),
			updateJobRole: vi.fn(),
		};

		applicationServiceMock = {
			getUserApplications: vi.fn().mockResolvedValue([]),
			getApplicationByJobRoleId: vi.fn().mockResolvedValue([]),
		};

		const authControllerMock = {
			isAuthenticated: vi.fn(),
		} as unknown as AuthController;

		controller = new JobRoleController(
			jobRoleService as unknown as JobRoleService,
			applicationServiceMock as unknown as ApplicationService,
			authControllerMock,
		);
	});

	it("filters job roles by status query value case-insensitively", async () => {
		jobRoleService.getJobRoles.mockResolvedValue([
			{ roleName: "Engineer", status: "Open" },
			{ roleName: "Designer", status: "Closed" },
		]);
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
		jobRoleService.getJobRoles.mockResolvedValue(roles);
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
		jobRoleService.getJobRoles.mockRejectedValue(new Error("backend down"));
		const req = createMockRequest({ query: { deleteError: "true" } });
		const res = createMockResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-no-data", {
			deleteError: "Failed to delete job role. Please check your connection.",
		});
	});

	it("renders no-data page with null deleteError when fetch fails without delete flag", async () => {
		jobRoleService.getJobRoles.mockRejectedValue(new Error("backend down"));
		const req = createMockRequest({ query: { deleteError: "false" } });
		const res = createMockResponse();

		await controller.getJobRolesPage(req, res);

		expect(res.render).toHaveBeenCalledWith("job-role-no-data", {
			deleteError: null,
		});
	});

	it("renders login prompt application state when user is not authenticated", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.OPEN },
			numberOfOpenPositions: 3,
		});
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = null;

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining(
					'Please <a href="/login?redirect=',
				),
			}),
		);
	});

	it("renders apply action when role is open and positions are available for authenticated user", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.OPEN },
			numberOfOpenPositions: 2,
		});
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
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.OPEN },
			numberOfOpenPositions: 0,
		});
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
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.IN_PROGRESS },
			numberOfOpenPositions: 1,
		});
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };
		jobRoleService.checkIfUserAppliedForRole.mockResolvedValue(true);
		applicationServiceMock.getUserApplications.mockResolvedValue([
			{ jobRoleId: "role-1", status: "IN_PROGRESS" },
		]);

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining("has been submitted"),
			}),
		);
	});

	it("falls back to request id and zero positions when role fields are missing", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			status: { statusName: JobRoleStatus.OPEN },
		});
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
		const req = createMockRequest({ params: { id: "" } });
		const res = createMockResponse();

		await controller.getJobRoleById(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith("Invalid or missing job role ID.");
	});

	it("returns 500 no-data page when fetching a specific role fails", async () => {
		jobRoleService.getJobRoleById.mockRejectedValue(new Error("backend down"));
		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.getJobRoleById(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("job-role-no-data", {
			deleteError: null,
		});
	});

	it("renders closed state message for authenticated user when role is not open", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.CLOSED },
			numberOfOpenPositions: 1,
		});
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
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.OPEN },
			numberOfOpenPositions: 2,
		});
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
		jobRoleService.createJobRole.mockResolvedValue({ jobRoleId: "role-1" });
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
		jobRoleService.deleteJobRole.mockResolvedValue(undefined);
		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.deleteJobRole(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles");
	});

	it("maps API validation errors back to form fields", async () => {
		jobRoleService.createJobRole.mockRejectedValue(
			new JobRoleApiError(400, [
				"Role name is required",
				"Capability is required",
			]),
		);
		jobRoleService.getCapabilities.mockResolvedValue([
			{ capabilityId: "cap-1", capabilityName: "Engineering" },
		]);
		jobRoleService.getBands.mockResolvedValue([
			{ bandId: "band-1", bandName: "B2" },
		]);
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
			"create-edit-role",
			expect.objectContaining({
				apiError: "Role name is required, Capability is required",
				fieldErrors: {},
			}),
		);
	});

	it("keeps apiError empty for mapped client validation errors", async () => {
		jobRoleService.createJobRole.mockRejectedValue(
			new JobRoleApiError(400, ["Role name is required"]),
		);
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
			"create-edit-role",
			expect.objectContaining({
				fieldErrors: {},
				apiError: "Role name is required",
			}),
		);
	});

	it("uses connection apiError for mapped validation errors when status is server error", async () => {
		jobRoleService.createJobRole.mockRejectedValue(
			new JobRoleApiError(503, ["Role name is required"]),
		);
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
			"create-edit-role",
			expect.objectContaining({
				fieldErrors: {},
				apiError: "Role name is required",
			}),
		);
	});

	it("shows general API error message when backend error is not field-mapped", async () => {
		jobRoleService.createJobRole.mockRejectedValue(
			new JobRoleApiError(400, ["Role already exists"]),
		);
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
			"create-edit-role",
			expect.objectContaining({
				apiError: "Role already exists",
				fieldErrors: {},
			}),
		);
	});

	it("shows connection message for non-JobRoleApiError failures during creation", async () => {
		jobRoleService.createJobRole.mockRejectedValue(new Error("socket hang up"));
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
			"create-edit-role",
			expect.objectContaining({
				apiError: "Cannot connect to server. Please check your connection.",
			}),
		);
	});

	it("renders create-role page with empty capabilities/bands when lookup fails", async () => {
		jobRoleService.getCapabilities.mockRejectedValue(new Error("down"));
		const req = createMockRequest();
		const res = createMockResponse();

		await controller.getCreateJobRolePage(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith(
			"create-edit-role",
			expect.objectContaining({
				capabilities: [],
				bands: [],
				apiError: "Cannot connect to server. Please check your connection.",
			}),
		);
	});

	it("renders open roles list on getOpenJobRoles success and fallback page on failure", async () => {
		jobRoleService.getJobRoles
			.mockResolvedValueOnce([{ roleName: "Engineer" }])
			.mockRejectedValueOnce(new Error("down"));
		const req = createMockRequest();
		const successRes = createMockResponse();
		const failureRes = createMockResponse();

		await controller.getOpenJobRoles(req, successRes);
		await controller.getOpenJobRoles(req, failureRes);

		expect(successRes.render).toHaveBeenCalledWith("job-role-list", {
			roles: [{ roleName: "Engineer" }],
		});
		expect(failureRes.render).toHaveBeenCalledWith("job-role-no-data", {
			deleteError: null,
		});
	});

	it("returns 400 when deleting without an id", async () => {
		const req = createMockRequest({ params: { id: "" } });
		const res = createMockResponse();

		await controller.deleteJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith("Invalid or missing job role ID.");
	});

	it("redirects with delete error flag when deletion fails", async () => {
		jobRoleService.deleteJobRole.mockRejectedValue(new Error("delete failed"));
		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.deleteJobRole(req, res);

		expect(res.redirect).toHaveBeenCalledWith("/job-roles?deleteError=true");
	});

	it("trims and sanitizes input during createJobRole", async () => {
		jobRoleService.createJobRole.mockResolvedValue({ jobRoleId: "role-1" });
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
		jobRoleService.createJobRole.mockResolvedValue({ jobRoleId: "role-1" });
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

	it("renders admin view with role applications and current user application", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.OPEN },
			numberOfOpenPositions: 2,
		});
		jobRoleService.checkIfUserAppliedForRole.mockResolvedValue(true);
		applicationServiceMock.getApplicationByJobRoleId.mockResolvedValue([
			{ userId: "user-1", status: "IN_PROGRESS", jobRoleId: "role-1" },
		]);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { userId: "user-1" };
		res.locals.isAdmin = true;
		res.locals.token = "token-123";

		await controller.getJobRoleById(req, res);

		expect(
			applicationServiceMock.getApplicationByJobRoleId,
		).toHaveBeenCalledWith("role-1", "token-123");
		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				isAdmin: true,
				applications: [
					{ userId: "user-1", status: "IN_PROGRESS", jobRoleId: "role-1" },
				],
				appliedForRole: true,
				applicationState: null,
			}),
		);
	});

	it("renders hired state when user has been hired", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.OPEN },
			numberOfOpenPositions: 2,
		});
		jobRoleService.checkIfUserAppliedForRole.mockResolvedValue(true);
		applicationServiceMock.getUserApplications.mockResolvedValue([
			{ jobRoleId: "role-1", status: "HIRED" },
		]);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };
		res.locals.isAdmin = false;
		res.locals.token = "token-123";

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining("have been hired"),
			}),
		);
	});

	it("renders rejected state when user has been rejected", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.OPEN },
			numberOfOpenPositions: 2,
		});
		jobRoleService.checkIfUserAppliedForRole.mockResolvedValue(true);
		applicationServiceMock.getUserApplications.mockResolvedValue([
			{ jobRoleId: "role-1", status: "REJECTED" },
		]);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };
		res.locals.isAdmin = false;
		res.locals.token = "token-123";

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({
				applicationState: expect.stringContaining("not successful"),
			}),
		);
	});

	it("sets null applicationState for unknown user application status", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			status: { statusName: JobRoleStatus.OPEN },
			numberOfOpenPositions: 2,
		});
		jobRoleService.checkIfUserAppliedForRole.mockResolvedValue(true);
		applicationServiceMock.getUserApplications.mockResolvedValue([
			{ jobRoleId: "role-1", status: "WITHDRAWN" },
		]);
		const req = createMockRequest({ params: { id: "role-1" }, query: {} });
		const res = createMockResponse();
		res.locals.user = { sub: "user-1" };
		res.locals.isAdmin = false;
		res.locals.token = "token-123";

		await controller.getJobRoleById(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"job-role-information",
			expect.objectContaining({ applicationState: null }),
		);
	});

	it("returns 400 when getEditJobRolePage is called without id", async () => {
		const req = createMockRequest({ params: { id: "" } });
		const res = createMockResponse();

		await controller.getEditJobRolePage(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith("Invalid or missing job role ID.");
	});

	it("renders edit page when getEditJobRolePage succeeds", async () => {
		jobRoleService.getJobRoleById.mockResolvedValue({
			jobRoleId: "role-1",
			roleName: "Engineer",
			description: "desc",
			sharepointUrl: "https://example.com",
			responsibilities: "do stuff",
			numberOfOpenPositions: 2,
			location: "Belfast",
			closingDate: "2026-12-31",
			capabilityId: "cap-1",
			bandId: "band-1",
		});
		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.getEditJobRolePage(req, res);

		expect(res.render).toHaveBeenCalledWith(
			"create-edit-role",
			expect.objectContaining({
				pageTitle: "Edit Role",
				formAction: "/job-roles/role-1/edit",
			}),
		);
	});

	it("returns 500 no-data page when getEditJobRolePage fails", async () => {
		jobRoleService.getJobRoleById.mockRejectedValue(new Error("down"));
		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.getEditJobRolePage(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("job-role-no-data");
	});

	it("returns 400 when updateJobRole is called without id", async () => {
		const req = createMockRequest({ params: { id: "" } });
		const res = createMockResponse();

		await controller.updateJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith("Invalid or missing job role ID.");
	});

	it("redirects to role page when updateJobRole succeeds", async () => {
		jobRoleService.updateJobRole.mockResolvedValue({ jobRoleId: "role-1" });
		const req = createMockRequest({
			params: { id: "role-1" },
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

		await controller.updateJobRole(req, res);

		expect(jobRoleService.updateJobRole).toHaveBeenCalledWith(
			"role-1",
			expect.objectContaining({ roleName: "Engineer" }),
		);
		expect(res.redirect).toHaveBeenCalledWith("/job-roles/role-1");
	});

	it("renders edit page with API error when updateJobRole fails with JobRoleApiError", async () => {
		jobRoleService.updateJobRole.mockRejectedValue(
			new JobRoleApiError(400, ["Role already exists"]),
		);
		const req = createMockRequest({
			params: { id: "role-1" },
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

		await controller.updateJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith(
			"create-edit-role",
			expect.objectContaining({
				pageTitle: "Edit Role",
				formAction: "/job-roles/role-1/edit",
				apiError: "Role already exists",
			}),
		);
	});

	it("renders edit page with connection message when updateJobRole fails with non-api error", async () => {
		jobRoleService.updateJobRole.mockRejectedValue(new Error("down"));
		const req = createMockRequest({
			params: { id: "role-1" },
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

		await controller.updateJobRole(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith(
			"create-edit-role",
			expect.objectContaining({
				pageTitle: "Edit Role",
				formAction: "/job-roles/role-1/edit",
				apiError: "Cannot connect to server. Please check your connection.",
			}),
		);
	});
});
