import { Request, Response } from "express";
import { loginUser } from "../services/loginService.js";
import jwt from "jsonwebtoken";

export class LoginController {
	async handleLogin(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const data = await loginUser(email, password);
			if (data && data.token) {
				// store token in cookie
				res.cookie("token", data.token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
				});
				// decode token to get user info
				const decodedToken: any = jwt.decode(data.token);
				res.render("home-page", {
					user: decodedToken,
					showAuth: true,
				});
			} else {
				res.status(401).render("login-page", {
					error: "Invalid email or password.",
				});
			}
		} catch (_error) {
			res.status(500).render("login-page", {
				error: "Server error during login.",
			});
		}
	}
}
