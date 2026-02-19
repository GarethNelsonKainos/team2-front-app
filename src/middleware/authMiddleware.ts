import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthService } from "../services/authService.js";

const authService = new AuthService();

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (!req.cookies?.token) {
		return res.redirect("/login");
	}

	next();
};

export function decodeTokenMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const token = req.cookies?.token;

	if (!token) {
		res.locals.user = null;
		res.locals.token = null;
		return next();
	}

	try {
		const decoded = jwt.decode(token);
		res.locals.user = decoded;
		res.locals.token = token;
		next();
	} catch (error) {
		console.error("Error decoding token: ", error);
		res.locals.user = null;
		res.locals.token = null;
		next();
	}
}

export const checkAdminMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const user = res.locals.user;
	if (!user) {
		res.locals.isAdmin = false;
		return next();
	}
	try {
		res.locals.isAdmin = await authService.userRoleFlag(res.locals.token, user.id);
	} catch (error) {
		console.error("Error checking admin role: ", error);
		res.locals.isAdmin = false;
	}
	next();
};