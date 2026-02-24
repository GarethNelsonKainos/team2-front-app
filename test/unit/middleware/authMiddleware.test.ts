import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import {
	authMiddleware,
	checkAdminMiddleware,
	decodeTokenMiddleware,
} from "../../../src/middleware/authMiddleware";
import { AuthService } from "../../../src/services/authService";
import {
	createMockNext,
	createMockRequest,
	createMockResponse,
} from "../../helpers/expressMocks";

describe("authMiddleware", () => {
	it("redirects to login when token cookie is missing", () => {
		const req = createMockRequest({ cookies: {} });
		const res = createMockResponse();
		const next = createMockNext();

		authMiddleware(req, res, next);

		expect(res.redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("calls next when token cookie exists", () => {
		const req = createMockRequest({ cookies: { token: "abc" } });
		const res = createMockResponse();
		const next = createMockNext();

		authMiddleware(req, res, next);

		expect(next).toHaveBeenCalledOnce();
		expect(res.redirect).not.toHaveBeenCalled();
	});
});

describe("decodeTokenMiddleware", () => {
	it("sets user and token to null when token cookie is missing", () => {
		const req = createMockRequest({ cookies: {} });
		const res = createMockResponse();
		const next = createMockNext();

		decodeTokenMiddleware(req, res, next);

		expect(res.locals.user).toBeNull();
		expect(res.locals.token).toBeNull();
		expect(next).toHaveBeenCalledOnce();
	});

	it("stores decoded user and token when token cookie exists", () => {
		const token = jwt.sign(
			{ sub: "user-123", email: "alex@example.com" },
			"secret",
		);
		const req = createMockRequest({ cookies: { token } });
		const res = createMockResponse();
		const next = createMockNext();

		decodeTokenMiddleware(req, res, next);

		expect(res.locals.token).toBe(token);
		expect(res.locals.user).toMatchObject({
			sub: "user-123",
			email: "alex@example.com",
		});
		expect(next).toHaveBeenCalledOnce();
	});

	it("falls back to null user/token when decoding throws", () => {
		const decodeSpy = vi.spyOn(jwt, "decode").mockImplementationOnce(() => {
			throw new Error("decode failed");
		});
		const req = createMockRequest({ cookies: { token: "bad-token" } });
		const res = createMockResponse();
		const next = createMockNext();

		decodeTokenMiddleware(req, res, next);

		expect(res.locals.user).toBeNull();
		expect(res.locals.token).toBeNull();
		expect(next).toHaveBeenCalledOnce();
		decodeSpy.mockRestore();
	});
});

describe("checkAdminMiddleware", () => {
	it("sets isAdmin to false when user is missing", async () => {
		const userRoleFlagSpy = vi.spyOn(AuthService.prototype, "userRoleFlag");
		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();
		res.locals.user = null;

		await checkAdminMiddleware(req, res, next);

		expect(res.locals.isAdmin).toBe(false);
		expect(userRoleFlagSpy).not.toHaveBeenCalled();
		expect(next).toHaveBeenCalledOnce();
		userRoleFlagSpy.mockRestore();
	});

	it("sets isAdmin based on userRoleFlag when user exists", async () => {
		const userRoleFlagSpy = vi
			.spyOn(AuthService.prototype, "userRoleFlag")
			.mockResolvedValueOnce(true);
		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();
		res.locals.user = { id: "user-1" };
		res.locals.token = "token-123";

		await checkAdminMiddleware(req, res, next);

		expect(userRoleFlagSpy).toHaveBeenCalledWith("token-123", "user-1");
		expect(res.locals.isAdmin).toBe(true);
		expect(next).toHaveBeenCalledOnce();
		userRoleFlagSpy.mockRestore();
	});

	it("falls back to isAdmin false when userRoleFlag throws", async () => {
		const userRoleFlagSpy = vi
			.spyOn(AuthService.prototype, "userRoleFlag")
			.mockRejectedValueOnce(new Error("down"));
		const req = createMockRequest();
		const res = createMockResponse();
		const next = createMockNext();
		res.locals.user = { id: "user-1" };
		res.locals.token = "token-123";

		await checkAdminMiddleware(req, res, next);

		expect(res.locals.isAdmin).toBe(false);
		expect(next).toHaveBeenCalledOnce();
		userRoleFlagSpy.mockRestore();
	});
});
