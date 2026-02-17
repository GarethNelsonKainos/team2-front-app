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
	const token = req.cookies?.authToken;
	if (token) {
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) {
			return next();
		}
		try {
			const decodedToken = jwt.verify(token, jwtSecret);
			if (decodedToken && typeof decodedToken === "object") {
				req.user = decodedToken as { role: string; [key: string]: unknown };
			}
		} catch {
			// Invalid token, do not set req.user
		}
	}
	return next();
}
