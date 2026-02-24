import axios from "axios";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthService } from "../../../src/services/authService";
import type RegistrationRequest from "../../../src/types/RegistrationRequest";

vi.mock("axios", () => ({
	default: {
		post: vi.fn(),
		get: vi.fn(),
		isAxiosError: vi.fn(),
	},
	isAxiosError: vi.fn(),
}));

describe("AuthService", () => {
	const service = new AuthService();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns login payload on successful login", async () => {
		vi.mocked(axios.post).mockResolvedValue({ data: { token: "abc" } });

		const result = await service.login("user@test.com", "Password123!");

		expect(result).toEqual({ token: "abc" });
		expect(axios.post).toHaveBeenCalledWith(expect.stringContaining("/login"), {
			email: "user@test.com",
			password: "Password123!",
		});
	});

	it("returns validation error for invalid login input", async () => {
		const result = await service.login("invalid-email", "Password123!");

		expect(result).toMatchObject({
			status: 400,
			error: "Invalid email format",
		});
	});

	it("returns axios login error response on request failure", async () => {
		vi.mocked(axios.isAxiosError).mockReturnValue(true);
		vi.mocked(axios.post).mockRejectedValue(new Error("network"));

		const result = await service.login("user@test.com", "Password123!");

		expect(result).toEqual({
			status: 500,
			error: "An error occurred during login. Please try again.",
		});
	});

	it("returns unexpected login error response for non-axios failures", async () => {
		vi.mocked(axios.isAxiosError).mockReturnValue(false);
		vi.mocked(axios.post).mockRejectedValue(new Error("boom"));

		const result = await service.login("user@test.com", "Password123!");

		expect(result).toEqual({
			status: 500,
			error: "An unexpected error occurred. Please try again.",
		});
	});

	it("returns registration payload on successful registration", async () => {
		const request: RegistrationRequest = {
			firstName: "Alex",
			secondName: "Parker",
			email: "alex@example.com",
			password: "StrongPass!1",
			confirmedPassword: "StrongPass!1",
		};
		vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

		const result = await service.register(request);

		expect(result).toEqual({ success: true });
		expect(axios.post).toHaveBeenCalledWith(
			expect.stringContaining("/register"),
			request,
		);
	});

	it("returns validation error for invalid registration input", async () => {
		const request: RegistrationRequest = {
			firstName: "Alex",
			secondName: "Parker",
			email: "alex@example.com",
			password: "weakpass",
			confirmedPassword: "weakpass",
		};

		const result = await service.register(request);

		expect(result).toMatchObject({
			status: 400,
			error: "Password must be more than 8 characters",
		});
	});

	it("returns axios registration error response on request failure", async () => {
		const request: RegistrationRequest = {
			firstName: "Alex",
			secondName: "Parker",
			email: "alex@example.com",
			password: "StrongPass!1",
			confirmedPassword: "StrongPass!1",
		};
		vi.mocked(axios.isAxiosError).mockReturnValue(true);
		vi.mocked(axios.post).mockRejectedValue(new Error("network"));

		const result = await service.register(request);

		expect(result).toEqual({
			status: 500,
			error: "An error occurred during registration. Please try again.",
		});
	});

	it("returns true when userRoleFlag request succeeds", async () => {
		vi.mocked(axios.get).mockResolvedValue({ data: {} });

		const result = await service.userRoleFlag("token-1", "user-1");

		expect(result).toBe(true);
		expect(axios.get).toHaveBeenCalledWith(
			expect.stringContaining("/admin/job-roles/user-1"),
			expect.objectContaining({
				headers: { Authorization: "Bearer token-1" },
			}),
		);
	});

	it("returns false when userRoleFlag receives 403", async () => {
		vi.mocked(axios.isAxiosError).mockReturnValue(true);
		vi.mocked(axios.get).mockRejectedValue({
			response: { status: 403 },
		});

		const result = await service.userRoleFlag("token-1", "user-1");

		expect(result).toBe(false);
	});

	it("returns false when userRoleFlag fails with non-403 error", async () => {
		vi.mocked(axios.isAxiosError).mockReturnValue(true);
		vi.mocked(axios.get).mockRejectedValue({
			response: { status: 500 },
		});

		const result = await service.userRoleFlag("token-1", "user-1");

		expect(result).toBe(false);
	});
});
