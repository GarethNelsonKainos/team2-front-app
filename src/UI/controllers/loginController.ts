import { Request, Response } from "express";
import { loginUser } from "../services/loginService.js";
import jwt from "jsonwebtoken";

export class LoginController {
	async handleLogin(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const data = await loginUser(email, password);

			if (data?.error) {
				res.status(data.status ?? 401).render("login-page", {
					token: null,
					user: null,
					error: data.error,
					activeTab: "login",
				});
				return;
			}

			if (data?.token) {
				const decodedToken: any = jwt.decode(data.token);

				res.cookie("authToken", data.token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: 24 * 60 * 60 * 1000, // 24 hours
				});
				res.redirect("/");
			} else {
				res.set("Cache-Control", "no-store");
				res.status(401).render("login-page", {
					token: null,
					user: null,
					error: "Login failed. Please try again.",
					activeTab: "login",
				});
			}
		} catch (_error) {
			res.set("Cache-Control", "no-store");
			res.status(500).render("login-page", {
				token: null,
				user: null,
				error: "Server error during login.",
				activeTab: "login",
			});
		}
	}

	handleLogout(req: Request, res: Response) {
		res.clearCookie("authToken");
		res.redirect("/");
	}
}
