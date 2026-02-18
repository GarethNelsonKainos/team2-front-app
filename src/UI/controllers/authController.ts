import type { Request, Response } from "express";
import type { AuthService } from "../services/authService.js";

export class AuthController {
	private authService: AuthService;
	constructor(authService: AuthService) {
		this.authService = authService;
	}

	async getLoginPage(_req: Request, res: Response) {
		res.render("login-page", { token: null, activeTab: "login" });
	}

	async logout(_req: Request, res: Response) {
		res.clearCookie("token");
		res.redirect("/login");
	}

	async getRegisterPage(_req: Request, res: Response) {
		res.render("login-page", {
			token: null,
			activeTab: "register",
		});
	}

	async postLogin(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const data = await this.authService.login(email, password);
			if (data?.token) {
				// store token in cookie
				res.cookie("token", data.token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
				});
				return res.redirect("/");
			} else {
				res.status(401).render("login-page", {
					token: null,
					error: "Login failed. Please try again.",
					activeTab: "login",
				});
			}
		} catch (_error) {
			res.status(500).render("login-page", {
				error: "Server error during login.",
				activeTab: "login",
			});
		}
	}

	async postRegister(req: Request, res: Response) {
		try {
			const RegistrationRequest = req.body;

			const data = await this.authService.register(RegistrationRequest);

			if (data?.error) {
				res.status(data.status ?? 400).render("login-page", {
					token: null,
					error: data.error,
					activeTab: "register",
				});
				return;
			}

			if (data?.token) {
				res.cookie("token", data.token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
				});
				res.render("home-page", {
					showAuth: true,
					user: res.locals.user,
				});
				return;
			} else {
				res.status(400).render("login-page", {
					token: null,
					error: "Registration failed. Please try again.",
					activeTab: "register",
				});
			}
		} catch (_error) {
			res.status(500).render("login-page", {
				token: null,
				error: "Server error during registration.",
				activeTab: "register",
			});
		}
	}
}
