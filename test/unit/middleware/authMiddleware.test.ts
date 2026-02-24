import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import {
	authMiddleware,
	decodeTokenMiddleware,
} from "../../../src/middleware/authMiddleware";
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
