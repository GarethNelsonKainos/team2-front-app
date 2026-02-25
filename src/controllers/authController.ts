import type { Request, Response } from "express";
import type { AuthService } from "../services/authService.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const ALLOWED_REDIRECTS = ["http://localhost:3001"];

const isAllowedRedirectURL = (url: string): boolean => {
	return ALLOWED_REDIRECTS.some((allowed) => url.startsWith(allowed));
};

export class AuthController {
	private authService: AuthService;
	constructor(authService: AuthService) {
		this.authService = authService;
	}

	async getLoginPage(req: Request, res: Response) {
		const redirect = req.query.redirect ? String(req.query.redirect) : null;
		res.render("login-page", { activeTab: "login", redirectTo: redirect });
	}

	async logout(_req: Request, res: Response) {
		res.clearCookie("token");
		res.redirect("/login");
	}

	async getRegisterPage(_req: Request, res: Response) {
		res.render("login-page", {
			activeTab: "register",
			redirectTo: null,
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
				const redirectTo = req.body.redirect;
				if (redirectTo && isAllowedRedirectURL(redirectTo)) {
					return res.redirect(redirectTo);
				}
				return res.redirect("/home");
			} else {
				res.status(401).render("login-page", {
					error: "Login failed. Please try again.",
					activeTab: "login",
					redirectTo: null,
				});
			}
		} catch (_error) {
			res.status(500).render("login-page", {
				error: "Server error during login.",
				activeTab: "login",
				redirectTo: null,
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
					redirectTo: null,
				});
				return;
			}

			if (data?.token) {
				res.cookie("token", data.token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
				});
				const redirectTo = req.query.redirect
					? String(req.query.redirect)
					: "/home";
				res.redirect(redirectTo);
				return;
			} else {
				res.status(400).render("login-page", {
					token: null,
					error: "Registration failed. Please try again.",
					activeTab: "register",
					redirectTo: null,
				});
			}
		} catch (_error) {
			res.status(500).render("login-page", {
				token: null,
				error: "Server error during registration.",
				activeTab: "register",
				redirectTo: null,
			});
		}
	}
}
