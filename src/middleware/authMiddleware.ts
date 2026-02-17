import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!req.token) {
		return res.redirect("/login");
	}

	next();
};

export function decodeTokenMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (req.token) {
		try {
			const decoded = jwt.decode(req.token);
			req.user = decoded;
		} catch (err) {
			req.user = null;
		}
	} else {
		req.user = null;
	}
	next();
}

export function attachTokenMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	req.token = req.cookies?.token || null;
	next();
}
