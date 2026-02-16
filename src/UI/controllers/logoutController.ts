import { Request, Response } from "express";

export class LogoutController {
	handleLogout(req: Request, res: Response) {
		res.clearCookie("token");
		res.redirect("/login");
	}
}
