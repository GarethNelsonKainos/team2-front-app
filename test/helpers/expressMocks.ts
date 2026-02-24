import type { NextFunction, Request, Response } from "express";
import { vi } from "vitest";

export function createMockRequest(overrides: Partial<Request> = {}): Request {
	return {
		body: {},
		params: {},
		query: {},
		cookies: {},
		...overrides,
	} as Request;
}

export function createMockResponse(): Response {
	const res = {
		locals: {},
		status: vi.fn(),
		render: vi.fn(),
		send: vi.fn(),
		redirect: vi.fn(),
		cookie: vi.fn(),
		clearCookie: vi.fn(),
	};

	res.status.mockReturnValue(res);
	res.render.mockReturnValue(res);
	res.send.mockReturnValue(res);
	res.redirect.mockReturnValue(res);
	res.cookie.mockReturnValue(res);
	res.clearCookie.mockReturnValue(res);

	return res as unknown as Response;
}

export function createMockNext(): NextFunction {
	return vi.fn();
}
