import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	JobRoleApiError,
	JobRoleService,
} from "../../../src/services/jobRoleService";

vi.mock("axios", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		delete: vi.fn(),
		isAxiosError: vi.fn(),
	},
	isAxiosError: vi.fn(),
}));

describe("JobRoleService", () => {
	const service = new JobRoleService();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns job roles from API", async () => {
		vi.mocked(axios.get).mockResolvedValue({
			data: [{ roleName: "Engineer" }],
		});

		const result = await service.getJobRoles();

		expect(result).toEqual([{ roleName: "Engineer" }]);
	});

	it("throws when getJobRoles request fails", async () => {
		vi.mocked(axios.get).mockRejectedValue(new Error("network"));

		await expect(service.getJobRoles()).rejects.toThrow(
			"Failed to fetch job roles",
		);
	});

	it("returns a single job role from API", async () => {
		vi.mocked(axios.get).mockResolvedValue({ data: { jobRoleId: "role-1" } });

		const result = await service.getJobRoleById("role-1");

		expect(result).toEqual({ jobRoleId: "role-1" });
	});

	it("throws when getJobRoleById request fails", async () => {
		vi.mocked(axios.get).mockRejectedValue(new Error("network"));

		await expect(service.getJobRoleById("role-1")).rejects.toThrow(
			"Failed to fetch job role",
		);
	});

	it("returns capabilities from API", async () => {
		vi.mocked(axios.get).mockResolvedValue({
			data: [{ capabilityId: "cap-1", capabilityName: "Engineering" }],
		});

		const result = await service.getCapabilities();

		expect(result).toEqual([
			{ capabilityId: "cap-1", capabilityName: "Engineering" },
		]);
	});

	it("throws when getCapabilities request fails", async () => {
		vi.mocked(axios.get).mockRejectedValue(new Error("network"));

		await expect(service.getCapabilities()).rejects.toThrow(
			"Failed to fetch capabilities",
		);
	});

	it("returns bands from API", async () => {
		vi.mocked(axios.get).mockResolvedValue({
			data: [{ bandId: "band-1", bandName: "B2" }],
		});

		const result = await service.getBands();

		expect(result).toEqual([{ bandId: "band-1", bandName: "B2" }]);
	});

	it("throws when getBands request fails", async () => {
		vi.mocked(axios.get).mockRejectedValue(new Error("network"));

		await expect(service.getBands()).rejects.toThrow("Failed to fetch bands");
	});

	it("creates a new job role and returns API response", async () => {
		const payload = {
			roleName: "Engineer",
			description: "desc",
			sharepointUrl: "https://example.com",
			responsibilities: "build features",
			numberOfOpenPositions: 2,
			location: "Belfast",
			closingDate: "2026-12-31",
			capabilityId: "cap-1",
			bandId: "band-1",
		};
		vi.mocked(axios.post).mockResolvedValue({ data: { jobRoleId: "role-1" } });

		const result = await service.createJobRole(payload);

		expect(result).toEqual({ jobRoleId: "role-1" });
	});

	it("throws mapped JobRoleApiError when backend returns errors array", async () => {
		const axiosError = {
			response: {
				status: 400,
				data: { errors: ["Role name is required"] },
			},
		};
		vi.mocked(axios.isAxiosError).mockReturnValue(true);
		vi.mocked(axios.post).mockRejectedValue(axiosError);

		await expect(
			service.createJobRole({
				roleName: "",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "build features",
				numberOfOpenPositions: 2,
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			}),
		).rejects.toMatchObject({
			name: "JobRoleApiError",
			status: 400,
			errors: ["Role name is required"],
		});
	});

	it("throws mapped JobRoleApiError when backend returns single error string", async () => {
		const axiosError = {
			response: {
				status: 400,
				data: { error: "Invalid SharePoint URL format" },
			},
		};
		vi.mocked(axios.isAxiosError).mockReturnValue(true);
		vi.mocked(axios.post).mockRejectedValue(axiosError);

		await expect(
			service.createJobRole({
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "bad-url",
				responsibilities: "build features",
				numberOfOpenPositions: 2,
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			}),
		).rejects.toBeInstanceOf(JobRoleApiError);
	});

	it("falls back to default error when backend response has no error fields", async () => {
		const axiosError = {
			response: {
				status: 400,
				data: {},
			},
		};
		vi.mocked(axios.isAxiosError).mockReturnValue(true);
		vi.mocked(axios.post).mockRejectedValue(axiosError);

		await expect(
			service.createJobRole({
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "build features",
				numberOfOpenPositions: 2,
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			}),
		).rejects.toMatchObject({
			name: "JobRoleApiError",
			status: 400,
			errors: ["Failed to create job role"],
		});
	});

	it("throws service-unavailable error when createJobRole cannot reach server", async () => {
		vi.mocked(axios.isAxiosError).mockReturnValue(false);
		vi.mocked(axios.post).mockRejectedValue(new Error("socket hang up"));

		await expect(
			service.createJobRole({
				roleName: "Engineer",
				description: "desc",
				sharepointUrl: "https://example.com",
				responsibilities: "build features",
				numberOfOpenPositions: 2,
				location: "Belfast",
				closingDate: "2026-12-31",
				capabilityId: "cap-1",
				bandId: "band-1",
			}),
		).rejects.toMatchObject({
			name: "JobRoleApiError",
			status: 503,
		});
	});

	it("deletes a job role successfully", async () => {
		vi.mocked(axios.delete).mockResolvedValue({ data: {} });

		await expect(service.deleteJobRole("role-1")).resolves.toBeUndefined();
	});

	it("throws when deleting a job role fails", async () => {
		vi.mocked(axios.delete).mockRejectedValue(new Error("network"));

		await expect(service.deleteJobRole("role-1")).rejects.toThrow(
			"Failed to delete job role",
		);
	});
});
