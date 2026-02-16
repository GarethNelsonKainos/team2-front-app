import { Request, Response } from "express";
import { loginUser } from "../services/loginService";
import jwt from "jsonwebtoken";

export class LoginController {
	async handleLogin(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			console.log(email, password);
			const data = await loginUser(email, password);
			if (data && data.token) {
				const decodedToken: any = jwt.decode(data.token);

				res.cookie("authToken", data.token, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "strict",
					maxAge: 24 * 60 * 60 * 1000, // 24 hours
				});
				res.redirect("/");
				console.log("Decoded token:", decodedToken);
				console.log("Login successful, token received:", data.token);
			} else {
				res.set("Cache-Control", "no-store");
				res.status(401).render("home-page", {
					showLoginModal: true,
					token: null,
					user: null,
					error: "Invalid email or password.",
				});
			}
		} catch (_error) {
			res.set("Cache-Control", "no-store");
			res.status(500).render("home-page", {
				showLoginModal: true,
				token: null,
				user: null,
				error: "Server error during login.",
			});
		}
	}

	handleLogout(req: Request, res: Response) {
		res.clearCookie("authToken");
		res.redirect("/");
	}
}
