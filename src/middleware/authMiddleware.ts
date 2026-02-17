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
	if (!token) {
		return _res.redirect('/unauthorised');
	}
	try {
		const decodedToken: any = jwt.decode(token);
		if (decodedToken) {
			req.user = decodedToken;
			return next();
		}
	} catch {
		return _res.redirect('/unauthorised');
	}
}
