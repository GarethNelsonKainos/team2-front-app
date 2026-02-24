import { describe, expect, it, vi } from "vitest";
import { ApplicationController } from "../../../src/controllers/applicationController";
import type { ApplicationService } from "../../../src/services/applicationService";
import type { JobRoleService } from "../../../src/services/jobRoleService";
import {
	createMockRequest,
	createMockResponse,
} from "../../helpers/expressMocks";

describe("ApplicationController", () => {
	it("returns 400 when job role id param is undefined", async () => {
		const applicationService = {
			processApplication: vi.fn(),
		} as unknown as ApplicationService;
		const jobRoleService = {
			getJobRoleById: vi.fn(),
		} as unknown as JobRoleService;
		const controller = new ApplicationController(
			applicationService,
			jobRoleService,
		);

		const req = createMockRequest({ params: {} });
		const res = createMockResponse();

		await controller.getApplicationForm(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith("Invalid or missing job role ID.");
	});

	it("returns 400 for missing job role id on application form route", async () => {
		const applicationService = {
			processApplication: vi.fn(),
		} as unknown as ApplicationService;
		const jobRoleService = {
			getJobRoleById: vi.fn(),
		} as unknown as JobRoleService;
		const controller = new ApplicationController(
			applicationService,
			jobRoleService,
		);

		const req = createMockRequest({ params: { id: "" } });
		const res = createMockResponse();

		await controller.getApplicationForm(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith("Invalid or missing job role ID.");
	});

	it("renders application form when a valid role is found", async () => {
		const role = { jobRoleId: "role-1", status: "Open" };
		const applicationService = {
			processApplication: vi.fn(),
		} as unknown as ApplicationService;
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue(role),
		} as unknown as JobRoleService;
		const controller = new ApplicationController(
			applicationService,
			jobRoleService,
		);

		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.getApplicationForm(req, res);

		expect(res.render).toHaveBeenCalledWith("application-form", {
			jobRoleId: "role-1",
			role,
		});
	});

	it("returns 404 when requested job role does not exist", async () => {
		const applicationService = {
			processApplication: vi.fn(),
		} as unknown as ApplicationService;
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue(null),
		} as unknown as JobRoleService;
		const controller = new ApplicationController(
			applicationService,
			jobRoleService,
		);

		const req = createMockRequest({ params: { id: "role-404" } });
		const res = createMockResponse();

		await controller.getApplicationForm(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.send).toHaveBeenCalledWith("Job role not found.");
	});

	it("renders no-data page when role lookup fails", async () => {
		const applicationService = {
			processApplication: vi.fn(),
		} as unknown as ApplicationService;
		const jobRoleService = {
			getJobRoleById: vi
				.fn()
				.mockRejectedValue(new Error("backend unavailable")),
		} as unknown as JobRoleService;
		const controller = new ApplicationController(
			applicationService,
			jobRoleService,
		);

		const req = createMockRequest({ params: { id: "role-1" } });
		const res = createMockResponse();

		await controller.getApplicationForm(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("job-role-no-data");
	});

	it("returns a validation error when no CV file is uploaded", async () => {
		const role = { jobRoleId: "role-1", status: "Open" };
		const applicationService = {
			processApplication: vi.fn(),
		} as unknown as ApplicationService;
		const jobRoleService = {
			getJobRoleById: vi.fn().mockResolvedValue(role),
		} as unknown as JobRoleService;
		const controller = new ApplicationController(
			applicationService,
			jobRoleService,
		);

		const req = createMockRequest({
			body: { jobRoleId: "role-1", userId: "user-1" },
			file: undefined,
		});
		const res = createMockResponse();

		await controller.handleApplicationSubmit(req, res);

		expect(jobRoleService.getJobRoleById).toHaveBeenCalledWith("role-1");
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("application-form", {
			jobRoleId: "role-1",
			error: "No file uploaded.",
			role,
		});
	});

	it("submits application and redirects on success", async () => {
		const applicationService = {
			processApplication: vi.fn().mockResolvedValue({ ok: true }),
		} as unknown as ApplicationService;
		const jobRoleService = {
			getJobRoleById: vi.fn(),
		} as unknown as JobRoleService;
		const controller = new ApplicationController(
			applicationService,
			jobRoleService,
		);

		const file = {
			buffer: Buffer.from("cv-content"),
			originalname: "cv.pdf",
			mimetype: "application/pdf",
		} as Express.Multer.File;

		const req = createMockRequest({
			body: { jobRoleId: "role-1", userId: "user-1" },
			file,
		});
		const res = createMockResponse();
		res.locals.token = "token-123";

		await controller.handleApplicationSubmit(req, res);

		expect(applicationService.processApplication).toHaveBeenCalledWith({
			jobRoleId: "role-1",
			userId: "user-1",
			file,
			token: "token-123",
		});
		expect(res.redirect).toHaveBeenCalledWith(
			"/job-roles/role-1?applicationSuccess=true",
		);
	});

	it("renders error page when application submission fails", async () => {
		const applicationService = {
			processApplication: vi.fn().mockRejectedValue(new Error("upload failed")),
		} as unknown as ApplicationService;
		const jobRoleService = {
			getJobRoleById: vi.fn(),
		} as unknown as JobRoleService;
		const controller = new ApplicationController(
			applicationService,
			jobRoleService,
		);

		const req = createMockRequest({
			body: { jobRoleId: "role-1", userId: "user-1" },
			file: {
				buffer: Buffer.from("cv-content"),
				originalname: "cv.pdf",
				mimetype: "application/pdf",
			} as Express.Multer.File,
		});
		const res = createMockResponse();
		res.locals.token = "token-123";

		await controller.handleApplicationSubmit(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("application-form", {
			jobRoleId: "role-1",
			error: "Failed to submit application.",
		});
	});
});
