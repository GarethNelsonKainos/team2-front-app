import { Request, Response } from "express";
import { loginUser } from "../services/loginService.js";
import jwt from "jsonwebtoken";

export class LoginController {
	async handleLogin(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			console.log(email, password);
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
				res.render("home-page", {
					token: data.token,
					user: decodedToken,
				});
				console.log("Decoded token:", decodedToken);
				console.log("Login successful, token received:", data.token);
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
				token: null,
				user: null,
				error: "Server error during login.",
				activeTab: "login",
			});
		}
	}
}
