import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
	user?: {
		role: string;
		[key: string]: unknown;
	};
	cookies?: {
		authToken?: string;
		[key: string]: unknown;
	};
};

export function authMiddleware(
	req: AuthenticatedRequest,
	_res: Response,
	next: NextFunction,
) {
	// Try to get user from JWT token in cookie
	const token = req.cookies?.authToken;
	if (token) {
		try {
			const decodedToken: any = jwt.decode(token);
			if (decodedToken) {
				req.user = decodedToken;
				return next();
			}
		} catch {
			// Token decoding failed, continue without user
		}
	}

	// Fallback: Extract user from request body (from form submissions)
	if (req.body && req.body.user) {
		try {
			req.user =
				typeof req.body.user === "string"
					? JSON.parse(req.body.user)
					: req.body.user;
			return next();
		} catch {
			// User extraction failed, continue
		}
	}

	// Fallback: Extract user from query parameters
	if (req.query && req.query.user) {
		try {
			req.user =
				typeof req.query.user === "string"
					? JSON.parse(req.query.user)
					: req.query.user;
			return next();
		} catch {
			// User extraction failed, continue
		}
	}

	next();
}
