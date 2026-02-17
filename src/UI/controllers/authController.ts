import { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import jwt from "jsonwebtoken";

export class AuthController {
	private authService: AuthService;

	constructor(authService: AuthService) {
		this.authService = authService;
	}

	async getLoginPage(req: Request, res: Response) {
		res.render("login-page", { user: null, token: null, activeTab: "login" });
	}

	async logout(req: Request, res: Response) {
		res.clearCookie("token");
		res.redirect("/login");
	}

	async getRegisterPage(req: Request, res: Response) {
		res.render("login-page", {
			user: null,
			token: null,
			activeTab: "register",
		});
	}

	async postLogin(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const data = await this.authService.login(email, password);
			if (data && data.token) {
				// store token in cookie
				res.cookie("token", data.token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
				});
				res.render("home-page", {
					user: req.user,
					showAuth: true,
				});
			} else {
				res.status(401).render("login-page", {
					token: null,
					user: null,
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
			const { firstName, secondName, email, password, confirmedPassword } =
				req.body;

			const data = await this.authService.register(
				firstName,
				secondName,
				email,
				password,
				confirmedPassword,
			);

			if (data?.error) {
				res.status(data.status ?? 400).render("login-page", {
					token: null,
					user: null,
					error: data.error,
					activeTab: "register",
				});
				return;
			}

			if (data?.token) {
				res.render("home-page", {
					token: data.token,
					user: req.user,
				});
			} else {
				res.status(400).render("login-page", {
					token: null,
					user: null,
					error: "Registration failed. Please try again.",
					activeTab: "register",
				});
			}
		} catch (_error) {
			res.status(500).render("login-page", {
				token: null,
				user: null,
				error: "Server error during registration.",
				activeTab: "register",
			});
		}
	}
}
