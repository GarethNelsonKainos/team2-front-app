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

	if (req.body && req.body.user) {
		try {
			req.user =
				typeof req.body.user === "string"
					? JSON.parse(req.body.user)
					: req.body.user;
			return next();
		} catch {

		}
	}

	if (req.query && req.query.user) {
		try {
			req.user =
				typeof req.query.user === "string"
					? JSON.parse(req.query.user)
					: req.query.user;
			return next();
		} catch {

		}
	}

	next();
}
